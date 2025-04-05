import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, invoice_code, sender_invoice_no, amount, callback_url } =
      await req.json();

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

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Server Error", { status: 500 });
  }
}
