"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { CartDialog } from "./cartDialog";

export function Cart() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

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
  }, []);

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
  console.log(cartItems);
  return (
    <div className="fixed bottom-80 right-4">
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="px-5 py-10 rounded-xl shadow-lg bg-white border border-gray-600"
      >
        <AiOutlineShoppingCart className=" text-[#ab3030] size-10 " />
      </Button>
      <CartDialog open={open} setOpen={setOpen} step={step} setStep={setStep} />
    </div>
  );
}
