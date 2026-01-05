import { NextRequest, NextResponse } from "next/server";

// Set runtime configuration
export const runtime = 'nodejs';
export const maxDuration = 30; // Increase timeout to 30 seconds (Pro plan) or keep at 10 for Hobby

// Proxy route to avoid CORS issues with WooCommerce API variations
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = id;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    // Reduce default per_page to 50 for better performance and to avoid timeouts
    const perPage = searchParams.get("per_page") || "50";

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

    // Create AbortController for timeout (9 seconds to be safe, leaving 1 second buffer)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    try {
      // Make request to WooCommerce API with timeout
      const wcUrl = `https://erchuudiindelguur.mn/wp-json/wc/v3/products/${productId}/variations?per_page=${perPage}`;
      const response = await fetch(wcUrl, {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
        signal: controller.signal,
        // Remove next.revalidate as it's not applicable in API routes
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("WooCommerce API Error:", errorText);
        return NextResponse.json(
          {
            error: `WooCommerce API error: ${response.status}`,
            details: errorText,
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Return response with CORS headers and cache headers
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("Request timeout: WooCommerce API took too long to respond");
        return NextResponse.json(
          {
            error: "Request timeout",
            details: "The WooCommerce API request timed out. Please try again or reduce the number of variations per page.",
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Variations Proxy Error:", error);
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

