import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	console.log("Request received for token");

	try {
		const app_username = "merchantapp1"; // Replace with your StorePay API username
		const app_password = "EnRZA3@B"; // Replace with your StorePay API password
		const username = "99003318"; // Replace with your StorePay username
		const password = "99003318"; // Replace with your StorePay password
		const grant_type = "password"; // Correct grant_type should be "password"

		// Correctly encode the app_username and app_password for Basic Authentication
		const authString = Buffer.from(`${app_username}:${app_password}`).toString(
			"base64"
		);

		// Request the token from StorePay
		const response = await fetch(
			`https://service.storepay.mn/merchant-uaa/oauth/token?grant_type=${grant_type}&username=${username}&password=${password}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded", // Use form URL encoding for body
					Authorization: `Basic ${authString}`, // Basic Auth using app credentials
				},
			}
		);

		if (!response.ok) {
			const errorText = await response.text();
			return new Response(errorText, { status: response.status });
		}

		const data = await response.json();
		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		console.error("Error fetching StorePay token:", error);
		return new Response("Server Error", { status: 500 });
	}
}
