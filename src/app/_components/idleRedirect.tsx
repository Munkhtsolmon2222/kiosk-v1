"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../../providers/cartContext";
import { useProducts } from "../../../providers/productContext";
import { useScannedProduct } from "../../../providers/scannedProductContext";

interface IdleRedirectProps {
  timeout?: number; // Timeout duration in milliseconds
  redirectPath?: string;
  excludePaths?: string[];
  dialogOpen?: boolean; // Added dialogOpen prop
}

const IdleRedirect = ({
  timeout = 30000, // Default to 30000 if not provided
  redirectPath = "/",
  excludePaths = [],
  dialogOpen = false, // Default to false if not provided
}: IdleRedirectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { cartItems, setCartItems } = useCart();
  const { data, isLoading, error } = useProducts();
  const {
    setScannedProduct,
    setIsModalOpen,
    isModalOpen,
    setNotificationMessage,
    setNotificationType,
  } = useScannedProduct();

  // Reset idle timer function
  const resetTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Set the new timeout based on the passed timeout prop
    timerRef.current = setTimeout(() => {
      if (pathname !== redirectPath && !excludePaths.includes(pathname)) {
        setCartItems([]); // Clear the cart
        localStorage.removeItem("cart"); // Clear cart in localStorage
        router.push(redirectPath); // Redirect to the provided path
      }
    }, timeout);
  }, [timeout, pathname, redirectPath, excludePaths, router, setCartItems]);

  // Find product by barcode/SKU
  const findProductByBarcode = useCallback(
    (barcodeValue: string) => {
      if (!data || isLoading || !barcodeValue) {
        console.log("🔍 Бар код хайлт: Өгөгдөл байхгүй эсвэл ачааллаж байна", {
          hasData: !!data,
          isLoading,
          barcodeValue,
        });
        return null;
      }

      const bigData = data.pages.flatMap((page) => page.data) || [];
      const dataSpread = [...bigData];
      console.log(`🔍 ${dataSpread.length} бүтээгдэхүүн дундаас хайж байна...`);

      // Search for product by SKU (case-insensitive, trimmed)
      const normalizedBarcode = barcodeValue.trim().toLowerCase();
      const product = dataSpread.find((product: any) => {
        const productSku = product?.sku?.toString().trim().toLowerCase();
        const matches = productSku === normalizedBarcode;
        if (matches) {
          console.log("✅ Тайлбар олдлоо!", {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
          });
        }
        return matches;
      });

      if (!product) {
        // Log first few products' SKUs for debugging
        const sampleSkus = dataSpread
          .slice(0, 5)
          .map((p: any) => p?.sku)
          .filter(Boolean);
        console.log("❌ Бүтээгдэхүүн олдсонгүй. Жишээ SKU-ууд:", sampleSkus);
      }

      return product || null;
    },
    [data, isLoading]
  );

  // Open product modal with scanned product
  const openProductModal = useCallback(
    (product: any) => {
      if (!product) {
        console.warn("⚠️ Бүтээгдэхүүн байхгүй байна");
        return false;
      }

      console.log("📝 Бүтээгдэхүүнийг context-д хадгалж байна:", product.name);
      // Set the scanned product first
      setScannedProduct(product);
      // Use a small timeout to ensure state is updated before opening modal
      setTimeout(() => {
        setIsModalOpen(true);
        console.log("✅ Бүтээгдэхүүний модал нээгдлээ:", product.name);
      }, 10);
      return true;
    },
    [setScannedProduct, setIsModalOpen]
  );

  // Handle barcode scanning
  useEffect(() => {
    const barcodeInput = barcodeInputRef.current;
    console.log("🎯 Barcode input ref:", barcodeInput);
    if (!barcodeInput) {
      console.error("❌ Barcode input element not found!");
      return;
    }

    console.log("✅ Barcode input element found, setting up listeners...");

    // Don't focus the input to prevent virtual keyboard on touchscreen kiosks
    // The global keyboard listener will handle barcode scanner input
    console.log("🔍 Barcode scanner ready (using global keyboard listener)");

    // Handle barcode input
    const handleBarcodeInput = (event: KeyboardEvent) => {
      console.log("⌨️ Key pressed:", event.key, "Value:", barcodeInput.value);
      // Reset timer on any keyboard activity
      resetTimer();

      // Handle Enter key (barcode scanners typically send Enter after scanning)
      if (event.key === "Enter" && barcodeInput.value.trim()) {
        event.preventDefault();
        const barcodeValue = barcodeInput.value.trim();

        console.log("Уншсан бар код:", barcodeValue);

        // Find product by barcode
        const product = findProductByBarcode(barcodeValue);
        console.log("🔍 Бар код хайлт:", barcodeValue);
        console.log("📦 Олдсон бүтээгдэхүүн:", product);

        if (product) {
          // Open product modal to show product details
          console.log("🚀 Модал нээх гэж байна...");
          openProductModal(product);
          console.log("✅ Модал нээх функц дуудагдав");
          // Clear input and refocus for next scan
          barcodeInput.value = "";
          setTimeout(() => barcodeInput.focus(), 50);
        } else {
          // Product not found
          console.warn("❌ Бүтээгдэхүүн олдсонгүй. Бар код:", barcodeValue);
          // Show error notification
          setNotificationMessage(`Бүтээгдэхүүн олдсонгүй`);
          setNotificationType("error");
          barcodeInput.value = "";
          setTimeout(() => barcodeInput.focus(), 50);
        }
      }
    };

    // Add event listener
    barcodeInput.addEventListener("keydown", handleBarcodeInput);
    console.log("✅ Event listeners attached to barcode input");

    // Also handle input event for scanners that don't send Enter
    // Some scanners append data very quickly, so we'll use a debounce
    let inputTimeout: NodeJS.Timeout;
    const handleInput = () => {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        // If input has value and no Enter was pressed, check if it's a complete barcode
        // Most scanners send data very quickly, so if we have a value after a short delay,
        // we can assume it's complete
        if (barcodeInput.value.trim().length >= 3) {
          // Trigger search after a short delay (scanner might still be inputting)
          const checkValue = barcodeInput.value.trim();
          setTimeout(() => {
            if (barcodeInput.value.trim() === checkValue) {
              // Value hasn't changed, likely complete
              const product = findProductByBarcode(checkValue);
              if (product) {
                openProductModal(product);
                barcodeInput.value = "";
                barcodeInput.focus();
              }
            }
          }, 200);
        }
      }, 300);
    };

    barcodeInput.addEventListener("input", handleInput);
    barcodeInput.addEventListener("keydown", (e) => {
      console.log(
        "🔑 Keydown event on input:",
        e.key,
        "Value:",
        barcodeInput.value
      );
    });
    barcodeInput.addEventListener("keyup", (e) => {
      console.log(
        "🔑 Keyup event on input:",
        e.key,
        "Value:",
        barcodeInput.value
      );
    });

    // Note: Removed click-to-focus to prevent virtual keyboard on touchscreen kiosks
    // The input will still receive barcode scanner input via the global keyboard listener

    // Global keyboard listener for barcode scanners (primary method for kiosks)
    // This prevents virtual keyboard from appearing while still capturing barcode input
    let globalBarcodeBuffer = "";
    let globalBarcodeTimeout: NodeJS.Timeout;
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      // Only handle if no text input/textarea is actively being used by user
      const activeElement = document.activeElement;
      const isTextInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      // Allow barcode scanning even if our hidden input is focused
      const isOurBarcodeInput = activeElement?.id === "barcodeInput";

      if (!isTextInput || isOurBarcodeInput) {
        // If Enter is pressed, process the barcode
        if (event.key === "Enter" && globalBarcodeBuffer.trim()) {
          event.preventDefault();
          const barcodeValue = globalBarcodeBuffer.trim();
          console.log("🌐 Global: Уншсан бар код:", barcodeValue);

          const product = findProductByBarcode(barcodeValue);
          if (product) {
            openProductModal(product);
          } else {
            console.warn(
              "❌ Global: Бүтээгдэхүүн олдсонгүй. Бар код:",
              barcodeValue
            );
            // Show error notification
            setNotificationMessage(`Бүтээгдэхүүн олдсонгүй`);
            setNotificationType("error");
          }

          globalBarcodeBuffer = "";
          clearTimeout(globalBarcodeTimeout);
          return;
        }

        // If it's a printable character, add to buffer
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          globalBarcodeBuffer += event.key;
          clearTimeout(globalBarcodeTimeout);

          // Clear buffer after a delay (barcode scanners send data quickly)
          globalBarcodeTimeout = setTimeout(() => {
            if (globalBarcodeBuffer.length >= 3) {
              const barcodeValue = globalBarcodeBuffer.trim();
              console.log("🌐 Global (timeout): Уншсан бар код:", barcodeValue);

              const product = findProductByBarcode(barcodeValue);
              if (product) {
                openProductModal(product);
              } else {
                console.warn(
                  "❌ Global (timeout): Бүтээгдэхүүн олдсонгүй. Бар код:",
                  barcodeValue
                );
                // Show error notification
                setNotificationMessage(`Бүтээгдэхүүн олдсонгүй`);
                setNotificationType("error");
              }
            }
            globalBarcodeBuffer = "";
          }, 100);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    // Cleanup
    return () => {
      barcodeInput.removeEventListener("keydown", handleBarcodeInput);
      barcodeInput.removeEventListener("input", handleInput);
      window.removeEventListener("keydown", handleGlobalKeydown);
      clearTimeout(inputTimeout);
      clearTimeout(globalBarcodeTimeout);
    };
  }, [
    data,
    isLoading,
    dialogOpen,
    isModalOpen,
    findProductByBarcode,
    openProductModal,
    resetTimer,
    setNotificationMessage,
    setNotificationType,
  ]);

  // Idle redirect timer effect
  useEffect(() => {
    // Don't trigger timeout if dialog or product modal is open
    if (dialogOpen || isModalOpen) {
      return; // Do not reset the timer when the dialog or modal is open
    }

    // Add event listeners to reset the timer on activity
    const events = ["click", "mousemove", "keydown", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Reset the timer when the component mounts or when the timeout changes
    resetTimer();

    return () => {
      // Cleanup event listeners when the component unmounts or re-renders
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [
    timeout,
    dialogOpen,
    isModalOpen,
    pathname,
    excludePaths,
    router,
    setCartItems,
  ]);

  return (
    <input
      ref={barcodeInputRef}
      id="barcodeInput"
      type="text"
      autoComplete="off"
      inputMode="none"
      readOnly
      tabIndex={-1}
      placeholder="Кодоо оруулна уу"
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        border: "none",
        outline: "none",
        padding: 0,
        margin: 0,
      }}
    />
  );
};

export default IdleRedirect;
