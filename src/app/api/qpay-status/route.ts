import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	const { token, invoice_id } = await req.json();

	const response = await fetch(`https://merchant.qpay.mn/v2/payment/check`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			object_type: "INVOICE",
			object_id: invoice_id,
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		return new Response(errorText, { status: response.status });
	}

	const data = await response.json();
	return new Response(JSON.stringify(data), { status: 200 });
}
