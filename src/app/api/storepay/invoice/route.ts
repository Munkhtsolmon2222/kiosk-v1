import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("Request received to create an invoice");
  try {
    // Assuming you already have the access_token from the previous step

    // Get the request body from the incoming request
    const {
      storeId,
      mobileNumber,
      description,
      amount,
      callbackUrl,
      accessToken,
    } = await req.json();

    // Construct the body for the invoice creation request
    const body = {
      storeId: storeId, // Default value can be replaced with dynamic value if needed
      mobileNumber: mobileNumber, // Customer's mobile number
      description: description, // Description of the invoice
      amount: amount, // Amount for the invoice
      callbackUrl: callbackUrl, // Callback URL for the result (can be left empty or provide the URL)
    };

    // Create the invoice by making a POST request to the /merchant/loan endpoint
    const response = await fetch("https://service.storepay.mn/merchant/loan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Specify that the request body is JSON
        Authorization: `Bearer ${accessToken}`, // Use the access token in the header
      },
      body: JSON.stringify(body), // Send the invoice details in the request body
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    const data = await response.json(); // Parse the JSON response from the API
    return new Response(JSON.stringify(data), { status: 200 }); // Send the data as a response
  } catch (error) {
    console.error("Error creating invoice:", error); // Log any errors
    return new Response("Server Error", { status: 500 }); // Return a server error if something goes wrong
  }
}
