"use client";
import React, { createContext, useContext, useState } from "react";

interface CartContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const IsOpenContext = createContext<CartContextType | undefined>(undefined);

export const useIsOpen = () => {
  const context = useContext(IsOpenContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

export const IsOpenProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  console.log("context", open);
  return (
    <IsOpenContext.Provider value={{ open, setOpen }}>
      {children}
    </IsOpenContext.Provider>
  );
};
