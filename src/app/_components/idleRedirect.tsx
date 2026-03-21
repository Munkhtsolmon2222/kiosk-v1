"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../../providers/cartContext";
import { useProducts } from "../../../providers/productContext";
import { useScannedProduct } from "../../../providers/scannedProductContext";

interface IdleRedirectProps {
  timeout?: number;
  redirectPath?: string;
  excludePaths?: string[];
  dialogOpen?: boolean;
}

/** Min length for substring match inside global_unique_id (avoids tiny codes matching everywhere). */
const MIN_GLOBAL_UNIQUE_SUBSTRING_LEN = 4;

function scanContainedInGlobalUniqueId(
  globalUniqueId: unknown,
  normalizedBarcode: string
): boolean {
  if (normalizedBarcode.length < MIN_GLOBAL_UNIQUE_SUBSTRING_LEN) return false;
  const haystack = globalUniqueId?.toString().trim().toLowerCase() ?? "";
  return haystack.length > 0 && haystack.includes(normalizedBarcode);
}

const IdleRedirect = ({
  timeout = 30000,
  redirectPath = "/",
  excludePaths = [],
  dialogOpen = false,
}: IdleRedirectProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { setCartItems } = useCart();
  const { data, isLoading } = useProducts();
  const {
    setScannedProduct,
    setIsModalOpen,
    isModalOpen,
    setNotificationMessage,
    setNotificationType,
  } = useScannedProduct();

  // Idle timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (pathname !== redirectPath && !excludePaths.includes(pathname)) {
        setCartItems([]);
        localStorage.removeItem("cart");
        router.push(redirectPath);
      }
    }, timeout);
  }, [timeout, pathname, redirectPath, excludePaths, router, setCartItems]);

  // Find product or variation by barcode
  const findProductByBarcode = useCallback(
    (barcodeValue: string) => {
      if (!data || isLoading || !barcodeValue) return null;

      const normalizedBarcode = barcodeValue.trim().toLowerCase();
      const dataSpread = data.pages.flatMap((page) => page.data) || [];
      console.log(`🔍 Нийт бүтээгдэхүүн: ${dataSpread.length}`);

      const matchesScan = (value: unknown) =>
        value != null &&
        value.toString().trim().toLowerCase() === normalizedBarcode;

      for (const product of dataSpread) {
        // Product: SKU, global_unique_id (exact), or scan as substring of global_unique_id
        if (
          matchesScan(product?.sku) ||
          matchesScan(product?.global_unique_id) ||
          scanContainedInGlobalUniqueId(
            product?.global_unique_id,
            normalizedBarcode
          )
        ) {
          console.log("✅ Product олдлоо:", product.name, product.sku);
          return { product, variation: null };
        }

        // Variations
        if (Array.isArray(product.variations) && product.variations.length) {
          const matchedVariation = product.variations.find((v: any) => {
            return (
              matchesScan(v?.sku) ||
              matchesScan(v?.barcode) ||
              matchesScan(v?.global_unique_id) ||
              scanContainedInGlobalUniqueId(
                v?.global_unique_id,
                normalizedBarcode
              )
            );
          });

          if (matchedVariation) {
            console.log(
              "✅ Variation олдлоо:",
              matchedVariation.sku,
              matchedVariation.barcode
            );
            return { product, variation: matchedVariation };
          }
        }
      }

      console.warn("❌ Бүтээгдэхүүн олдсонгүй:", barcodeValue);
      return null;
    },
    [data, isLoading]
  );

  // Open modal
  const openProductModal = useCallback(
    (result: { product: any; variation: any | null }) => {
      if (!result?.product) return false;

      console.log("📝 Modal-д дамжуулж байна:", {
        product: result.product.name,
        variation: result.variation?.sku || null,
      });

      setScannedProduct({
        ...result.product,
        selectedVariation: result.variation,
      });

      setTimeout(() => setIsModalOpen(true), 10);
      return true;
    },
    [setScannedProduct, setIsModalOpen]
  );

  // Barcode input listener
  useEffect(() => {
    barcodeInputRef.current?.focus();
    const barcodeInput = barcodeInputRef.current;
    if (!barcodeInput) return;

    const handleBarcodeInput = (event: KeyboardEvent) => {
      resetTimer();
      if (event.key === "Enter" && barcodeInput.value.trim()) {
        event.preventDefault();
        const barcodeValue = barcodeInput.value.trim();
        console.log("🔑 Scanner-н barcode:", barcodeValue);

        const result = findProductByBarcode(barcodeValue);
        if (result) {
          openProductModal(result);
        } else {
          setNotificationMessage("Бүтээгдэхүүн олдсонгүй");
          setNotificationType("error");
        }

        barcodeInput.value = "";
        setTimeout(() => barcodeInput.focus(), 50);
      }
    };

    barcodeInput.addEventListener("keydown", handleBarcodeInput);

    // Global keyboard listener
    let buffer = "";
    let timeout: NodeJS.Timeout;
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isOurInput = activeElement?.id === "barcodeInput";
      if (!activeElement || isOurInput) {
        if (event.key === "Enter" && buffer.trim()) {
          const barcodeValue = buffer.trim();
          buffer = "";
          const result = findProductByBarcode(barcodeValue);
          if (result) openProductModal(result);
          else {
            setNotificationMessage("Бүтээгдэхүүн олдсонгүй");
            setNotificationType("error");
          }
          clearTimeout(timeout);
        } else if (event.key.length === 1) {
          buffer += event.key;
          clearTimeout(timeout);
          timeout = setTimeout(() => (buffer = ""), 100);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      barcodeInput.removeEventListener("keydown", handleBarcodeInput);
      window.removeEventListener("keydown", handleGlobalKeydown);
      clearTimeout(timeout);
    };
  }, [findProductByBarcode, openProductModal, resetTimer, setNotificationMessage, setNotificationType]);

  // Idle redirect
  useEffect(() => {
    if (dialogOpen || isModalOpen) return;
    const events = ["click", "mousemove", "keydown", "touchstart"];
    const handleActivity = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handleActivity));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [timeout, dialogOpen, isModalOpen, pathname, excludePaths, router, setCartItems, resetTimer]);

  return (
    <input
  ref={barcodeInputRef}
  id="barcodeInput"
  type="text"
  autoComplete="off"
  placeholder="Кодоо оруулна уу"
  style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
/>
  );
};

export default IdleRedirect;
