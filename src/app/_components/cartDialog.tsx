"use client";
import { useState, useEffect } from "react";
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
  const cartFromStorage = localStorage.getItem("cart");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [methodError, setMethodError] = useState("");
  const [selected, setSelected] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    email: "",
    phone2: "",
  });
  const [errors, setErrors] = useState<any>({});
  useEffect(() => {
    // Retrieve cart data from localStorage
    const items = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(items);

    // Calculate total price
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartFromStorage]);

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

  const createWooCommerceOrder = async () => {
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce API keys are missing");
    }
    const authHeader =
      typeof window === "undefined"
        ? Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
        : btoa(`${consumerKey}:${consumerSecret}`);
    const response = await fetch(
      "https://erchuudiindelguur.mn/?wc-ajax=update_order_review",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          payment_method: "qpay_gateway",
          payment_method_title: "QPay",
          set_paid: false, // Don't set the order as paid yet
          billing: {
            first_name: "Kiosk",
            last_name: "User",
            email: "user@example.com",
          },
          line_items: cartItems.map((item) => ({
            product_id: item.id, // Ensure product_id exists in your cart items
            quantity: item.quantity,
          })),
        }),
      }
    );

    const order = await response.json();
    return order.id; // Return the created order ID
  };

  const fetchOrderDetails = async (orderId: string) => {
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce API keys are missing");
    }
    const authHeader =
      typeof window === "undefined"
        ? Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
        : btoa(`${consumerKey}:${consumerSecret}`);
    const response = await fetch(
      `https://erchuudiindelguur.mn/wp-json/wc/v3/orders/${orderId}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      }
    );
    const order = await response.json();
    return order.payment_url; // You can use the payment_url or qr_image if provided
  };

  const handlePayment = async () => {
    const orderId = await createWooCommerceOrder();
    const paymentUrl = await fetchOrderDetails(orderId);
    setPaymentUrl(paymentUrl); // Set the payment URL (or QR code)
    setStep(3); // Go to the next step (payment view)
  };
  console.log(cartItems);
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
                          } text-center mt-1`}
                        >
                          {item?.stock_status == "instock"
                            ? "Бэлэн"
                            : item?.stock_status == "onbackorder"
                            ? "Захиалгаар"
                            : "Дууссан"}
                        </h5>
                      </div>

                      <span className="text-2xl block">
                        {item.quantity} * {item.price}₮
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
                    handlePayment();
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
