import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("QPay Callback Data:", body); // Debugging: Check received data

    const { sender_invoice_no, payment_status } = body;

    if (!sender_invoice_no || !payment_status) {
      return new Response("Invalid data", { status: 400 });
    }

    // Validate that QPay is the sender (Optional: Use a secret key if required)
    // if (!req.headers.get("Authorization")?.startsWith("Bearer ")) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    return new Response(JSON.stringify({ message: "Payment status updated" }), {
      status: 200,
    });
  } catch (error) {
    console.error("QPay Callback Error:", error);
    return new Response("Server Error", { status: 500 });
  }
}
