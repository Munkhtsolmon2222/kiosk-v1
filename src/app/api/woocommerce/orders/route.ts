import { createKioskOrder } from "@/lib/woocommerce";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentRef,
      paymentMethod,
      cartItems,
      amount,
      formData,
      isDelivered,
      kioskOrderNumber,
    } = body;

    if (!paymentRef || !paymentMethod || !kioskOrderNumber) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    const emailCookie = req.cookies.get("clientEmail")?.value;
    const customerEmail = emailCookie
      ? decodeURIComponent(emailCookie)
      : undefined;

    console.log(
      `[Kiosk WC] API /woocommerce/orders`,
      JSON.stringify({
        paymentRef,
        paymentMethod,
        kioskOrderNumber,
        cartItemCount: cartItems.length,
      })
    );

    const result = await createKioskOrder({
      paymentRef,
      paymentMethod,
      cartItems,
      amount: Number(amount) || 0,
      formData,
      isDelivered: Boolean(isDelivered),
      kioskOrderNumber,
      customerEmail,
    });

    console.log(
      `[Kiosk WC] API order result`,
      JSON.stringify({ paymentRef, ...result })
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(
      `[Kiosk WC] API order error`,
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    );
  }
}
