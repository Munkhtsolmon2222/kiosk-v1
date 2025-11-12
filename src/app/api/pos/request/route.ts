import { NextRequest, NextResponse } from "next/server";

// Simple proxy route to avoid CORS issues
// This just forwards the request to POS service
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data");

    if (!data) {
      return NextResponse.json(
        { error: "Missing data parameter" },
        { status: 400 }
      );
    }

    // Get POS service URL from environment or use default
    const posServiceUrl =
      process.env.POS_SERVICE_URL || "http://localhost:8500";
    const requestUrl = `${posServiceUrl}/requestToPos/message?data=${data}`;

    // Forward the request to POS service
    const response = await fetch(requestUrl, {
      method: "GET",
    });
    console.log(response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("POS Service Error:", errorText);
      return NextResponse.json(
        { error: "POS service error", details: errorText },
        { status: response.status }
      );
    }

    const posData = await response.json();
    console.log(posData);
    // Return the response with CORS headers
    return NextResponse.json(posData, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("POS Proxy Error:", error);
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
