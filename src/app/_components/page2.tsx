"use client";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "./navigation";
import { useState } from "react";

export function Page2({ product, setPage }: any) {
  const [orderProducts, setOrderProducts] = useState(1);
  const images = product?.images || [];

  const minusCount = () => {
    setOrderProducts((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const plusCount = () => {
    setOrderProducts((prev) => prev + 1);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-3xl font-bold">
          Нэмэлт мэдээлэл
        </DialogTitle>
      </DialogHeader>

      <div className="text-xl mt-4 px-4 w-full text-center">
        <p className="text-gray-600 mt-4">
          Энэ бүтээгдэхүүний дэлгэрэнгүй мэдээлэл энд байрлана. Та өөрийн
          сонголтоо хийж, захиалгаа баталгаажуулна уу.
        </p>
      </div>
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Pagination, Navigation]}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        className="w-full"
      >
        {images.map((image: any, index: any) => (
          <SwiperSlide key={index}>
            <img
              src={image.src}
              alt={`Product Image ${index + 1}`}
              className="rounded-lg w-[822px] h-[514px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="border-4 border-[#ab3030] mx-auto px-8 flex gap-10 py-2 rounded-[15px]">
        <button onClick={minusCount} className="text-5xl text-[#ab3030]">
          -
        </button>
        <span className="text-5xl text-[#ab3030]">{orderProducts}</span>
        <button onClick={plusCount} className="text-5xl text-[#ab3030]">
          +
        </button>
      </div>

      <div className="flex justify-between mt-10 w-2/3 mx-auto">
        <Button
          variant="outline"
          className="text-2xl px-8 py-4"
          onClick={() => setPage(1)}
        >
          Буцах
        </Button>
        <Button
          onClick={() => setPage(3)}
          className="text-2xl px-8 py-4 bg-blue-500 text-white"
        >
          Сагсанд хийх
        </Button>
      </div>
    </>
  );
}
