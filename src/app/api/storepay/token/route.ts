// app/api/storepay/token/route.js
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("checking");
  try {
    const username = "merchantapp1"; // Replace with your StorePay credentials
    const password = "EnRZA3@B"; // Replace with your StorePay credentials

    const authString = Buffer.from(`${username}:${password}`).toString(
      "base64"
    );

    // Request the token from StorePay
    const response = await fetch("https://api.storepay.com/v1/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching StorePay token:", error);
    return new Response("Server Error", { status: 500 });
  }
}
