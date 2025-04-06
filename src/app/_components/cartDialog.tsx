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
import IdleRedirect from "./idleRedirect";
import { useRouter } from "next/navigation";
import {
  getCookie,
  getCookies,
  setCookie,
  deleteCookie,
  hasCookie,
  useGetCookies,
  useSetCookie,
  useHasCookie,
  useDeleteCookie,
  useGetCookie,
} from "cookies-next/client";
export function CartDialog({
  open,
  setOpen,
  step,
  setStep,
  setCartItems,
  cartItems,
  totalPrice,
}: {
  open: any;
  setOpen: any;
  step: any;
  setStep: any;
  setCartItems: any;
  cartItems: any;
  setTotalPrice: any;
  totalPrice: any;
}) {
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
  const [qpayToken, setQpayToken] = useState("");
  const [qpayInvoiceId, setQpayInvoiceId] = useState("");
  const [storePayToken, setStorePayToken] = useState("");
  const [storePayRequestId, setStorePayRequestId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState<any>("");
  const [qrImageLoading, setQRImageLoading] = useState(false);
  const router = useRouter();

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

  const validatePhoneNumber = (number: string): any => {
    const trimmed = number.trim();

    if (trimmed === "") return "Утасны дугаараа оруулна уу";

    const phoneRegex = /^\d{8}$/;
    if (!phoneRegex.test(trimmed)) {
      return "Зөвхөн 8 оронтой, зөв дугаар оруулна уу";
    }

    return true; // Valid number
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted", formData);
    }
  };
  const hasBackorderItem = cartItems?.some(
    (item: any) => item.stock_status === "onbackorder"
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
    setPaymentStatus("");
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
    setStep(3);

    setQRImageLoading(true); // Set QR image loading to true
    const token = await getQPayToken();
    if (!token) {
      console.error("Failed to retrieve token!");
      return;
    }
    console.log(includeVAT);
    const finalPrice = includeVAT ? Math.floor(totalPrice * 0.9) : totalPrice;
    console.log(totalPrice);
    console.log(cartItems);
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
          amount: finalPrice,
          callback_url: `${process.env.NEXT_PUBLIC_DEPLOYED_URL}/api/qpay-callback`,
          cartItems: cartItems,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check if the error text indicates missing email cookie
        if (errorText.includes("Email cookie is missing")) {
          alert("Дэлгүүрийн ажилтан имэйл хаягаа оруулаагүй байна");
        }

        console.error("QPay Invoice Error:", errorText);
        setQRImageLoading(false); // Stop loading if there's an error
        return;
      }

      const data = await response.json();
      console.log("QPay Invoice Response:", data);

      setPaymentQRImg(data.qr_image);
      setPaymentStatus("Төлбөр баталгаажихыг хүлээж байна..."); // Show pending until callback is received
      setQpayInvoiceId(data.invoice_id); // ✅ Save invoice_id to state
    } catch (error) {
      console.error("Error creating QPay invoice:", error);
      setPaymentStatus("Төлбөр эхлүүлэхэд алдаа гарсан.");
    } finally {
      setQRImageLoading(false); // Stop QR image loading once done
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const finalPrice = includeVAT ? Math.floor(totalPrice * 0.9) : totalPrice;
    // Polling for QPay if selected is "qpay"
    const closeDialog = () => {
      setOpen(false); // Close the dialog
      setStep(1);
    };
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
              cartItems: cartItems,
              amount: finalPrice,
              formData: formData,
              isDelivered: isDelivered,
            }),
          });

          const data = await res.json();

          // Handle the response according to the API documentation
          if (data.rows?.[0]?.payment_status === "PAID") {
            setPaymentStatus("Төлбөр амжилттай!");
            setCartItems([]);
            localStorage.removeItem("cart");
            clearInterval(interval); // Stop polling
            setTimeout(() => {
              closeDialog();
              router.push("/"); // Change to the desired redirect path
            }, 5000);
          } else if (data.status === "Failed" && data.msgList) {
            console.error("Error: ", data.msgList);
            setPaymentStatus(
              "Нэхэмжлэх үүсгэгдээгүй: " + data.msgList.join(", ")
            );
            clearInterval(interval); // Stop polling
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 10000);
    }

    // Polling for StorePay if selected is "storepay"
    if (
      step === 3 &&
      selected === "storepay" &&
      storePayToken &&
      storePayRequestId
    ) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/storepay/status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: storePayToken,
              requestId: storePayRequestId,
              cartItems: cartItems,
              amount: totalPrice,
              formData: formData,
              isDelivered: isDelivered,
            }),
          });

          const data = await res.json();
          console.log(data);
          // Handle the response for StorePay based on the documentation
          if (data.data?.status === "Success" && data.data?.value === true) {
            setPaymentStatus("Төлбөр амжилттай!");
            setCartItems([]);
            localStorage.removeItem("cart");
            clearInterval(interval); // Stop polling
            setTimeout(() => {
              closeDialog();
              router.push("/"); // Change to the desired redirect path
            }, 5000);
          } else if (data.status === "Failed" && data.msgList) {
            console.error("Error: ", data.msgList);
            setPaymentStatus(
              "Нэхэмжлэх үүсгэгдээгүй: " + data.msgList.join(", ")
            );
            clearInterval(interval); // Stop polling
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    step,
    selected,
    qpayToken,
    qpayInvoiceId,
    storePayToken,
    storePayRequestId,
  ]);

  const getStorePayToken = async () => {
    setPaymentStatus("");

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
    const result = validatePhoneNumber(phoneNumber);
    if (result === true) {
      setStep(3);
      const token = await getStorePayToken();
      if (!token) {
        console.error("Failed to retrieve token");
        return;
      }
      setStorePayToken(token); // ✅ Save token to state

      try {
        const response = await fetch("/api/storepay/invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeId: "13214",
            mobileNumber: phoneNumber,
            description: "test",
            amount: totalPrice,
            callbackUrl: `${process.env.NEXT_PUBLIC_DEPLOYED_URL}/api/storepay/status`,
            accessToken: token,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error creating StorePay invoice:", errorText);
          return;
        }

        const data = await response.json();
        console.log("StorePay Invoice Response:", data);

        setStorePayRequestId(data.value); // ✅ Save requestId
      } catch (error) {
        console.error("Error creating StorePay invoice:", error);
      }
    } else {
      setPhoneError(result); // show error in UI
      return; // prevent proceeding
    }
  };

  console.log(selected);
  console.log(paymentStatus);
  console.log(formData);
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        setOpen(false);
        if (!isOpen) setStep(1); // Reset page to 1 when dialog closes
      }}
      open={open}
    >
      <IdleRedirect timeout={600000} redirectPath="/" />
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            {step === 1 ? "Таны сагс" : "Төлбөр төлөх"}
          </DialogTitle>
        </DialogHeader>
        {step === 1 ? (
          <>
            <div className="overflow-y-auto mt-2 h-[400px]">
              {cartItems?.length > 0 ? (
                cartItems?.map((item: any, index: any) => (
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
              setPhoneNumber={setPhoneNumber}
              phoneNumber={phoneNumber}
              setPhoneError={setPhoneError}
              phoneError={phoneError}
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
                  {qrImageLoading ? (
                    <div className="w-[200px] mx-auto my-[100px]">
                      QR Зураг ачааллаж байна...
                    </div>
                  ) : (
                    <img
                      src={`data:image/png;base64,${paymentQRImg}`}
                      alt="QPay QR Code"
                    />
                  )}
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
              {selected == "storepay" && (
                <div className="w-[400px] h-[200px] mx-auto mb-[100px]">
                  <p className="text-[20px]">
                    Захиалгаа Storepay app-аар үргэлжлүүлэн төлбөрөө төлнө үү.
                    Төлбөр амжилттай төлөгдсөн бол захиалга баталгаажна.
                  </p>
                </div>
              )}
              {selected == "storepay" &&
                paymentStatus == "Төлбөр амжилттай!" && (
                  <div className="w-[200px] h-[200px] m-auto">
                    <p className="text-[30px] font-extrabold">
                      {paymentStatus}
                    </p>
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
