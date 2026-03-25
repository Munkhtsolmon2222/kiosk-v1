"use client";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import {
  cartReducer,
  CartAction,
  CartItem,
  calcTotalQuantity,
  getCartStorageKey,
  normalizeCartItems,
} from "@/lib/cartReducer";

// Define context value type
type CartContextType = {
  cartItems: CartItem[];
  totalQuantity: number;
  addToCart: (item: CartItem) => void;
  removeFromCartByKey: (key: string) => void;
  clearCart: () => void;
  updateQuantity: (key: string, quantity: number) => void;
};

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Cart Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    const key = getCartStorageKey();
    try {
      const savedCart = localStorage.getItem(key);
      if (!savedCart) return;
      const parsed = JSON.parse(savedCart);
      if (!Array.isArray(parsed)) return;
      dispatch({ type: "replaceAll", items: normalizeCartItems(parsed as CartItem[]) } as CartAction);
    } catch (e) {
      // If storage is corrupted, fall back to empty cart.
      console.warn("Failed to load cart from localStorage", e);
      dispatch({ type: "clear" } as CartAction);
    }
  }, []);

  useEffect(() => {
    const key = getCartStorageKey();
    try {
      if (!cartItems || cartItems.length === 0) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Failed to persist cart to localStorage", e);
    }
  }, [cartItems]);

  const totalQuantity = calcTotalQuantity(cartItems);

  const addToCart = (item: CartItem) =>
    dispatch({
      type: "add",
      item: {
        ...item,
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: Number(item.price) || 0,
        stock_status: String(item.stock_status ?? ""),
      },
    } as CartAction);

  const removeFromCartByKey = (key: string) =>
    dispatch({ type: "removeByKey", key } as CartAction);

  const updateQuantity = (key: string, quantity: number) =>
    dispatch({ type: "updateQuantity", key, quantity } as CartAction);

  const clearCart = () => dispatch({ type: "clear" } as CartAction);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCartByKey,
        clearCart,
        updateQuantity,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
