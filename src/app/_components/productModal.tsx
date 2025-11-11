"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import DOMPurify from "dompurify";
import { useScannedProduct } from "../../../providers/scannedProductContext";
import { Page2 } from "./page2";

export default function ProductModal() {
  const { scannedProduct, isModalOpen, setIsModalOpen, setScannedProduct } = useScannedProduct();
  const [page, setPage] = useState(1);
  const [sanitizedDescription, setSanitizedDescription] = useState<any>("");
  const images = scannedProduct?.images;
  const [price, setPrice] = useState<any>(0);

  // Debug logging
  useEffect(() => {
    console.log("🎯 ProductModal state:", { 
      isModalOpen, 
      hasProduct: !!scannedProduct, 
      productName: scannedProduct?.name 
    });
  }, [isModalOpen, scannedProduct]);

  useEffect(() => {
    if (scannedProduct) {
      setSanitizedDescription(DOMPurify.sanitize(scannedProduct?.description));
    }
  }, [scannedProduct]);

  useEffect(() => {
    if (scannedProduct?.type === "variable") {
      setPrice(new Intl.NumberFormat("mn-MN").format(scannedProduct.price));
    } else {
      setPrice(new Intl.NumberFormat("mn-MN").format(scannedProduct?.regular_price));
    }
  }, [scannedProduct]);

  // Reset page when modal closes
  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setPage(1);
      setScannedProduct(null);
    }
  };

  return (
    <Dialog open={isModalOpen && !!scannedProduct} onOpenChange={handleOpenChange}>
      <DialogContent className="p-6 min-w-[70vw] min-h-[80vh] opacity-95 flex flex-col">
        {scannedProduct && page === 1 ? (
          // Page 1: Product Details
          <div>
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
                disableOnInteraction: false,
              }}
              className="w-full"
            >
              {images?.map((image: any, index: any) => (
                <SwiperSlide key={index}>
                  <img
                    src={image.src}
                    alt={`Product Image ${index + 1}`}
                    className="rounded-lg w-[822px] h-[1014px] object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <DialogHeader className="mt-6">
              <DialogTitle className="text-4xl font-bold flex justify-between p-4">
                <div>
                  <p className="text-2xl text-gray-500">Код: {scannedProduct?.id}</p>
                  <p className="text-4xl font-bold text-[#ab3030]">
                    {scannedProduct?.name}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl mt-4 font-bold">
                    {scannedProduct.sale_price ? (
                      <>
                        <span className="text-gray-500 line-through text-md block">
                          {new Intl.NumberFormat("mn-MN").format(
                            scannedProduct.regular_price
                          )}
                          ₮
                        </span>
                        <span className="text-red-500 text-2xl block">
                          {new Intl.NumberFormat("mn-MN").format(
                            scannedProduct.sale_price
                          )}
                          ₮
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl block">{price}₮</span>
                    )}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="h-auto mb-[20px]">
              <div className="text-xl mt-4 px-4 w-full text-center">
                <div
                  className="product-description w-full p-4 font-medium text-[20px] overflow-y-auto max-h-[500px]"
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              </div>

              <div className="flex justify-between mt-10 w-2/3 mx-auto pb-5">
                <DialogClose asChild>
                  <Button variant="outline" className="text-2xl px-8 py-4">
                    Хаах
                  </Button>
                </DialogClose>
                <Button
                  className="text-2xl px-8 py-4 bg-[#ab3030] text-white"
                  onClick={() => setPage(2)}
                >
                  Үргэлжлүүлэх
                </Button>
              </div>
            </div>
          </div>
        ) : scannedProduct ? (
          // Page 2: Additional Content
          <Page2 setPage={setPage} product={scannedProduct} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}


