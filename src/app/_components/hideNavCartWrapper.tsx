// components/HideNavCartWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { Cart } from "./cart";
import { Navigation } from "./navigation";
import ProductModal from "./productModal";
import BarcodeNotification from "./barcodeNotification";
import { useScannedProduct } from "../../../providers/scannedProductContext";

export default function HideNavCartWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { notificationMessage, notificationType, setNotificationMessage, setNotificationType } = useScannedProduct();

  // Hide Navigation and Cart for specific paths
  const hideNavigationAndCart = ["/"].includes(pathname);

  const handleCloseNotification = () => {
    setNotificationMessage(null);
    setNotificationType(null);
  };

  if (hideNavigationAndCart) {
    return (
      <>
        {children}
        <ProductModal />
        <BarcodeNotification
          message={notificationMessage}
          type={notificationType}
          onClose={handleCloseNotification}
        />
      </>
    );
  }

  return (
    <>
      <Navigation />
      {children}
      <Cart />
      <ProductModal />
      <BarcodeNotification
        message={notificationMessage}
        type={notificationType}
        onClose={handleCloseNotification}
      />
    </>
  );
}
