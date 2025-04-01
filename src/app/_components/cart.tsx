"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Navigation } from "swiper/modules";

export function Cart(product: any) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [orderProducts, setOrderProducts] = useState(1);
  const [includeVAT, setIncludeVAT] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const items = [
    {
      name: "Бараа 1",
      images: [
        { src: "https://via.placeholder.com/822x514" },
        { src: "https://via.placeholder.com/822x514" },
      ],
    },
  ];

  const minusCount = () => {
    setOrderProducts((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const plusCount = () => {
    setOrderProducts((prev) => prev + 1);
  };

  return (
    <div className="fixed bottom-80 right-4">
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="px-5 py-10 rounded-xl shadow-lg bg-white border border-gray-600"
      >
        <AiOutlineShoppingCart className=" text-[#ab3030] size-10 " />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">
              {step === 1 ? "Таны сагс" : "Төлбөр төлөх"}
            </DialogTitle>
          </DialogHeader>
          {step === 1 ? (
            <>
              <div className="overflow-y-auto mt-2 h-[400px]">
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <img
                    className="h-16 w-16 rounded-2xl"
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div className="flex flex-col">
                    <p>Tokyogiin zuragtai shodoi haha</p>
                    <span className="text-2xl block">7 * 20'000₮</span>
                  </div>

                  {/* X Button */}
                  <div className="flex justify-end ml-auto">
                    <Button
                      variant="outline"
                      className="text-white p-2 bg-[#ab3030] w-10 h-10 rounded-xl flex items-center justify-center"
                      onClick={() => console.log("Remove item")} // Add remove functionality
                    >
                      <span className="text-xl">X</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Total Price Section */}
              <p className="text-end mt-4">Нийт үнэ: 140'000₮</p>

              {/* Action Buttons */}
              <div className="flex justify-between gap-6 mt-10 w-2/3 mx-auto">
                <Button
                  variant="outline"
                  className="text-2xl px-8 py-4"
                  onClick={() => setOpen(false)}
                >
                  Хаах
                </Button>
                <Button
                  className="text-2xl px-8 py-4 bg-blue-500 text-white"
                  onClick={() => setStep(2)}
                >
                  Төлбөр төлөх
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-4 mt-4">
                <label className="flex items-center space-x-2 text-xl">
                  <input
                    type="checkbox"
                    checked={isOrderConfirmed}
                    onChange={() => setIsOrderConfirmed(!isOrderConfirmed)}
                  />
                  <span>Захиалгаа баталгаажуулах</span>
                </label>
                <label className="flex items-center space-x-2 text-xl">
                  <input
                    type="checkbox"
                    checked={includeVAT}
                    onChange={() => setIncludeVAT(!includeVAT)}
                  />
                  <span>НӨАТ шивүүлэх</span>
                </label>
              </div>
              <div className="flex justify-between mt-10 w-2/3 mx-auto">
                <Button
                  variant="outline"
                  className="text-2xl px-8 py-4"
                  onClick={() => setStep(1)}
                >
                  Буцах
                </Button>
                <div className="flex space-x-4">
                  <Button className="text-2xl px-8 py-4 bg-green-500 text-white">
                    QPay
                  </Button>
                  <Button className="text-2xl px-8 py-4 bg-purple-500 text-white">
                    Social Pay
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
