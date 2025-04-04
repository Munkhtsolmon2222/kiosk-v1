// pages/api/storepay-status.ts

import type { NextApiRequest, NextApiResponse } from "next";

interface StorePayResponse {
	status: string;
	value?: string; // Invoice number, if successful
	msgList?: string[]; // Error messages, if failed
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const { token, invoice_id } = req.body;

		try {
			// Make the request to the StorePay API to check the payment status
			const response = await fetch(`https://api.storepay.mn/payment/status`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`, // Authorization header if needed
				},
				body: JSON.stringify({ invoice_id }),
			});

			// Check for a successful response from StorePay
			if (!response.ok) {
				return res.status(500).json({
					status: "Failed",
					msgList: ["Error contacting StorePay API"],
				});
			}

			const data: StorePayResponse = await response.json();

			if (data.status === "Success" && data.value) {
				// If the invoice was found and the payment is successful
				return res.status(200).json({
					status: "Success",
					value: data.value, // Invoice number
				});
			}

			if (data.status === "Failed" && data.msgList) {
				// If there was an error or the invoice wasn't found
				return res.status(200).json({
					status: "Failed",
					msgList: data.msgList, // Error messages
				});
			}

			return res
				.status(400)
				.json({ status: "Failed", msgList: ["Unknown error"] });
		} catch (error) {
			console.error("Error fetching StorePay status:", error);
			return res
				.status(500)
				.json({ status: "Failed", msgList: ["Server error"] });
		}
	} else {
		return res
			.status(405)
			.json({ status: "Failed", msgList: ["Method not allowed"] });
	}
}
