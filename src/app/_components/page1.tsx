"use client";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "./navigation";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

export function Page1({ product, setPage }: any) {
  const [sanitizedDescription, setSanitizedDescription] = useState<any>("");
  const images = product?.images || [];
  useEffect(() => {
    if (product) {
      setSanitizedDescription(DOMPurify.sanitize(product?.description));
    }
  }, [product]);
  return (
    <>
      <div className="flex justify-end">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="text-center text-white p-2 bg-[#ab3030] w-10 rounded-sm"
          >
            X
          </Button>
        </DialogClose>
      </div>

      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Pagination, Navigation, Autoplay]}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false, // Keeps autoplay active even after user interaction
        }}
        className="w-full"
      >
        {images?.map((image: any, index: any) => (
          <SwiperSlide key={index}>
            <img
              src={image.src}
              alt={`Product Image ${index + 1}`}
              className="rounded-lg w-[822px] h-[514px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <DialogHeader className="mt-6">
        <DialogTitle className="text-4xl font-bold flex justify-between p-4">
          <div>
            <p className="text-2xl text-gray-500">Код: {product?.id}</p>
            <p className="text-4xl font-bold">{product?.name}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl mt-4 font-bold">
              {product?.sale_price ? (
                <>
                  <span className="text-gray-500 line-through text-md block">
                    {new Intl.NumberFormat("mn-MN").format(
                      product?.regular_price
                    )}
                    ₮
                  </span>
                  <span className="text-red-500 text-2xl block">
                    {new Intl.NumberFormat("mn-MN").format(product?.sale_price)}
                    ₮
                  </span>
                </>
              ) : (
                <span className="text-2xl block">
                  {new Intl.NumberFormat("mn-MN").format(
                    product?.regular_price
                  )}
                  ₮
                </span>
              )}
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="h-auto mb-[20px]">
        <div className="text-xl mt-4 px-4 w-full text-center">
          <div
            className="product-description w-full p-4 font-medium text-[14px] overflow-y-auto max-h-[500px] " // Ensures enough space for content
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        </div>

        <div className="flex justify-between mt-10 w-2/3 mx-auto pb-5 ">
          <DialogClose asChild>
            <Button variant="outline" className="text-2xl px-8 py-4">
              Хаах
            </Button>
          </DialogClose>
          <Button
            className="text-2xl px-8 py-4 bg-green-500 text-white"
            onClick={() => setPage(2)}
          >
            Үргэлжлүүлэх
          </Button>
        </div>
      </div>
    </>
  );
}
