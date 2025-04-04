"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DeliveryAddress } from "./deliveryAddress";
import PaymentMethods from "./paymentMethods";

export function CartDialog({
	open,
	setOpen,
	step,
	setStep,
}: {
	open: any;
	setOpen: any;
	step: any;
	setStep: any;
}) {
	const [cartItems, setCartItems] = useState<any[]>([]);
	const [totalPrice, setTotalPrice] = useState(0);
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [includeVAT, setIncludeVAT] = useState(false);
	const [isDelivered, setIsDelivered] = useState(false);
	const [methodError, setMethodError] = useState("");
	const [selected, setSelected] = useState("");
	const [paymentQRImg, setPaymentQRImg] = useState<string>("");
	const [paymentStatus, setPaymentStatus] = useState(""); // Store payment status (e.g., success or failure)
	const [formData, setFormData] = useState({
		address: "",
		phone: "",
		email: "",
		phone2: "",
	});
	const [errors, setErrors] = useState<any>({});
	const prevOpenRef = useRef(open); // Store the previous value of `open`
	const [qpayToken, setQpayToken] = useState("");
	const [qpayInvoiceId, setQpayInvoiceId] = useState("");

	useEffect(() => {
		if (open !== prevOpenRef.current) {
			// Check if `open` has changed
			prevOpenRef.current = open; // Update the ref to the latest value of `open`

			if (open) {
				// Only fetch cart items when dialog is opened
				const items = JSON.parse(localStorage.getItem("cart") || "[]");
				setCartItems(items);

				// Calculate total price
				const total = items.reduce(
					(sum: number, item: any) => sum + item.price * item.quantity,
					0
				);
				setTotalPrice(total);
			}
		}
	}, [open]); // Depend only on `open`
	useEffect(() => {
		const total = cartItems.reduce(
			(sum: number, item: any) => sum + item.price * item.quantity,
			0
		);
		setTotalPrice(total);
	}, [cartItems]); // Dependency on cartItems to track changes

	const removeItem = (index: number) => {
		const updatedItems = [...cartItems];
		updatedItems.splice(index, 1); // Remove item from the array
		setCartItems(updatedItems);
		localStorage.setItem("cart", JSON.stringify(updatedItems));
	};

	const changeQuantity = (index: number, amount: number) => {
		const updatedItems = [...cartItems];
		updatedItems[index].quantity = Math.max(
			updatedItems[index].quantity + amount,
			1
		); // Prevent negative quantities
		setCartItems(updatedItems);
		localStorage.setItem("cart", JSON.stringify(updatedItems));
	};

	const validate = () => {
		if (!isDelivered) {
			return true;
		}
		let newErrors: any = {};
		if (!formData.address) newErrors.address = "Хаяг шаардлагатай";
		if (!formData.phone) {
			newErrors.phone = "Утас шаардлагатай";
		} else if (!/^\d{8,}$/.test(formData.phone)) {
			newErrors.phone = "Зөвхөн 8-аас дээш оронтой тоо оруулна уу";
		}
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "И-мэйл хаяг буруу байна";
		}
		if (!formData.phone2) {
			newErrors.phone2 = "Утас 2 шаардлагатай";
		} else if (!/^\d{8,}$/.test(formData.phone2)) {
			newErrors.phone2 = "Зөвхөн 8-аас дээш оронтой тоо оруулна уу";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};
	const validate2 = () => {
		let newErrors: any = {};
		if (!hasBackorderItem) {
			return true;
		}
		if (!formData.address) newErrors.address = "Хаяг шаардлагатай";
		if (!formData.phone) {
			newErrors.phone = "Утас шаардлагатай";
		} else if (!/^\d{8,}$/.test(formData.phone)) {
			newErrors.phone = "Зөвхөн 8-аас дээш оронтой тоо оруулна уу";
		}
		if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "И-мэйл хаяг буруу байна";
		}
		if (!formData.phone2) {
			newErrors.phone2 = "Утас 2 шаардлагатай";
		} else if (!/^\d{8,}$/.test(formData.phone2)) {
			newErrors.phone2 = "Зөвхөн 8-аас дээш оронтой тоо оруулна уу";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};
	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (validate()) {
			console.log("Form submitted", formData);
		}
	};
	const hasBackorderItem = cartItems.some(
		(item) => item.stock_status === "onbackorder"
	);
	const handleSubmitForMethod = () => {
		if (!selected) {
			setMethodError("Та төлбөрийн арга сонгоно уу.");
		} else {
			setMethodError("");
			// Proceed with form submission or further logic here
		}
	};

	const getQPayToken = async () => {
		const username = process.env.NEXT_PUBLIC_QPAY_USERNAME;
		const password = process.env.NEXT_PUBLIC_QPAY_PASSWORD;
		const authString = btoa(`${username}:${password}`); // Encode credentials

		try {
			const response = await fetch("https://merchant.qpay.mn/v2/auth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${authString}`, // Use Basic Auth
				},
			});

			const data = await response.json();
			console.log("QPay Auth Response:", data); // Debugging
			return data.access_token;
		} catch (error) {
			console.error("Error fetching QPay token:", error);
		}
	};

	const createQPayInvoice = async () => {
		const token = await getQPayToken();
		if (!token) {
			console.error("Failed to retrieve token!");
			return;
		}
		setQpayToken(token); // ✅ Save token to state
		try {
			const response = await fetch("/api/qpay-invoice", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					invoice_code: "OSGONMUNKH_S_INVOICE",
					sender_invoice_no: `INV-${Date.now()}`,
					amount: totalPrice,
					callback_url: `${process.env.NEXT_PUBLIC_DEPLOYED_URL}/api/qpay-callback`,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("QPay Invoice Error:", errorText);
				return;
			}

			const data = await response.json();
			console.log("QPay Invoice Response:", data);

			setPaymentQRImg(data.qr_image);
			setPaymentStatus("Pending payment confirmation..."); // Show pending until callback is received
			setQpayInvoiceId(data.invoice_id); // ✅ Save invoice_id to state
		} catch (error) {
			console.error("Error creating QPay invoice:", error);
			setPaymentStatus("Payment failed to initiate.");
		}
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (step === 3 && selected === "qpay" && qpayToken && qpayInvoiceId) {
			interval = setInterval(async () => {
				try {
					const res = await fetch("/api/qpay-status", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							token: qpayToken,
							invoice_id: qpayInvoiceId,
						}),
					});

					const data = await res.json();

					if (data.rows?.[0]?.payment_status === "PAID") {
						setPaymentStatus("Төлбөр амжилттай!");
						clearInterval(interval);
					}
				} catch (error) {
					console.error("Polling error:", error);
				}
			}, 10000);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [step, selected, qpayToken, qpayInvoiceId]);

	const getStorePayToken = async () => {
		try {
			const response = await fetch("/api/storepay/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();
			return data.access_token; // Return the access token
		} catch (error) {
			console.error("Error fetching StorePay token:", error);
		}
	};

	const createStorePayInvoice = async () => {
		const token = await getStorePayToken();
		if (!token) {
			console.error("Failed to retrieve token");
			return;
		}

		try {
			const response = await fetch("/api/storepay/invoice", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					token,
					invoice_code: "MY_INVOICE_CODE",
					sender_invoice_no: `INV-${Date.now()}`,
					amount: totalPrice, // Pass the total price
					callback_url: "https://yourwebsite.com/callback", // Set your callback URL
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Error creating StorePay invoice:", errorText);
				return;
			}

			const data = await response.json();
			console.log("StorePay Invoice Response:", data);
		} catch (error) {
			console.error("Error creating StorePay invoice:", error);
		}
	};

	console.log(selected);
	return (
		<Dialog
			onOpenChange={(isOpen) => {
				setOpen();
				if (!isOpen) setStep(1); // Reset page to 1 when dialog closes
			}}
			open={open}
		>
			<DialogContent className="p-6">
				<DialogHeader>
					<DialogTitle className="text-3xl font-bold">
						{step === 1 ? "Таны сагс" : "Төлбөр төлөх"}
					</DialogTitle>
				</DialogHeader>
				{step === 1 ? (
					<>
						<div className="overflow-y-auto mt-2 h-[400px]">
							{cartItems.length > 0 ? (
								cartItems.map((item, index) => (
									<div key={index} className="flex gap-4 mt-4">
										<img
											className="h-16 w-16 rounded-2xl"
											src={item.image}
											alt={item.name}
										/>
										<div className="flex flex-col w-[80%]">
											<div className="flex justify-between w-[60%]">
												<p>{item.name}</p>{" "}
												<h5
													className={`${
														item?.stock_status == "instock"
															? "text-[#5dc477]"
															: item?.stock_status == "onbackorder"
															? "text-[#00b3fa]"
															: "text-[#ab3030]"
													} text-center items-center w-4 mt-1`}
												>
													{item?.stock_status == "instock"
														? "Бэлэн"
														: item?.stock_status == "onbackorder"
														? "Захиалгаар"
														: "Дууссан"}
												</h5>
											</div>

											<span className="text-2xl block">
												{item.quantity} *{" "}
												{new Intl.NumberFormat("mn-MN").format(item.price)}₮
											</span>
										</div>
										{/* Remove Button */}
										<div className="flex justify-end ml-auto">
											<Button
												variant="outline"
												className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
												onClick={() => removeItem(index)}
											>
												<span className="text-xl">X</span>
											</Button>
										</div>
									</div>
								))
							) : (
								<p>Сагс хоосон байна.</p>
							)}
						</div>

						{/* Total Price Section */}
						<label className="flex items-center space-x-2 text-xl">
							<input
								type="checkbox"
								checked={isDelivered}
								onChange={(e) => setIsDelivered(e.target.checked)}
							/>
							<span>Хүргэлтээр авах</span>
						</label>
						{isDelivered && (
							<DeliveryAddress
								errors={errors}
								setErrors={setErrors}
								formData={formData}
								setFormData={setFormData}
							/>
						)}

						<label className="flex items-center space-x-2 text-xl text-end">
							<input
								type="checkbox"
								checked={includeVAT}
								onChange={(e) => setIncludeVAT(e.target.checked)}
							/>
							<span>НӨАТ хасах /-10%/</span>
						</label>

						<p className="text-end mt-4">
							Нийт үнэ:{" "}
							{includeVAT && (
								<span className="line-through text-gray-500 mr-2 block">
									{new Intl.NumberFormat("mn-MN").format(totalPrice)}₮
								</span>
							)}
							<span className="font-bold block">
								{new Intl.NumberFormat("mn-MN").format(
									includeVAT ? Math.floor(totalPrice * 0.9) : totalPrice
								)}
								₮
							</span>
						</p>

						{/* Action Buttons */}
						<div className="flex justify-between gap-6 mt-10 w-2/3 mx-auto">
							<Button
								variant="outline"
								className="text-2xl px-8 py-4"
								onClick={() => setOpen(false)}
							>
								Хаах
							</Button>
							<Button
								className="text-2xl px-8 py-4 bg-blue-500 text-white"
								disabled={totalPrice === 0}
								onClick={(e) => {
									e.preventDefault(); // Prevents default form submission
									if (validate()) {
										handleSubmit(e);
										setStep(2);
									}
								}}
							>
								Төлбөр төлөх
							</Button>
						</div>
					</>
				) : step === 2 ? (
					<>
						<div className="flex flex-col space-y-4 mt-4">
							{
								// If an onbackorder item exists & delivery is NOT selected, force address input
								hasBackorderItem && !isDelivered && (
									<div>
										<span>Захиалгат бараа очих хүргэлтийн хаяг оруулна уу</span>
										<DeliveryAddress
											errors={errors}
											setErrors={setErrors}
											formData={formData}
											setFormData={setFormData}
										/>
									</div>
								)
							}
							<p>Захиалгаа баталгаажуулах</p>
						</div>
						<PaymentMethods
							methodError={methodError}
							setMethodError={setMethodError}
							selected={selected}
							setSelected={setSelected}
							handleSubmitForMethod={handleSubmitForMethod}
						/>
						<div className="flex justify-between mt-10 w-[90%] mx-auto">
							<Button
								variant="outline"
								className="text-2xl  py-4"
								onClick={() => setStep(1)}
							>
								Буцах
							</Button>
							<Button
								variant="outline"
								className="text-2xl px-8 py-4 bg-blue-500 text-white"
								onClick={(e) => {
									e.preventDefault(); // Prevents default form submission
									if (validate2()) {
										handleSubmit(e);
										handleSubmitForMethod();
										if (selected == "qpay") {
											createQPayInvoice();
										} else {
											createStorePayInvoice();
										}

										setStep(3);
									}
								}}
							>
								Үргэлжлүүлэх
							</Button>
						</div>
					</>
				) : (
					<>
						<div className="w-[512px] h-[854px]">
							{" "}
							{selected == "qpay" && paymentStatus !== "Төлбөр амжилттай!" ? (
								<div>
									{" "}
									<p className="mt-4">QPay-аар төлөх</p>
									<img
										src={`data:image/png;base64,${paymentQRImg}`}
										alt="QPay QR Code"
									/>
								</div>
							) : (
								<div className="w-[200px] h-[200px] m-auto">
									<p className="text-[30px] font-extrabold">{paymentStatus}</p>
								</div>
							)}
							{paymentStatus && (
								<div className="mt-4">
									<p>{paymentStatus}</p>
								</div>
							)}
							<Button
								variant="outline"
								className="text-2xl  py-4"
								onClick={() => setStep(2)}
							>
								Буцах
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
