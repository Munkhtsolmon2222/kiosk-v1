import { sendEmail } from "@/lib/sendEmail";
import { NextRequest } from "next/server";
 
export async function POST(req: NextRequest) {
  try {
    const {
      token,
      invoice_code,
      sender_invoice_no,
      amount,
      callback_url,
      name,
    } = await req.json();
 
    const response = await fetch("https://merchant.qpay.mn/v2/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        invoice_code,
        sender_invoice_no,
        invoice_receiver_code: "guest",
        invoice_description: "Kiosk худалдан авалт",
        amount,
        callback_url,
      }),
    });
 
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }
 
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
    await sendEmail({
      to: email,
      subject: "Invoice Confirmation",
      html: `
        <h3>Сайн байна уу, Эрчүүдийн дэлгүүр !</h3>
        <p>Таны <strong>${amount}₮</strong>-ийн худалдан авалтын нэхэмжлэл амжилттай үүсгэгдлээ.</p>
        <p>Баярлалаа!</p>
      `,
    });
 
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Server Error", { status: 500 });
  }
}
 
 