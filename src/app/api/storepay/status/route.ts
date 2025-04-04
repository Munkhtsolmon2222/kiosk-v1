// pages/api/storepay-status.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json(); // Parse the incoming JSON body
		console.log("StorePay Callback Data:", body); // Debugging: Check received data

		// Extract data from the request body
		const { token, invoice_id } = body;

		// Check if the required fields are present
		if (!token || !invoice_id) {
			return NextResponse.json({ message: "Invalid data" }, { status: 400 });
		}

		// Make the request to the StorePay API to check the payment status
		const response = await fetch("https://api.storepay.mn/payment/status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`, // Add the token if required by StorePay
			},
			body: JSON.stringify({ invoice_id }), // Send the invoice_id in the body
		});

		// Check if the response from StorePay API is OK
		if (!response.ok) {
			return NextResponse.json(
				{ message: "Error contacting StorePay API" },
				{ status: 500 }
			);
		}

		// Parse the response from StorePay API
		const data = await response.json();

		// If payment status is successful and we have an invoice number
		if (data.status === "Success" && data.value) {
			return NextResponse.json(
				{ status: "Success", value: data.value }, // Return the invoice number
				{ status: 200 }
			);
		}

		// If payment status failed, return the error messages
		if (data.status === "Failed" && data.msgList) {
			return NextResponse.json(
				{ status: "Failed", msgList: data.msgList }, // Return error messages
				{ status: 200 }
			);
		}

		// If the status is neither Success nor Failed, return an unknown error
		return NextResponse.json(
			{ status: "Failed", msgList: ["Unknown error"] },
			{ status: 400 }
		);
	} catch (error) {
		console.error("StorePay Callback Error:", error);
		return NextResponse.json({ message: "Server Error" }, { status: 500 });
	}
}
