import { NextRequest, NextResponse } from "next/server";

interface POSRequest {
  requestID: string;
  portNo: string;
  timeout: string;
  terminalID: string;
  amount: string;
  currencyCode: string;
  operationCode: string;
  bandWidth: string;
  cMode: string;
  cMode2: string;
  additionalData: string;
  cardEntryMode: string;
  fileData: string;
}

interface POSResponse {
  data: string; // Base64 encoded response
  responseCode: string;
  responseDesc: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      requestID,
      portNo,
      timeout,
      terminalID,
      amount,
      currencyCode,
      operationCode,
      bandWidth,
      cMode,
      cMode2,
      additionalData,
      cardEntryMode,
      fileData,
    } = await req.json();

    // Validate required fields
    if (!requestID || !portNo || !terminalID || !operationCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct POS request object
    const posRequest: POSRequest = {
      requestID: requestID || `REQ-${Date.now()}`,
      portNo: portNo || process.env.POS_PORT_NO || "1",
      timeout: timeout || "540000",
      terminalID: terminalID || process.env.POS_TERMINAL_ID || "13133707",
      amount: amount || "",
      currencyCode: currencyCode || "496",
      operationCode: operationCode,
      bandWidth: bandWidth || "115200",
      cMode: cMode || "",
      cMode2: cMode2 || "",
      additionalData: additionalData || "",
      cardEntryMode: cardEntryMode || "",
      fileData: fileData || "",
    };

    // Convert to JSON string and then to Base64
    const jsonString = JSON.stringify(posRequest);
    const base64Data = Buffer.from(jsonString).toString("base64");

    // Get POS service URL from environment or use default
    const posServiceUrl =
      process.env.POS_SERVICE_URL || "http://localhost:8500";
    const requestUrl = `${posServiceUrl}/requestToPos/message?data=${base64Data}`;

    // Make GET request to POS service
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("POS Service Error:", errorText);
      return NextResponse.json(
        { error: "POS service error", details: errorText },
        { status: response.status }
      );
    }

    const data: POSResponse = await response.json();

    // Decode Base64 response data if present
    let decodedData = null;
    if (data.data) {
      try {
        const decodedString = Buffer.from(data.data, "base64").toString("utf-8");
        decodedData = JSON.parse(decodedString);
      } catch (e) {
        // If decoding fails, return raw data
        decodedData = data.data;
      }
    }

    return NextResponse.json(
      {
        responseCode: data.responseCode,
        responseDesc: data.responseDesc,
        data: decodedData,
        rawData: data.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POS Request Error:", error);
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

