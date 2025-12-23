import { NextRequest, NextResponse } from "next/server";

// Proxy route to avoid CORS issues with WooCommerce API
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "100";

    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: "WooCommerce API keys are missing" },
        { status: 500 }
      );
    }

    // Create Basic Auth header
    const authHeader = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64");

    // Make request to WooCommerce API
    const wcUrl = `https://erchuudiindelguur.mn/wp-json/wc/v3/products/categories?per_page=${perPage}&page=${page}`;
    const response = await fetch(wcUrl, {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
      // Cache the response for better performance
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WooCommerce API Error:", errorText);
      return NextResponse.json(
        { error: `WooCommerce API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return response with CORS headers (though not needed for same-origin requests)
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Categories Proxy Error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

