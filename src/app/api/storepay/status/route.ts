import { sendEmail } from "@/lib/sendEmail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 StorePay Callback Data:", body);

    const { token, cartItems, amount, formData, isDelivered } = body;
    const requestId = String(body.requestId); // Ensure it's a string

    console.log("🔍 Checking payment status for invoice number:", requestId);

    if (!token || !requestId) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const apiUrl = `https://service.storepay.mn/merchant/loan/check/${requestId}`;
    console.log("🔗 API Request URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const textData = await response.text();
    console.log("🔍 StorePay Raw Response:", textData);

    if (response.status === 404) {
      console.error(
        "❌ 404 Not Found: The API URL or invoice number is incorrect."
      );
      return NextResponse.json(
        { status: "Failed", msg: "API endpoint not found" },
        { status: 404 }
      );
    }

    if (!response.ok) {
      console.log("❌ API returned error:", textData);
      return NextResponse.json(
        { status: "Failed", msg: "API request failed" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = JSON.parse(textData);

      if (data.status === "Success" && data.value === true) {
        console.log("✅ Payment confirmed:", data);
        // Get the email cookie and decode it
        const emailCookie = req.cookies.get("clientEmail")?.value;
        if (!emailCookie) {
          return new Response("Email cookie is missing", { status: 400 });
        }

        // Decode the email from the cookie (URL-decoding)
        const email = decodeURIComponent(emailCookie);
        if (!email || !email.includes("@")) {
          return new Response("Invalid email address", { status: 400 });
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
          ...cartItems.filter(
            (item: any) => item.stock_status === "onbackorder"
          ),
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

        // Send email
        await sendEmail({
          to: email,
          subject: "Шинэ худалдан авалт баталгаажлаа!",
          html: `
     <p>Үйлчлүүлэгчийн <strong>${amount}₮</strong>-ийн худалдан авалтын нэхэмжлэл амжилттай үүсгэгдлээ.</p>
     ${checkoutType}
     <h4>Сагсанд байгаа бүтээгдэхүүнүүд:</h4>
     ${cartItemsList}
     ${formDataSection}
   `,
        });

        return NextResponse.json({ data }, { status: 200 });
      } else {
        console.log("❌ Payment not verified:", data);
        return NextResponse.json(
          { status: "Failed", message: "Payment not confirmed" },
          { status: 400 }
        );
      }
    } else {
      console.error("❗ StorePay API returned non-JSON response:", textData);
      return NextResponse.json(
        { status: "Failed", msg: "Unexpected API response format" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❗ StorePay Webhook Error:", error);
    return NextResponse.json(
      { status: "Failed", message: "Server error" },
      { status: 500 }
    );
  }
}
