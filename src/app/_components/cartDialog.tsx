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
import { useRouter } from "next/navigation";
import { useCart } from "../../../providers/cartContext";
import { getCartItemKey } from "@/lib/cartReducer";
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
  totalPrice,
}: {
  open: any;
  setOpen: any;
  step: any;
  setStep: any;
  setTotalPrice: any;
  totalPrice: any;
}) {
  const { cartItems, clearCart, removeFromCartByKey, updateQuantity } =
    useCart();
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
  const [posRequestId, setPosRequestId] = useState("");
  const [posProcessing, setPosProcessing] = useState(false);
  const router = useRouter();

  // Track active print operations to prevent duplicates (using ref to persist across renders)
  const activePrintOperationRef = useRef<string | null>(null);

  const printReceipt = (
    orderNumber: string,
    paymentMethod: string,
    deliveryAddress?: string,
  ) => {
    // Create a hidden iframe for printing (better for kiosk environment)
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    // Get current date and time in format: YYYY-MM-DD HH:MM
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const dateTimeStr = `${year}-${month}-${day} ${hours}:${minutes}`;

    // Get contact info from cookies or form data
    const emailCookie = getCookie("clientEmail") || formData.email || "";
    const phone1 = formData.phone || "";
    const phone2 = formData.phone2 || "";

    // Calculate totals
    // When includeVAT is true: VAT is removed (subtracted), so finalPrice = totalPrice * 0.9
    // When includeVAT is false: VAT is included, so finalPrice = totalPrice
    // totalPrice always represents the price WITH VAT included
    // StorePay always uses totalPrice without VAT discount
    const finalTotal =
      paymentMethod === "storepay"
        ? totalPrice
        : includeVAT
          ? Math.floor(totalPrice * 0.9)
          : totalPrice;
    // VAT amount is always 10% of the original totalPrice (before removal)
    // For StorePay, VAT is not shown separately (no discount applied)
    const vat = paymentMethod === "storepay" ? 0 : Math.floor(finalTotal * 0.1);

    // Format payment method
    const paymentMethodText =
      paymentMethod === "qpay"
        ? "QPAY"
        : paymentMethod === "storepay"
          ? "STOREPAY"
          : paymentMethod === "pos"
            ? "КАРТ"
            : paymentMethod.toUpperCase();

    // Build items table rows
    const itemsRows = cartItems
      .map(
        (item: any) => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${item.name}</td>
        <td style="text-align: right; padding: 4px 0;">${item.price.toLocaleString()}</td>
        <td style="text-align: center; padding: 4px 0;">${item.quantity}</td>
        <td style="text-align: right; padding: 4px 0;">${(
          item.price * item.quantity
        ).toLocaleString()}</td>
      </tr>`,
      )
      .join("");

    // Format delivery address
    const deliveryAddressText =
      isDelivered && deliveryAddress ? deliveryAddress : "Бэлэнээр";

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Захиалгын баримт</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              * {
                font-size: inherit !important;
              }
              body {
                margin: 0;
                padding: 0;
                font-size: 30px !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .receipt-container {
                padding: 20px !important;
                font-size: 30px !important;
              }
              .header-left {
                font-size: 26px !important;
                line-height: 1.8 !important;
              }
              .header-right {
                width: 120px !important;
                height: 120px !important;
              }
              .header-right img {
                width: 100% !important;
                height: 100% !important;
                object-fit: contain !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .order-number {
                font-size: 36px !important;
                font-weight: bold !important;
              }
              .order-details {
                font-size: 27px !important;
                line-height: 2 !important;
              }
              .items-table {
                font-size: 27px !important;
              }
              .items-table th {
                font-size: 27px !important;
                padding: 12px 8px !important;
                font-weight: bold !important;
              }
              .items-table td {
                padding: 10px 8px !important;
                font-size: 27px !important;
              }
              .summary-row {
                font-size: 30px !important;
                padding: 8px 0 !important;
              }
              .summary-label {
                font-size: 30px !important;
                font-weight: bold !important;
              }
              .delivery-address-label {
                font-size: 30px !important;
                font-weight: bold !important;
              }
              .delivery-address-text {
                font-size: 27px !important;
                line-height: 1.8 !important;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 27px;
              line-height: 1.6;
              padding: 20px;
              max-width: 210mm;
              margin: 0 auto;
              background-color: #f5f5f5;
            }
            .receipt-container {
              background-color: white;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              font-size: 27px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            .header-left {
              flex: 1;
              font-size: 26px;
              line-height: 1.8;
            }
            .header-right {
              width: 120px;
              height: 120px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .header-right img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .order-info {
              margin: 20px 0;
              padding: 15px 0;
              border-bottom: 1px solid #ddd;
            }
            .order-number {
              font-size: 33px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .order-details {
              font-size: 25.5px;
              line-height: 2;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              background-color: #f0f0f0;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #000;
              font-size: 25.5px;
            }
            .items-table th:nth-child(2),
            .items-table th:nth-child(4) {
              text-align: right;
            }
            .items-table th:nth-child(3) {
              text-align: center;
            }
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #eee;
              font-size: 25.5px;
            }
            .summary {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 27px;
            }
            .summary-label {
              font-weight: bold;
              font-size: 27px;
            }
            .delivery-address {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
            }
            .delivery-address-label {
              font-weight: bold;
              margin-bottom: 5px;
              font-size: 27px;
            }
            .delivery-address-text {
              font-size: 25.5px;
              line-height: 1.8;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="header-left">
                ТА ЭНЭХҮҮ БАРИМТЫГ КАССЫН АЖИЛТАНД
                ӨГЧ БАРААГАА АВНА УУ БАЯРЛАЛАА
              </div>
              <div class="header-right">
                <img src="/receipt-logo.jpg" alt="Logo" />
              </div>
            </div>

            <div class="order-info">
              <div class="order-number">ЗАХИАЛГЫН ДУГААР: ${orderNumber}</div>
              <div class="order-details">
                ОГНОО: ${dateTimeStr}<br>
                ${emailCookie}<br>
                ${phone1} ${phone2}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>БАРАА</th>
                  <th>ҮНЭ</th>
                  <th>ТОО</th>
                  <th>НИЙТ ҮНЭ</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span class="summary-label">НИЙТ</span>
                <span>${finalTotal.toLocaleString()}</span>
              </div>
              ${
                !includeVAT && paymentMethod !== "storepay"
                  ? `
              <div class="summary-row">
                <span class="summary-label">НӨАТ</span>
                <span>${vat.toLocaleString()}</span>
              </div>
              `
                  : ""
              }
              <div class="summary-row">
                <span class="summary-label">ТӨЛБӨРИЙН ХЭЛБЭР</span>
                <span>${paymentMethodText}</span>
              </div>
            </div>

            ${
              isDelivered
                ? `
            <div class="delivery-address">
              <div class="delivery-address-label">ХҮРГЭЛТИЙН ХАЯГ</div>
              <div class="delivery-address-text">${deliveryAddressText}</div>
            </div>
            `
                : ""
            }
          </div>
        </body>
      </html>
    `;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(receiptHTML);
    iframeDoc.close();

    // Create a unique ID for this print operation
    const operationId = `order-print-${Date.now()}-${Math.random()}`;

    // If there's already an active print operation, skip this one
    if (activePrintOperationRef.current) {
      console.log(
        "Print operation already in progress, skipping duplicate call",
      );
      return;
    }

    activePrintOperationRef.current = operationId;

    // Flag to prevent double printing
    let hasPrinted = false;

    const triggerPrint = () => {
      // Check if already printed or iframe was removed
      if (hasPrinted || !iframe.parentNode) return;

      hasPrinted = true;

      if (iframe.contentWindow) {
        iframe.contentWindow.print();

        // Remove iframe immediately after triggering print to prevent any subsequent events
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
          // Clear the active print operation flag
          if (activePrintOperationRef.current === operationId) {
            activePrintOperationRef.current = null;
          }
        }, 100);
      }
    };

    // Wait for content to load, then trigger print
    iframe.onload = () => {
      // Use a small delay to ensure content is fully loaded
      setTimeout(() => {
        triggerPrint();
      }, 100);
    };

    // Fallback: trigger print even if onload doesn't fire
    // Use a longer timeout to give onload a chance first
    setTimeout(() => {
      triggerPrint();
    }, 300);
  };

  const removeItem = (item: any) => {
    if (!item) return;
    removeFromCartByKey(getCartItemKey(item));
  };

  const changeQuantity = (index: number, amount: number) => {
    const current = cartItems?.[index];
    if (!current) return;
    updateQuantity(
      getCartItemKey(current),
      Math.max(current.quantity + amount, 1),
    );
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
    (item: any) => item.stock_status === "onbackorder",
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
    setPaymentStatus("");
    try {
      const response = await fetch("/api/qpay-token", {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Failed to retrieve QPay token");
      }

      const data = await response.json();
      return data.access_token as string;
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

          // Check if response is ok before parsing
          if (!res.ok) {
            const errorText = await res.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { error: errorText };
            }
            console.error("❌ QPay Status Check Failed:", {
              status: res.status,
              error: errorData.error || errorData.message || errorText,
            });

            // Only stop polling on critical errors, not on temporary failures
            if (
              res.status >= 500 ||
              (errorData.status === "Failed" && errorData.error)
            ) {
              setPaymentStatus(
                `Алдаа гарлаа: ${
                  errorData.error ||
                  errorData.message ||
                  "Төлбөрийн статус шалгахад алдаа гарлаа"
                }`,
              );
              // Don't clear interval immediately - might be temporary
            }
            return;
          }

          const data = await res.json();

          // Handle the response according to the QPay API documentation
          // Response structure: { count, paid_amount, rows[] }
          // Each row has: payment_id, payment_status, payment_date, etc.
          const paymentStatus = data.rows?.[0]?.payment_status;

          console.log("💳 QPay Payment Status:", {
            payment_status: paymentStatus,
            count: data.count,
            paid_amount: data.paid_amount,
          });

          if (paymentStatus === "PAID") {
            setPaymentStatus("Төлбөр амжилттай!");

            // Get order number from API response (generated on server side)
            let orderNumber = data.orderNumber || "";
            if (!orderNumber) {
              // Fallback: Generate order number from API if not in response
              try {
                const orderRes = await fetch("/api/generate-order-number");
                if (orderRes.ok) {
                  const orderData = await orderRes.json();
                  orderNumber = orderData.orderNumber;
                } else {
                  // Fallback to date-based number if API fails
                  const now = new Date();
                  const month = String(now.getMonth() + 1).padStart(2, "0");
                  const day = String(now.getDate()).padStart(2, "0");
                  const timestamp = Date.now().toString().slice(-4);
                  orderNumber = `${month}${day}${timestamp}`;
                }
              } catch (error) {
                console.error("Error generating order number:", error);
                // Fallback to date-based number
                const now = new Date();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                const timestamp = Date.now().toString().slice(-4);
                orderNumber = `${month}${day}${timestamp}`;
              }
            }

            // Print receipt
            printReceipt(orderNumber, "qpay", formData.address);

            clearCart();
            clearInterval(interval); // Stop polling
            setTimeout(() => {
              closeDialog();
              router.push("/"); // Change to the desired redirect path
            }, 5000);
          } else if (paymentStatus === "FAILED") {
            console.error("❌ Payment Failed");
            setPaymentStatus("Төлбөр амжилтгүй боллоо");
            clearInterval(interval); // Stop polling
          } else if (data.status === "Failed") {
            // Handle API-level errors
            const errorMessage =
              data.error ||
              (data.msgList && Array.isArray(data.msgList)
                ? data.msgList.join(", ")
                : "Тодорхойгүй алдаа");
            console.error("❌ QPay API Error:", errorMessage);
            setPaymentStatus(`Алдаа: ${errorMessage}`);
            clearInterval(interval); // Stop polling
          }
          // If payment_status is "NEW" or undefined, continue polling
        } catch (error) {
          console.error("❌ Polling error:", error);
          // Don't stop polling on network errors - might be temporary
          // Only log the error and continue
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

            // Get order number from API response (generated on server side)
            let orderNumber = data.data?.orderNumber || "";
            if (!orderNumber) {
              // Fallback: Generate order number from API if not in response
              try {
                const orderRes = await fetch("/api/generate-order-number");
                if (orderRes.ok) {
                  const orderData = await orderRes.json();
                  orderNumber = orderData.orderNumber;
                } else {
                  // Fallback to date-based number if API fails
                  const now = new Date();
                  const month = String(now.getMonth() + 1).padStart(2, "0");
                  const day = String(now.getDate()).padStart(2, "0");
                  const timestamp = Date.now().toString().slice(-4);
                  orderNumber = `${month}${day}${timestamp}`;
                }
              } catch (error) {
                console.error("Error generating order number:", error);
                // Fallback to date-based number
                const now = new Date();
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const day = String(now.getDate()).padStart(2, "0");
                const timestamp = Date.now().toString().slice(-4);
                orderNumber = `${month}${day}${timestamp}`;
              }
            }

            // Print receipt
            printReceipt(orderNumber, "storepay", formData.address);

            clearCart();
            clearInterval(interval); // Stop polling
            setTimeout(() => {
              closeDialog();
              router.push("/"); // Change to the desired redirect path
            }, 5000);
          } else if (data.status === "Failed" && data.msgList) {
            console.error("Error: ", data.msgList);
            setPaymentStatus(
              "Нэхэмжлэх үүсгэгдээгүй: " + data.msgList.join(", "),
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

  // POS Payment Functions - Direct to POS service (matching Golomt POS integration)
  const sendPOSRequest = async (requestData: any) => {
    try {
      // Convert to JSON string and then to Base64
      const jsonString = JSON.stringify(requestData);
      const base64Data = btoa(jsonString); // Browser's btoa for Base64 encoding
      console.log("Request JSON:", jsonString);
      console.log("Base64:", base64Data);

      // Get POS service URL from environment or use default
      const posServiceUrl =
        process.env.NEXT_PUBLIC_POS_SERVICE_URL || "http://localhost:8500";
      // Don't use encodeURIComponent - match Golomt POS integration
      const requestUrl = `${posServiceUrl}/requestToPos/message?data=${base64Data}`;

      console.log("Sending POS request to:", requestUrl);
      console.log("Request data:", requestData);

      // Make GET request directly to POS service
      const response = await fetch(requestUrl, {
        method: "GET",
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("POS Service Error:", errorText);
        throw new Error("POS терминалтай холбогдож чадсангүй");
      }

      const data = await response.json();
      console.log("POS Response:", data);

      // Parse response similar to Golomt POS integration
      // The response has a PosResult field that contains a JSON string
      let responseCode = null;
      let responseDesc = null;

      if (data.PosResult) {
        try {
          const parsedResult = JSON.parse(data.PosResult);
          responseCode = parsedResult.responseCode;
          responseDesc = parsedResult.responseDesc;
          console.log(
            "Parsed PosResult - Code:",
            responseCode,
            "Desc:",
            responseDesc,
          );
        } catch (e) {
          console.error("Error parsing PosResult:", e);
          // Fallback to direct fields if PosResult parsing fails
          responseCode = data.responseCode;
          responseDesc = data.responseDesc;
        }
      } else {
        // Fallback to direct fields
        responseCode = data.responseCode;
        responseDesc = data.responseDesc;
      }

      return {
        responseCode,
        responseDesc,
        rawData: data,
      };
    } catch (error) {
      console.error("POS Request Error:", error);
      throw error;
    }
  };

  // Timeout ref to track payment timeout
  const posPaymentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track if payment is processing (to avoid stale state in timeout)
  const isProcessingRef = useRef(false);

  const processPOSPayment = async () => {
    console.log("=== processPOSPayment called ===");
    setStep(3);
    setPosProcessing(true);
    isProcessingRef.current = true;
    setPaymentStatus("Картаа уншуулна уу...");

    // Calculate final amount
    // According to spec: "1000" means 10.00 төгрөг displayed in POS
    // So: amount field value / 100 = display amount
    // To charge 1000 MNT, send "100000" (1000 * 100)
    const finalPrice = includeVAT ? Math.floor(totalPrice * 0.9) : totalPrice;
    const amountInSmallestUnit = Math.round(finalPrice * 100).toString();

    const requestId = `PAY-${Date.now()}`;
    setPosRequestId(requestId);

    // Set a timeout to prevent indefinite waiting (9 minutes = 540000ms as per POS timeout)
    // Add extra buffer for network delays
    posPaymentTimeoutRef.current = setTimeout(() => {
      if (isProcessingRef.current) {
        console.error("⚠️ POS Payment timeout - no response received");
        isProcessingRef.current = false;
        setPosProcessing(false);
        setPaymentStatus(
          "Төлбөрийн хариу ирээгүй. Дахин оролдоно уу эсвэл кассын ажилтантай холбогдоно уу.",
        );
      }
    }, 600000); // 10 minutes total timeout

    const purchaseRequest = {
      requestID: requestId,
      portNo: process.env.NEXT_PUBLIC_POS_PORT_NO || "9",
      timeout: "540000",
      terminalID: process.env.NEXT_PUBLIC_POS_TERMINAL_ID || "15168631",
      amount: amountInSmallestUnit,
      currencyCode: "496",
      operationCode: "1", // Purchase
      bandWidth: "115200",
      cMode: "",
      cMode2: "",
      additionalData: "",
      cardEntryMode: "",
      fileData: "",
    };

    console.log("POS Purchase Request:", purchaseRequest);
    console.log("Amount in smallest unit:", amountInSmallestUnit);
    console.log("Final price:", finalPrice);

    try {
      // Send request directly to POS service
      const data = await sendPOSRequest(purchaseRequest);

      console.log("POS Purchase Response Data:", data);
      console.log("POS Response Code:", data.responseCode);
      console.log("POS Response Desc:", data.responseDesc);

      // Clear timeout on response
      if (posPaymentTimeoutRef.current) {
        clearTimeout(posPaymentTimeoutRef.current);
        posPaymentTimeoutRef.current = null;
      }

      // Handle response codes - Golomt POS uses "00" for success
      if (data.responseCode === "00" || data.responseCode === "0") {
        console.log("POS Payment SUCCESS!");
        // SUCCESS
        isProcessingRef.current = false;
        setPosProcessing(false);
        setPaymentStatus("Төлбөр амжилттай!");

        // Generate order number from API
        let orderNumber = "";
        try {
          const orderRes = await fetch("/api/generate-order-number");
          if (orderRes.ok) {
            const orderData = await orderRes.json();
            orderNumber = orderData.orderNumber;
          } else {
            // Fallback to date-based number if API fails
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            orderNumber = `${month}${day}0001`;
          }
        } catch (error) {
          console.error("Error generating order number:", error);
          // Fallback to date-based number
          const now = new Date();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          orderNumber = `${month}${day}0001`;
        }

        // Print receipt
        printReceipt(orderNumber, "pos", formData.address);

        // Create WooCommerce order (reduces stock)
        await createWooCommerceOrder(
          `pos:${requestId}`,
          "pos",
          orderNumber,
          finalPrice,
        );

        // Send email notification
        await sendPOSOrderEmail(finalPrice, orderNumber);

        // Clear cart
        clearCart();

        // Redirect after delay (increased to give users time to read the message)
        setTimeout(() => {
          setOpen(false);
          setStep(1);
          setPaymentStatus("");
          router.push("/");
        }, 6000); // 6 seconds delay
      } else {
        // Handle error - show response description from POS
        isProcessingRef.current = false;
        setPosProcessing(false);
        // Clear timeout on error
        if (posPaymentTimeoutRef.current) {
          clearTimeout(posPaymentTimeoutRef.current);
          posPaymentTimeoutRef.current = null;
        }
        const errorMsg = data.responseDesc || "Төлбөр амжилтгүй боллоо";
        setPaymentStatus(errorMsg); // Remove "Алдаа: " prefix, UI will show it
      }
    } catch (error) {
      isProcessingRef.current = false;
      setPosProcessing(false);
      // Clear timeout on error
      if (posPaymentTimeoutRef.current) {
        clearTimeout(posPaymentTimeoutRef.current);
        posPaymentTimeoutRef.current = null;
      }
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Төлбөр боловсруулахад алдаа гарлаа. Дахин оролдоно уу.";
      setPaymentStatus(errorMsg); // UI will show "Алдаа гарлаа" header
    }
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (posPaymentTimeoutRef.current) {
        clearTimeout(posPaymentTimeoutRef.current);
      }
    };
  }, []);

  // Clear method error when payment method changes
  useEffect(() => {
    if (methodError) {
      setMethodError("");
    }
  }, [selected]);

  // Disable VAT discount for StorePay - automatically uncheck if StorePay is selected
  useEffect(() => {
    if (selected === "storepay" && includeVAT) {
      setIncludeVAT(false);
    }
  }, [selected]);

  const createWooCommerceOrder = async (
    paymentRef: string,
    paymentMethod: "qpay" | "storepay" | "pos",
    orderNumber: string,
    amount: number,
  ) => {
    try {
      const res = await fetch("/api/woocommerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentRef,
          paymentMethod,
          cartItems,
          amount,
          formData,
          isDelivered,
          kioskOrderNumber: orderNumber,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(
          `[Kiosk WC] POS order failed`,
          JSON.stringify({ paymentRef, status: res.status, error: err })
        );
        return null;
      }
      const result = await res.json();
      console.log(
        `[Kiosk WC] POS order result`,
        JSON.stringify({ paymentRef, ...result })
      );
      return result;
    } catch (error) {
      console.error(
        `[Kiosk WC] POS order error`,
        JSON.stringify({
          paymentRef,
          error: error instanceof Error ? error.message : String(error),
        })
      );
      return null;
    }
  };

  const sendPOSOrderEmail = async (amount: number, orderNumber: string) => {
    try {
      const emailCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("clientEmail="))
        ?.split("=")[1];

      if (!emailCookie) {
        console.error("Email cookie not found");
        return;
      }

      const email = decodeURIComponent(emailCookie);

      // Format email content (similar to QPay/StorePay)
      const checkoutType = `<p><strong>Худалдан авалтын төрөл:</strong> ${
        isDelivered ? "Хүргэлтээр" : "Бэлэнээр"
      }</p>`;

      const sortedCartItems = [
        ...cartItems.filter((item: any) => item.stock_status === "instock"),
        ...cartItems.filter((item: any) => item.stock_status === "onbackorder"),
      ];

      const cartItemsList = sortedCartItems
        .map(
          (item: any) =>
            `<p><strong>${item.name}</strong> (Барааны код: ${item.id}) - ${
              item.price
            }₮, Ширхэг: ${item.quantity} <em>(${
              item.stock_status === "onbackorder" ? "Захиалгаар" : "Бэлэн"
            })</em></p>`,
        )
        .join("");

      const hasBackorderItems = cartItems.some(
        (item: any) => item.stock_status === "onbackorder",
      );

      const formDataSection =
        hasBackorderItems || isDelivered
          ? `
      <h4>Захиалгын мэдээлэл:</h4>
      <p><strong>Хаяг:</strong> ${formData.address}</p>
      <p><strong>Утас 1:</strong> ${formData.phone}</p>
      <p><strong>Утас 2:</strong> ${formData.phone2}</p>
      <p><strong>Имэйл:</strong> ${formData.email}</p>
    `
          : "";

      // Send email via API
      await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Шинэ худалдан авалт баталгаажлаа!",
          html: `
      <p>Үйлчлүүлэгчийн <strong>${amount}₮</strong>-ийн худалдан авалтын нэхэмжлэл амжилттай үүсгэгдлээ.</p>
      <p><strong>Захиалгын дугаар:</strong> ${orderNumber}</p>
      ${checkoutType}
      <h4>Сагсанд байгаа бүтээгдэхүүнүүд:</h4>
      ${cartItemsList}
      ${formDataSection}
    `,
        }),
      });
    } catch (error) {
      console.error("Error sending POS order email:", error);
    }
  };

  console.log(selected);
  console.log(paymentStatus);
  console.log(formData);
  // Handle dialog close - prevent closing during active POS payment
  // Note: StorePay closing is prevented via onPointerDownOutside and onEscapeKeyDown
  // to allow close button to work
  const handleDialogClose = (isOpen: boolean) => {
    // Prevent closing if POS payment is in progress
    if (!isOpen && posProcessing) {
      // Show alert to user
      alert("Төлбөр боловсруулаж байна. Түр хүлээнэ үү. Модал хаах боломжгүй.");
      // Force dialog to stay open
      return;
    }

    // Allow normal close if not processing
    setOpen(false);
    if (!isOpen) {
      setStep(1); // Reset page to 1 when dialog closes

      // Cleanup: If POS was processing but user somehow closed, reset state
      if (posProcessing || isProcessingRef.current) {
        console.warn(
          "⚠️ Dialog closed during active POS payment - resetting state",
        );
        isProcessingRef.current = false;
        setPosProcessing(false);
        setPaymentStatus("");
        setPosRequestId("");
        // Clear timeout
        if (posPaymentTimeoutRef.current) {
          clearTimeout(posPaymentTimeoutRef.current);
          posPaymentTimeoutRef.current = null;
        }
      }
    }
  };

  return (
    <Dialog onOpenChange={handleDialogClose} open={open}>
      <DialogContent
        className="p-6"
        onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside during POS payment or StorePay payment
          if (
            posProcessing ||
            (selected === "storepay" && paymentStatus !== "Төлбөр амжилттай!")
          ) {
            e.preventDefault();
            alert(
              "Төлбөр боловсруулж байна. Түр хүлээнэ үү. Модал хаах боломжгүй.",
            );
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing by pressing ESC during POS payment or StorePay payment
          if (
            posProcessing ||
            (selected === "storepay" && paymentStatus !== "Төлбөр амжилттай!")
          ) {
            e.preventDefault();
            alert(
              "Төлбөр боловсруулж байна. Түр хүлээнэ үү. Модал хаах боломжгүй.",
            );
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold margin-auto">
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
                                ? "text-[#35629c]"
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
                        onClick={() => removeItem(item)}
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
                  includeVAT ? Math.floor(totalPrice * 0.9) : totalPrice,
                )}
                ₮
              </span>
            </p>

            {/* Action Buttons */}
            <div className="flex justify-between gap-6 mt-10 w-2/3 mx-auto">
              <Button
                variant="outline"
                className="text-2xl px-8 py-4 active:bg-gray-500"
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
            <div className="flex flex-col space-y-4 mt-4 ">
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
                onClick={() => {
                  setStep(1);
                  setSelected("");
                }}
              >
                Буцах
              </Button>
              <Button
                variant="outline"
                className="text-2xl px-8 py-4 bg-[#ab3030] text-white"
                onClick={(e) => {
                  e.preventDefault(); // Prevents default form submission
                  if (validate2()) {
                    handleSubmit(e);
                    handleSubmitForMethod();
                    if (selected == "qpay") {
                      createQPayInvoice();
                    } else if (selected == "storepay") {
                      // Check if StorePay total is over 100,000 MNT
                      // StorePay always uses totalPrice without VAT discount
                      if (totalPrice <= 100000) {
                        setMethodError(
                          "StorePay нь 100,000₮-аас дээш дүнд ашиглах боломжтой",
                        );
                        return;
                      }
                      createStorePayInvoice();
                    } else if (selected == "pos") {
                      processPOSPayment();
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
            <div className="w-[450px] h-[854px] text-center">
              {" "}
              {selected == "qpay" && paymentStatus !== "Төлбөр амжилттай!" ? (
                <div
                  className=" w-full flex flex-col p-20 text-center "
                  style={{
                    fontFamily: "Oswald, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  <p className="mt-4">QPay-ээр төлөх</p>
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
                    <p
                      className="text-[30px] font-extrabold"
                      style={{
                        fontFamily: "Oswald, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {paymentStatus}
                    </p>
                  </div>
                )}
              {selected == "pos" && (
                <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[400px]">
                  {posProcessing &&
                  paymentStatus !== "Төлбөр амжилттай!" &&
                  !paymentStatus.includes("Алдаа") &&
                  !paymentStatus.includes("алдаа") ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#ab3030] border-t-transparent"></div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-bold text-[#ab3030]">
                          {paymentStatus || "Гүйлгээ хүлээгдэж байна..."}
                        </p>
                        {paymentStatus === "Картаа уншуулна уу..." && (
                          <p className="text-lg text-gray-600 mt-4">
                            Картаа POS терминалд уншуулж, PIN кодоо оруулна уу.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : paymentStatus === "Төлбөр амжилттай!" ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p
                        className="text-3xl font-bold text-green-600"
                        style={{
                          fontFamily: "Oswald, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {paymentStatus}
                      </p>
                      <p
                        className="text-xl text-center text-gray-700 max-w-md px-4"
                        style={{
                          fontFamily: "Oswald, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        ТА БАРИМТАА КАССЫН АЖИЛТАНД
                        <br />
                        ӨГЧ БАРААГАА АВНА УУ БАЯРЛАЛАА
                      </p>
                    </div>
                  ) : paymentStatus ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-bold text-red-600">
                          Алдаа гарлаа
                        </p>
                        <p className="text-lg text-gray-700 max-w-sm">
                          {paymentStatus
                            .replace("Алдаа: ", "")
                            .replace("алдаа: ", "")}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              {selected == "pos" && !posProcessing && (
                <Button
                  variant="outline"
                  className="text-2xl px-8 py-4 m-auto mt-6"
                  onClick={() => {
                    setStep(2);
                    setPaymentStatus("");
                  }}
                >
                  Буцах
                </Button>
              )}
              {selected !== "pos" && (
                <Button
                  variant="outline"
                  className="text-2xl  py-4 m-auto"
                  onClick={() => {
                    setStep(2);
                    setSelected("");
                  }}
                >
                  Буцах
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
