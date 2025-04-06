"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { CartDialog } from "./cartDialog";
import { useCart } from "../../../providers/cartContext";
import { useIsOpen } from "../../../providers/isOpenContext";

export function Cart() {
  const { open, setOpen } = useIsOpen(); // Use context values
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<number>(0);
  const prevOpenRef = useRef(open); // Store the previous value of `open`
  const [totalPrice, setTotalPrice] = useState(0);
  const { cartItems, setCartItems } = useCart();

  // useEffect(() => {
  //   if (open !== prevOpenRef.current) {
  //     // Check if `open` has changed
  //     prevOpenRef.current = open; // Update the ref to the latest value of `open`

  //     if (open) {
  //       // Only fetch cart items when dialog is opened
  //       const items = JSON.parse(localStorage.getItem("cart") || "[]");
  //       setCartItems(items);

  //       // Calculate total price
  //       const total = items.reduce(
  //         (sum: number, item: any) => sum + item.price * item.quantity,
  //         0
  //       );
  //       setTotalPrice(total);
  //     }
  //   }
  // }, [open]); // Depend only on `open`
  useEffect(() => {
    const total = cartItems.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems, open]); // Dependency on cartItems to track changes
  useEffect(() => {
    const storedItems = localStorage.getItem("cart");

    // Шалгах: storedItems байвал
    if (storedItems) {
      console.log("Stored items:", storedItems);
      const parsedItems = JSON.parse(storedItems);

      // Бараануудын тоог тооцоолох
      const totalItems = parsedItems.reduce(
        (acc: number, item: { quantity: number }) => acc + item.quantity,
        0
      );
      setItems(totalItems);
    } else {
      console.log("No items found in localStorage.");
    }
  }, [cartItems]);

  console.log(items);

  return (
    <div className="fixed bottom-80 right-4">
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="px-5 py-10 rounded-xl shadow-lg bg-white border border-gray-600"
      >
        {items > 0 ? (
          <div className="fixed right-4 bottom-96 rounded-full h-5 w-5 bg-[#ab3030] text-white pt-1 text-[10px] ">
            {items}
          </div>
        ) : (
          ""
        )}
        <AiOutlineShoppingCart className="text-[#ab3030] size-10" />
      </Button>
      <CartDialog
        open={open}
        setOpen={setOpen}
        step={step}
        setStep={setStep}
        setCartItems={setCartItems}
        cartItems={cartItems}
        setTotalPrice={setTotalPrice}
        totalPrice={totalPrice}
      />
    </div>
  );
}
