import { NextResponse } from "next/server";

export async function POST() {
  try {
    const username = process.env.QPAY_USERNAME ?? process.env.NEXT_PUBLIC_QPAY_USERNAME;
    const password = process.env.QPAY_PASSWORD ?? process.env.NEXT_PUBLIC_QPAY_PASSWORD;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing QPay credentials" },
        { status: 500 }
      );
    }

    const authString = Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch("https://merchant.qpay.mn/v2/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch QPay token" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

