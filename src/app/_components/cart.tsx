"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { CartDialog } from "./cartDialog";

export function Cart() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<number>(0);

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
  }, []); // Зөвхөн нэг удаа component mount болсны дараа // Зөвхөн нэг удаа mount үед ажиллана

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
      <CartDialog open={open} setOpen={setOpen} step={step} setStep={setStep} />
    </div>
  );
}
