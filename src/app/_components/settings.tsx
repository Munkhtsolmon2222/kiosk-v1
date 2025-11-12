import { AiFillSetting } from "react-icons/ai";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { useCategories } from "../../../providers/CategoriesContext";
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
const ALLOWED_CODE = "123456";

export function Settings({
  onSelectCategory,
  onSubCategory,
  onThirdCategory,
}: any) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const {
    data1,
    isLoading,
    isError,
    error,
    setMainCategory,
    mainCategory,
    setSubCategory,
    subCategory,
    setThirdCategory,
    thirdCategory,
  } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<any>(mainCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>("");
  const [selectedThirdCategory, setSelectedThirdCategory] =
    useState<any>(thirdCategory);
  const [email, setEmail] = useState(getCookie("clientEmail") || "");
  const [emailError, setEmailError] = useState("");
  const [portNo, setPortNo] = useState(getCookie("posPortNo") || process.env.NEXT_PUBLIC_POS_PORT_NO || "9");
  // Error state for category selection
  const [categoryError, setCategoryError] = useState({
    mainCategory: false,
    subCategory: false,
    thirdCategory: false,
  });
  const [departmentError, setDepartmentError] = useState(false);
  const [department, setDepartment] = useState<any>("kegel");
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [settlementing, setSettlementing] = useState(false);
  const [settlementStatus, setSettlementStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleOpen = () => {
    setOpen(true);
    setIsCodeVerified(false);
  };

  const handleVerifyCode = () => {
    if (code === ALLOWED_CODE) {
      setIsCodeVerified(true);
    } else {
      alert("❌ Буруу код эсвэл дугаар байна!");
    }
    setCode("");
  };

  const handleSave = () => {
    let valid = true;
    if (!validateEmail(email)) {
      setEmailError("Зөв имэйл хаяг оруулна уу.");
      return;
    }
    // Reset errors
    setCategoryError({
      mainCategory: false,
      subCategory: false,
      thirdCategory: false,
    });
    setDepartmentError(false);
    // Check if categories are selected properly (not the placeholder option)
    if (selectedCategory === "choose category") {
      valid = false;
      setCategoryError((prev) => ({ ...prev, mainCategory: true }));
    }
    if (selectedSubCategory === "choose category") {
      valid = false;
      setCategoryError((prev) => ({ ...prev, subCategory: true }));
    }
    // Only validate third category if third categories exist (field is visible)
    // thirdCategories is already calculated in component body based on selectedSubCategory
    if (thirdCategories.length > 0) {
      if (selectedThirdCategory === "choose category" || !selectedThirdCategory) {
        valid = false;
        setCategoryError((prev) => ({ ...prev, thirdCategory: true }));
      }
    }

    // If any category is not selected correctly, show alert and return
    if (!valid) {
      alert("Please select all required categories.");
      return;
    }

    // Execute the category selection callbacks
    onSelectCategory(selectedCategory);
    onSubCategory(selectedSubCategory);
    onThirdCategory(selectedThirdCategory);

    if (selectedThirdCategory && selectedCategory) {
      setCookie("defaultCategory", selectedThirdCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategoryMain", selectedCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategorySub", selectedSubCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("defaultCategoryThird", selectedThirdCategory, {
        maxAge: 3650 * 24 * 60 * 60,
      });
      setCookie("department", department, {
        maxAge: 3650 * 24 * 60 * 60,
      });
            setCookie("clientEmail", email, { maxAge: 3650 * 24 * 60 * 60 });
            setCookie("posPortNo", portNo, { maxAge: 3650 * 24 * 60 * 60 });
            console.log("setting", selectedThirdCategory);
          } else {
            setCookie("defaultCategory", selectedSubCategory, {
              maxAge: 3650 * 24 * 60 * 60,
            });
            setCookie("defaultCategoryMain", selectedCategory, {
              maxAge: 3650 * 24 * 60 * 60,
            });
            setCookie("defaultCategorySub", selectedSubCategory, {
              maxAge: 3650 * 24 * 60 * 60,
            });
            setCookie("defaultCategoryThird", selectedThirdCategory, {
              maxAge: 3650 * 24 * 60 * 60,
            });
            setCookie("department", department, {
              maxAge: 3650 * 24 * 60 * 60,
            });
            setCookie("clientEmail", email, { maxAge: 3650 * 24 * 60 * 60 });
            setCookie("posPortNo", portNo, { maxAge: 3650 * 24 * 60 * 60 });
            console.log("setting", selectedSubCategory);
          }

    // Reset the state and close the dialog
    setIsCodeVerified(false);
    setOpen(false);
  };

  const handleClose = () => {
    setIsCodeVerified(false);
    setCode("");
    setOpen(false);
    setConnectionStatus({ type: null, message: "" });
    setSettlementStatus({ type: null, message: "" });
  };

  const checkPOSConnection = async () => {
    setCheckingConnection(true);
    setConnectionStatus({ type: null, message: "" });

    try {
      const requestJson = {
        requestID: `CHECK-${Date.now()}`,
        portNo: portNo,
        timeout: "540000",
        terminalID: process.env.NEXT_PUBLIC_POS_TERMINAL_ID || "15168631",
        amount: "",
        currencyCode: "496",
        operationCode: "26",
        bandWidth: "115200",
        cMode: "",
        cMode2: "",
        additionalData: "",
        cardEntryMode: "",
        fileData: "",
      };

      const jsonString = JSON.stringify(requestJson);
      const base64Data = btoa(jsonString);

      const posServiceUrl =
        process.env.NEXT_PUBLIC_POS_SERVICE_URL || "http://localhost:8500";
      const requestUrl = `${posServiceUrl}/requestToPos/message?data=${base64Data}`;

      const response = await fetch(requestUrl, {
        method: "GET",
      });

      if (!response.ok) {
        setConnectionStatus({
          type: "error",
          message: "POS терминалтай холбогдож чадсангүй",
        });
        setCheckingConnection(false);
        return;
      }

      const result = await response.json();

      // Parse PosResult similar to the sample function
      let responseCode = null;
      let responseDesc = null;

      if (result.PosResult) {
        try {
          const parsedResult = JSON.parse(result.PosResult);
          responseCode = parsedResult.responseCode;
          responseDesc = parsedResult.responseDesc;
        } catch (e) {
          // Fallback to direct fields if PosResult parsing fails
          responseCode = result.responseCode;
          responseDesc = result.responseDesc;
        }
      } else {
        responseCode = result.responseCode;
        responseDesc = result.responseDesc;
      }

      if (responseCode === "00" || responseCode === "0") {
        setConnectionStatus({
          type: "success",
          message: "POS терминалтай холболт амжилттай",
        });
      } else {
        setConnectionStatus({
          type: "error",
          message: responseDesc || "Алдаа гарлаа",
        });
      }
    } catch (error) {
      setConnectionStatus({
        type: "error",
        message: "POS терминалтай холбогдож чадсангүй",
      });
    } finally {
      setCheckingConnection(false);
    }
  };

  // Track active print operations to prevent duplicates (using ref to persist across renders)
  const activePrintOperationRef = useRef<string | null>(null);

  const printSettlementReceipt = (receiptData: string) => {
    // Create a unique ID for this print operation
    const operationId = `settlement-print-${Date.now()}-${Math.random()}`;
    
    // If there's already an active print operation, skip this one
    if (activePrintOperationRef.current) {
      console.log("Print operation already in progress, skipping duplicate call");
      return;
    }
    
    activePrintOperationRef.current = operationId;
    
    // Create a hidden iframe for printing (better for kiosk environment)
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    // Extract key-value pairs from receipt data using regex (matching TotalReceipt component)
    const regex = /(TOTALAMOUNT|TOTALTRANSACTION|BATCHNO|ТЕРМИНАЛ|0ОГНОО\/ЦАГ|ГјЙЛГЭЭSUM|ДјН|TERMINAL|DATE|AMOUNT):(.*?)(?=@|$)/gi;
    const extractedValues: { [key: string]: string } = {};

    let match;
    while ((match = regex.exec(receiptData)) !== null) {
      const key = match[1].toUpperCase();
      const value = match[2].trim();
      if (key && value) {
        extractedValues[key] = value;
      }
    }

    // Convert keys to Mongolian Cyrillic labels
    const convertString = (key: string): string => {
      const upperKey = key.toUpperCase();
      switch (upperKey) {
        case "TOTALAMOUNT":
          return "Нийт дүн";
        case "TOTALTRANSACTION":
          return "Нийт гүйлгээ";
        case "BATCHNO":
          return "Багц дугаар";
        case "ТЕРМИНАЛ":
        case "TERMINAL":
          return "Терминал";
        case "0ОГНОО/ЦАГ":
        case "DATE":
          return "Огноо/Цаг";
        case "ГјЙЛГЭЭSUM":
          return "Гүйлгээ нийлбэр";
        case "ДјН":
        case "AMOUNT":
          return "Нийт";
        default:
          return key;
      }
    };

    // Escape HTML special characters
    const escapeHtml = (text: string): string => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    // Build table rows from extracted values
    const receiptRows = Object.entries(extractedValues)
      .map(
        ([key, value]) => `
      <tr>
        <td width="66%" style="padding: 4px 0;">${escapeHtml(convertString(key))}:</td>
        <td align="left" style="font-weight: bold; padding: 4px 0;">${escapeHtml(value)}</td>
      </tr>`
      )
      .join("");

    // Format the receipt data - it's typically plain text from POS
    // Wrap it in a printable HTML structure
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Өдөр өндөрлөлтийн баримт</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              * {
                font-size: inherit !important;
                page-break-inside: avoid !important;
              }
              body {
                margin: 0;
                padding: 3mm;
                font-family: 'Courier New', monospace;
                font-size: 30px !important;
                line-height: 1.3 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .receipt-header {
                font-size: 33px !important;
                margin-bottom: 5px !important;
                padding-bottom: 5px !important;
                font-weight: bold !important;
              }
              .receipt-content {
                font-size: 30px !important;
                line-height: 1.4 !important;
                margin: 5px 0 !important;
              }
              .receipt-content table {
                width: 100%;
                border-collapse: collapse;
              }
              .receipt-content td {
                padding: 4px 0 !important;
                font-size: 30px !important;
              }
              .receipt-footer {
                font-size: 27px !important;
                margin-top: 5px !important;
                padding-top: 5px !important;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 27px;
              line-height: 1.6;
              padding: 20px;
              max-width: 80mm;
              margin: 0 auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .receipt-header {
              text-align: center;
              font-weight: bold;
              margin-bottom: 5px;
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
              font-size: 30px;
            }
            .receipt-content {
              margin: 5px 0;
              font-family: 'Courier New', monospace;
              font-size: 27px;
              line-height: 1.4;
            }
            .receipt-content table {
              width: 100%;
              border-collapse: collapse;
            }
            .receipt-content td {
              padding: 4px 0;
              font-size: 27px;
            }
            .receipt-footer {
              margin-top: 5px;
              border-top: 1px dashed #000;
              padding-top: 5px;
              text-align: center;
              font-size: 24px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">ӨДӨР ӨНДӨРЛӨЛТИЙН БАРИМТ</div>
          <div class="receipt-content">
            ${
              receiptRows
                ? `<table style="width: 100%; border-collapse: collapse;">
                    ${receiptRows}
                  </table>`
                : "<p>Баримтын мэдээлэл олдсонгүй</p>"
            }
          </div>
          <div class="receipt-footer">
            ${new Date().toLocaleString("mn-MN")}
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

    // Flag to prevent double printing - use a unique identifier
    const printId = `print-${Date.now()}-${Math.random()}`;
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

  const performSettlement = async () => {
    setSettlementing(true);
    setSettlementStatus({ type: null, message: "" });

    try {
      // Step 1: Check connection first (operation code 26)
      const checkRequestJson = {
        requestID: `CHECK-${Date.now()}`,
        portNo: portNo,
        timeout: "540000",
        terminalID: process.env.NEXT_PUBLIC_POS_TERMINAL_ID || "15168631",
        amount: "",
        currencyCode: "496",
        operationCode: "26",
        bandWidth: "115200",
        cMode: "",
        cMode2: "",
        additionalData: "",
        cardEntryMode: "",
        fileData: "",
      };

      const checkJsonString = JSON.stringify(checkRequestJson);
      const checkBase64Data = btoa(checkJsonString);

      const posServiceUrl =
        process.env.NEXT_PUBLIC_POS_SERVICE_URL || "http://localhost:8500";
      const checkRequestUrl = `${posServiceUrl}/requestToPos/message?data=${checkBase64Data}`;

      // First, check connection
      const checkResponse = await fetch(checkRequestUrl, {
        method: "GET",
      });

      if (!checkResponse.ok) {
        setSettlementStatus({
          type: "error",
          message: "Холболт шалгахад алдаа гарлаа",
        });
        setSettlementing(false);
        return;
      }

      const checkResult = await checkResponse.json();

      // Parse check connection response
      let checkResponseCode = null;
      if (checkResult.PosResult) {
        try {
          const parsedCheckResult = JSON.parse(checkResult.PosResult);
          checkResponseCode = parsedCheckResult.responseCode;
        } catch (e) {
          checkResponseCode = checkResult.responseCode;
        }
      } else {
        checkResponseCode = checkResult.responseCode;
      }

      // If connection check fails, stop here
      if (checkResponseCode !== "00" && checkResponseCode !== "0") {
        setSettlementStatus({
          type: "error",
          message: "Холболт шалгахад алдаа гарлаа. Өдөр өндөрлөх боломжгүй.",
        });
        setSettlementing(false);
        return;
      }

      // Step 2: Perform settlement (operation code 59)
      const settlementRequestJson = {
        requestID: `SETTLE-${Date.now()}`,
        portNo: portNo,
        timeout: "540000",
        terminalID: process.env.NEXT_PUBLIC_POS_TERMINAL_ID || "15168631",
        amount: "",
        currencyCode: "496",
        operationCode: "59",
        bandWidth: "115200",
        cMode: "",
        cMode2: "",
        additionalData: "",
        cardEntryMode: "",
        fileData: "",
      };

      const settlementJsonString = JSON.stringify(settlementRequestJson);
      const settlementBase64Data = btoa(settlementJsonString);
      const settlementRequestUrl = `${posServiceUrl}/requestToPos/message?data=${settlementBase64Data}`;

      const settlementResponse = await fetch(settlementRequestUrl, {
        method: "GET",
      });

      if (!settlementResponse.ok) {
        setSettlementStatus({
          type: "error",
          message: "Өдөр өндөрлөхөд алдаа гарлаа",
        });
        setSettlementing(false);
        return;
      }

      const settlementResult = await settlementResponse.json();

      // Parse settlement response - matching the working implementation
      let settlementResponseCode = null;
      let settlementResponseDesc = null;
      let settlementData = null;

      if (settlementResult.PosResult) {
        try {
          // Parse PosResult JSON string to get data, responseCode, responseDesc
          const parsedSettlementResult = JSON.parse(settlementResult.PosResult);
          settlementResponseCode = parsedSettlementResult.responseCode;
          settlementResponseDesc = parsedSettlementResult.responseDesc;
          settlementData = parsedSettlementResult.data;
          console.log("Parsed PosResult:", parsedSettlementResult);
        } catch (e) {
          console.error("Error parsing PosResult:", e);
          settlementResponseCode = settlementResult.responseCode;
          settlementResponseDesc = settlementResult.responseDesc;
          settlementData = settlementResult.data;
        }
      } else {
        settlementResponseCode = settlementResult.responseCode;
        settlementResponseDesc = settlementResult.responseDesc;
        settlementData = settlementResult.data;
      }

      if (settlementResponseCode === "00" || settlementResponseCode === "0") {
        // If there's receipt data, decode it following the working implementation
        if (settlementData) {
          try {
            console.log("Raw settlementData:", settlementData);
            
            // Decode Base64 data (matching the working code: decode(data))
            const decodedString = atob(settlementData);
            console.log("Decoded Base64 string:", decodedString);
            
            // Parse the decoded string as JSON (matching: JSON.parse(decode(data)))
            const decodeData = JSON.parse(decodedString);
            console.log("Parsed decodeData:", decodeData);
            
            // Check for receiptData field
            if (decodeData.receiptData) {
              console.log("Receipt Data found:", decodeData.receiptData);
              setSettlementStatus({
                type: "success",
                message: "Өдөр өндөрлөлт амжилттай. Баримт хэвлэж байна...",
              });
              // Print the receipt
              printSettlementReceipt(decodeData.receiptData);
            } else {
              console.log("No receiptData in decodeData:", decodeData);
              setSettlementStatus({
                type: "success",
                message: "Өдөр өндөрлөгөө хийгдсэн",
              });
            }
          } catch (e) {
            console.error("Error decoding settlement data:", e);
            setSettlementStatus({
              type: "success",
              message: "Өдөр өндөрлөлт амжилттай",
            });
          }
        } else {
          setSettlementStatus({
            type: "success",
            message: "Өдөр өндөрлөлт амжилттай",
          });
        }
      } else {
        setSettlementStatus({
          type: "error",
          message: settlementResponseDesc || "Өдөр өндөрлөхөд алдаа гарлаа",
        });
      }
    } catch (error) {
      setSettlementStatus({
        type: "error",
        message: "Өдөр өндөрлөхөд алдаа гарлаа",
      });
    } finally {
      setSettlementing(false);
    }
  };

  useEffect(() => {
    setSelectedCategory(mainCategory);
    setSelectedSubCategory("");
    setSelectedThirdCategory(thirdCategory);
  }, [mainCategory, thirdCategory]);

  const categories = data1 || [];
  const subCategories = categories.filter(
    (category) =>
      category.parent ===
      (categories.find((c) => c.name === selectedCategory)?.id || null)
  );
  const thirdCategories = categories.filter(
    (category) =>
      category.parent ===
      (categories.find((c) => c.id === Number(selectedSubCategory))?.id || null)
  );
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  console.log(selectedCategory);

  console.log(selectedSubCategory);
  console.log(thirdCategories, subCategories);
  return (
    <div className="flex justify-center items-center">
      <Button variant="outline" onClick={handleOpen}>
        <AiFillSetting className="text-xl" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="fixed inset-0 flex items-center justify-center bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle className="sr-only">Тохиргоо</DialogTitle>

            {/* Code Verification Section */}
            {!isCodeVerified ? (
              <div className="grid gap-4 py-4">
                <label className="block text-sm font-medium">Нэвтрэх код</label>
                <input
                  type="password"
                  placeholder="Кодоо оруулна уу"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="border p-2 w-full"
                />
                <button
                  onClick={handleVerifyCode}
                  className="mt-4 p-2 bg-blue-500 text-white rounded w-full active:bg-blue-700"
                >
                  Нэвтрэх
                </button>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 py-4">
                  <label className="block text-sm font-medium">Имэйл</label>
                  <input
                    type="email"
                    placeholder="Имэйлээ оруулна уу"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full"
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>
                {/* POS Port Number Input */}
                <div className="grid gap-4 py-4">
                  <label className="block text-sm font-medium">POS Порт дугаар</label>
                  <input
                    type="text"
                    placeholder="Порт дугаараа оруулна уу (жишээ: 9)"
                    value={portNo}
                    onChange={(e) => setPortNo(e.target.value)}
                    className="border p-2 w-full"
                  />
                </div>
                {/* Main Category Selection */}
                <label className="block text-sm font-medium">
                  Үндсэн ангилал
                </label>
                <div>
                  <select
                    className={`border p-2 w-full ${
                      categoryError.mainCategory ? "border-red-500" : ""
                    }`}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="choose category">
                      Choose main category
                    </option>
                    <option value="Эрэгтэй">Эрэгтэй</option>
                    <option value="Эмэгтэй">Эмэгтэй</option>
                    <option value="Хосуудад">Хосуудад</option>
                    <option value="Парти">Парти тоглоом</option>
                  </select>
                  {categoryError.mainCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a main category.
                    </p>
                  )}
                </div>

                {/* Sub Category Selection */}
                <label className="block text-sm font-medium">Дэд ангилал</label>
                <div>
                  <select
                    className={`border p-2 w-full ${
                      categoryError.subCategory ? "border-red-500" : ""
                    }`}
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                  >
                    <option value="choose category">Choose subcategory</option>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                  </select>
                  {categoryError.subCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a subcategory.
                    </p>
                  )}
                </div>

                {/* Third Category Selection (Optional) */}
                {thirdCategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium">
                      Гуравдагч ангилал
                    </label>
                    <select
                      className={`border p-2 w-full ${
                        categoryError.thirdCategory ? "border-red-500" : ""
                      }`}
                      value={selectedThirdCategory}
                      onChange={(e) =>
                        setSelectedThirdCategory(Number(e.target.value))
                      }
                    >
                      <option value="choose category">
                        Choose third category
                      </option>
                      {thirdCategories.map((thirdCategory) => (
                        <option key={thirdCategory.id} value={thirdCategory.id}>
                          {thirdCategory.name}
                        </option>
                      ))}
                    </select>
                    {categoryError.thirdCategory && (
                      <p className="text-red-500 text-sm mt-1">
                        Please select a third category.
                      </p>
                    )}
                  </div>
                )}

                {/* Department Selection */}
                <label className="block text-sm font-medium">Тасаг</label>
                <div>
                  <select
                    className={`border p-2 w-full ${
                      departmentError ? "border-red-500" : ""
                    }`}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Kegel">Kegel</option>
                    <option value="Utree">Үтрээ</option>
                    <option value="Shodoi">Шодой томруулах багц сет</option>
                    <option value="Belgevch">Бэлгэвч</option>
                    <option value="Party">Парти тоглоом</option>
                    <option value="HiimelShodoi">Хиймэл шодой</option>
                    <option value="HuhniiPump">Хөхний памп</option>
                    <option value="TaviltUdaashruulagch">
                      Тавилт удаашруулагч
                    </option>
                    <option value="DotuurHuvtsas">Дотуур хувцас</option>
                  </select>
                  {departmentError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please select a department.
                    </p>
                  )}
                </div>

                {/* POS Connection Check */}
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium mb-2">
                    POS Холболт Шалгах
                  </label>
                  <Button
                    onClick={checkPOSConnection}
                    disabled={checkingConnection}
                    variant="outline"
                    className="w-full"
                  >
                    {checkingConnection ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></span>
                        Шалгаж байна...
                      </span>
                    ) : (
                      "Холболт шалгах"
                    )}
                  </Button>
                  {connectionStatus.type && (
                    <div
                      className={`mt-2 p-2 rounded text-sm ${
                        connectionStatus.type === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {connectionStatus.message}
                    </div>
                  )}
                </div>

                {/* POS Settlement */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    Өдөр Өндөрлөх
                  </label>
                  <Button
                    onClick={performSettlement}
                    disabled={settlementing || checkingConnection}
                    variant="outline"
                    className="w-full"
                  >
                    {settlementing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></span>
                        Өдөр өндөрлөж байна...
                      </span>
                    ) : (
                      "Өдөр өндөрлөх"
                    )}
                  </Button>
                  {settlementStatus.type && (
                    <div
                      className={`mt-2 p-2 rounded text-sm ${
                        settlementStatus.type === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {settlementStatus.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save and Close Buttons */}
            {isCodeVerified && (
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  className="active:bg-gray-300"
                  variant="outline"
                  onClick={handleClose}
                >
                  Болих
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    selectedCategory === "choose category" ||
                    selectedSubCategory === "choose category"
                  }
                  className="active:bg-gray-800"
                >
                  Хадгалах
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
