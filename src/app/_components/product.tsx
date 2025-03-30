"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import DOMPurify from "dompurify";

export default function ProductCard({ product }: any) {
  const [page, setPage] = useState(1); // Track the current page
  const [sanitizedDescription, setSanitizedDescription] = useState<any>("");
  const images = product?.images;
  const [orderProducts, setOrderProducts] = useState(0);
  const plusCount = () => {
    setOrderProducts(orderProducts + 1);
  };
  const minusCount = () => {
    setOrderProducts(orderProducts > 1 ? orderProducts - 1 : 1);
  };
  useEffect(() => {
    if (product) {
      console.log(product?.description);
      setSanitizedDescription(DOMPurify.sanitize(product?.description));
    }
  }, [product]);
  console.log(product);
  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) setPage(1); // Reset page to 1 when dialog closes
      }}
    >
      <DialogTrigger asChild>
        <div className="flex w-60 justify-center mt-10">
          <div className="w-60 h-auto bg-[#f1f1f1] rounded-2xl p-4">
            {images?.slice(0, 1).map((image: any, index: any) => (
              <img
                key={index}
                src={image.src}
                alt="Aaviin Baraa"
                className="w-20 h-20 object-cover mx-auto rounded-full"
              />
            ))}

            <h2 className="text-[#ab3030] text-center mt-4">{product?.name}</h2>
            <h3 className="text-black text-center mt-2">{product?.price}</h3>
            <h5 className="text-[#5dc477] text-center mt-1">Бэлэн</h5>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="p-6 min-w-[70vw] min-h-[80vh] flex flex-col overflow-y-auto">
        {page === 1 ? (
          // Page 1: Product Details
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
                  <p className="text-3xl font-bold text-red-500">
                    {product.regular_price && (
                      <span className="text-gray-500 line-through text-2xl block">
                        {`${product.regular_price}`}
                        <span className="font-bold">₮</span>
                      </span>
                    )}
                    {product.price && (
                      <span>
                        {`${product.price}`}
                        <span className="font-bold">₮</span>
                      </span>
                    )}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="text-xl mt-4 px-4 w-full text-center">
              <div
                className="product-description w-full h-auto p-4 font-medium text-[14px]" // Ensures enough space for content
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>

            <div className="flex justify-between mt-10 w-2/3 mx-auto">
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
          </>
        ) : page === 2 ? (
          // Page 2: Additional Content
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
              autoplay={{
                delay: 2000,
                disableOnInteraction: false, // Keeps autoplay active even after user interaction
              }}
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

            <div className=" border-4 border-[#ab3030] mx-auto px-8 flex gap-10 py-2 rounded-[15px] ">
              <button onClick={minusCount} className="text-5xl text-[#ab3030] ">
                -
              </button>
              <span className="text-5xl text-[#ab3030] ">{orderProducts}</span>
              <button onClick={plusCount} className="text-5xl text-[#ab3030] ">
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
        ) : (
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
              autoplay={{
                delay: 2000,
                disableOnInteraction: false, // Keeps autoplay active even after user interaction
              }}
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

            <div className=" border-4 border-[#ab3030] mx-auto px-8 flex gap-10 py-2 rounded-[15px] ">
              <button onClick={minusCount} className="text-5xl text-[#ab3030] ">
                -
              </button>
              <span className="text-5xl text-[#ab3030] ">{orderProducts}</span>
              <button onClick={plusCount} className="text-5xl text-[#ab3030] ">
                +
              </button>
            </div>

            <div className="flex justify-between mt-10 w-2/3 mx-auto">
              <Button
                variant="outline"
                className="text-2xl px-8 py-4"
                onClick={() => setPage(2)}
              >
                Буцах
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
