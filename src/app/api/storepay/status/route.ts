import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 StorePay Callback Data:", body);

    const { token } = body;
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
