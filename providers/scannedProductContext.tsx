"use client";
import React, { createContext, useContext, useState } from "react";

interface ScannedProductContextType {
  scannedProduct: any | null;
  setScannedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notificationMessage: string | null;
  setNotificationMessage: React.Dispatch<React.SetStateAction<string | null>>;
  notificationType: "error" | "success" | null;
  setNotificationType: React.Dispatch<React.SetStateAction<"error" | "success" | null>>;
}

const ScannedProductContext = createContext<ScannedProductContextType | undefined>(undefined);

export const useScannedProduct = () => {
  const context = useContext(ScannedProductContext);
  if (!context) {
    throw new Error("useScannedProduct must be used within a ScannedProductProvider");
  }
  return context;
};

export const ScannedProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<"error" | "success" | null>(null);

  return (
    <ScannedProductContext.Provider
      value={{
        scannedProduct,
        setScannedProduct,
        isModalOpen,
        setIsModalOpen,
        notificationMessage,
        setNotificationMessage,
        notificationType,
        setNotificationType,
      }}
    >
      {children}
    </ScannedProductContext.Provider>
  );
};


