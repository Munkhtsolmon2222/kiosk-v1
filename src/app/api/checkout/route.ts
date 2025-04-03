export async function POST(req: Request) {
  try {
    const { cartItems } = await req.json(); // Get cart items from request body

    // WooCommerce API Credentials
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return new Response(
        JSON.stringify({ error: "WooCommerce API keys missing" }),
        { status: 500 }
      );
    }

    // Encode WooCommerce API credentials
    const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64"
    );

    // 🟢 Send Request to WooCommerce Orders API (Avoids Session Issues)
    const wooResponse = await fetch(
      "https://erchuudiindelguur.mn/wp-json/wc/v3/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_method: "qpay_gateway",
          payment_method_title: "QPay",
          set_paid: false,
          billing: {
            first_name: "Kiosk",
            last_name: "User",
            email: "user@example.com",
          },
          line_items: cartItems.map((item: any) => ({
            product_id: item.id, // Ensure this is a valid WooCommerce product ID
            quantity: item.quantity,
            subtotal: (item.price * item.quantity).toString(), // Ensure subtotal is correct
            name: item.name, // Include the product name
          })),
        }),
      }
    );

    // 🟢 Parse WooCommerce Response
    const data = await wooResponse.json();
    return new Response(JSON.stringify(data), { status: wooResponse.status });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
