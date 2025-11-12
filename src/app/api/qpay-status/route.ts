import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  try {
    const { token, invoice_id, cartItems, amount, formData, isDelivered } =
      await req.json();

    if (!token || !invoice_id) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters",
          status: "Failed" 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Prepare request body according to QPay API documentation
    const requestBody = {
      object_type: "INVOICE",
      object_id: invoice_id,
      // Optional offset parameter for pagination
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    };

    console.log("🔍 QPay Status Check Request:", {
      invoice_id,
      object_type: "INVOICE",
    });

    const response = await fetch(`https://merchant.qpay.mn/v2/payment/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Get response text first to handle both JSON and text responses
    const responseText = await response.text();
    console.log("📥 QPay Status Check Response Status:", response.status);
    console.log("📥 QPay Status Check Response:", responseText);

    if (!response.ok) {
      console.error("❌ QPay API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      
      // Try to parse as JSON, fallback to text
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      return new Response(
        JSON.stringify({
          status: "Failed",
          error: errorData.message || errorData.msgList || responseText,
          httpStatus: response.status,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse QPay response as JSON:", parseError);
      return new Response(
        JSON.stringify({
          status: "Failed",
          error: "Invalid response format from QPay API",
          rawResponse: responseText,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ QPay Status Check Data:", {
      count: data.count,
      paid_amount: data.paid_amount,
      rows_count: data.rows?.length || 0,
      payment_status: data.rows?.[0]?.payment_status,
    });

    // Check payment status according to QPay API documentation
    // Response structure: { count, paid_amount, rows[] }
    // Each row has: payment_id, payment_status, payment_date, payment_fee, 
    // payment_amount, payment_currency, payment_wallet, transaction_type
    const paymentStatus = data.rows?.[0]?.payment_status;
    const paidAmount = data.paid_amount || 0;
    const count = data.count || 0;

    console.log("💳 Payment Status:", {
      payment_status: paymentStatus,
      paid_amount: paidAmount,
      count: count,
    });

    if (paymentStatus === "PAID") {
      // Get the email cookie and decode it
      const emailCookie = req.cookies.get("clientEmail")?.value;
      if (!emailCookie) {
        return new Response(
          JSON.stringify({ 
            error: "Email cookie is missing",
            status: "Failed" 
          }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Decode the email from the cookie (URL-decoding)
      const email = decodeURIComponent(emailCookie);
      if (!email || !email.includes("@")) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid email address",
            status: "Failed" 
          }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Send email
      // Sort cart items: "instock" first, then "onbackorder"
      // Determine the checkout type message
      const checkoutType = `<p><strong>Худалдан авалтын төрөл:</strong> ${
        isDelivered ? "Хүргэлтээр" : "Бэлэнээр"
      }</p>`;

      // Sort cart items: "instock" first, then "onbackorder"
      const sortedCartItems = [
        ...cartItems.filter((item: any) => item.stock_status === "instock"),
        ...cartItems.filter((item: any) => item.stock_status === "onbackorder"),
      ];

      // Format cart items into readable HTML
      const cartItemsList = sortedCartItems
        .map(
          (item: any) =>
            `<p><strong>${item.name}</strong> (Барааны код: ${item.id}) - ${
              item.price
            }₮, Ширхэг: ${item.quantity} <em>(${
              item.stock_status === "onbackorder" ? "Захиалгаар" : "Бэлэн"
            })</em></p>`
        )
        .join("");

      // Check if there are any "onbackorder" items
      const hasBackorderItems = cartItems.some(
        (item: any) => item.stock_status === "onbackorder"
      );

      // If there are backorder items, include form data in the email
      const formDataSection =
        hasBackorderItems || isDelivered
          ? `
	  <h4>Захиалгын мэдээлэл:</h4>
	  <p><strong>Хаяг:</strong> ${formData.address}</p>
	  <p><strong>Утас 1:</strong> ${formData.phone}</p>
	  <p><strong>Утас 2:</strong> ${formData.phone2}</p>
	  <p><strong>Имэйл:</strong> ${formData.email}</p>
	`
          : "";

      // Generate order number
      let orderNumber = "";
      try {
        // Get the base URL from the request
        const url = new URL(req.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        const orderRes = await fetch(`${baseUrl}/api/generate-order-number`);
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          orderNumber = orderData.orderNumber;
        } else {
          // Fallback to date-based number if API fails
          const now = new Date();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          const timestamp = Date.now().toString().slice(-4);
          orderNumber = `${month}${day}${timestamp}`;
        }
      } catch (error) {
        console.error("Error generating order number:", error);
        // Fallback to date-based number
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const timestamp = Date.now().toString().slice(-4);
        orderNumber = `${month}${day}${timestamp}`;
      }

      // Send email
      try {
        await sendEmail({
          to: email,
          subject: "Шинэ худалдан авалт баталгаажлаа!",
          html: `
	  <p>Үйлчлүүлэгчийн <strong>${amount}₮</strong>-ийн худалдан авалтын нэхэмжлэл амжилттай үүсгэгдлээ.</p>
	  <p><strong>Захиалгын дугаар:</strong> ${orderNumber}</p>
	  ${checkoutType}
	  <h4>Сагсанд байгаа бүтээгдэхүүнүүд:</h4>
	  ${cartItemsList}
	  ${formDataSection}
	`,
        });
      } catch (emailError) {
        console.error("❌ Failed to send email:", emailError);
        // Continue even if email fails - payment is still successful
      }

      // Return the full response data for the client to handle, including orderNumber
      const responseData: any = { ...data };
      if (orderNumber) {
        responseData.orderNumber = orderNumber;
      }
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the full response data for the client to handle
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ QPay Status Check Error:", error);
    return new Response(
      JSON.stringify({
        status: "Failed",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
