import { NextRequest } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: NextRequest) {
  const { token, invoice_id, cartItems, amount, formData, isDelivered } =
    await req.json();

  const response = await fetch(`https://merchant.qpay.mn/v2/payment/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoice_id,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(errorText, { status: response.status });
  }

  const data = await response.json();

  if (data.rows?.[0]?.payment_status === "PAID") {
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
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
