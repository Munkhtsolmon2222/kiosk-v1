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
import { useProducts } from "../../../providers/productContext";

export default function ProductCard({ product }: any) {
  const [page, setPage] = useState(1); // Track the current page
  const [sanitizedDescription, setSanitizedDescription] = useState<any>("");
  const images = product?.images;
  const [orderProducts, setOrderProducts] = useState(0);
  const [variationsProduct, setVariationsProduct] = useState<any>();
  const plusCount = () => {
    setOrderProducts(orderProducts + 1);
  };
  const minusCount = () => {
    setOrderProducts(orderProducts > 1 ? orderProducts - 1 : 1);
  };
  const totalPrice = product.regular_price * orderProducts;
  useEffect(() => {
    if (product) {
      setSanitizedDescription(DOMPurify.sanitize(product?.description));
    }
    const fetchVariations = async () => {
      const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
      const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
      const authHeader =
        typeof window === "undefined"
          ? Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
          : btoa(`${consumerKey}:${consumerSecret}`);
      const res = await fetch(
        `https://erchuudiindelguur.mn/wp-json/wc/v3/products/${product.id}/variations`,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
        }
      );
      const resJson = await res.json();
      setVariationsProduct(resJson);
    };
    fetchVariations();
  }, [product]);
  console.log(variationsProduct);
  // const { data, isLoading, error } = useProducts();
  // const bigData = data?.pages.flatMap((page) => page.data) || []; // ✅ Fix applied
  // const dataSpread = [...bigData];
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
            <h3 className="text-black text-center mt-2">
              {product.sale_price ? (
                <>
                  <span className="text-gray-500 font-bold line-through text-md block">
                    {new Intl.NumberFormat("mn-MN").format(
                      product.regular_price
                    )}
                    ₮
                  </span>
                  <span className="text-red-500 text-2xl block">
                    {new Intl.NumberFormat("mn-MN").format(product.sale_price)}₮
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold block">
                  {new Intl.NumberFormat("mn-MN").format(product.regular_price)}
                  ₮
                </span>
              )}
            </h3>
            <h5
              className={`${
                product?.stock_status == "instock"
                  ? "text-[#5dc477]"
                  : product?.stock_status == "onbackorder"
                  ? "text-[#00b3fa]"
                  : "text-[#ab3030]"
              } text-center mt-1`}
            >
              {product?.stock_status == "instock"
                ? "Бэлэн"
                : product?.stock_status == "onbackorder"
                ? "Захиалгаар"
                : "Дууссан"}
            </h5>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="p-6 min-w-[70vw] min-h-[80vh] flex flex-col ">
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
                  <p className="text-3xl mt-4 font-bold">
                    {product.sale_price ? (
                      <>
                        <span className="text-gray-500 line-through text-md block">
                          {new Intl.NumberFormat("mn-MN").format(
                            product.regular_price
                          )}
                          ₮
                        </span>
                        <span className="text-red-500 text-2xl block">
                          {new Intl.NumberFormat("mn-MN").format(
                            product.sale_price
                          )}
                          ₮
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl block">
                        {new Intl.NumberFormat("mn-MN").format(
                          product.regular_price
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
        ) : (
          // Page 2: Additional Content
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
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">
                Нэмэлт мэдээлэл
              </DialogTitle>
            </DialogHeader>
            {product.variations.length > 0 && (
              <div className="text-xl mt-4 px-4 w-full text-center">
                <p className="text-gray-600 mt-4">Төрөл</p>
                <div className="flex justify-center gap-6 p-5">
                  {variationsProduct?.map((variationId: any, index: any) => {
                    const variations = product.variations || [];
                    // Бүх бүтээгдэхүүний дундаас ID таарах variation олох
                    const variationsProduct = variationId.filter(
                      (p: any) => p.id === variationId
                    );

                    variationsProduct ? (
                      <div key={index} className="flex flex-col items-center">
                        <img
                          className="h-16 w-16 rounded-full"
                          src={variationsProduct.image.src || "./zurag.png"}
                          alt={variationsProduct.name || "Variation"}
                        />
                        <p className="text-sm">
                          {variationsProduct.name || "Төрөл"}
                        </p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {/* Product Image Slider */}
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
              className="w-full flex justify-center"
            >
              {images.map((image: any, index: any) => (
                <SwiperSlide key={index}>
                  <img
                    src={image.src}
                    alt={`Product Image ${index + 1}`}
                    className="rounded-lg w-[200px] h-[200px] object-contain bg-cover mx-auto"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Counter for quantity */}
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-5xl text-[#ab3030]">
                -
              </button>
              <span className="text-5xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-5xl text-[#ab3030]">
                +
              </button>
            </div>
            <div>
              <p className=" text-xl text-center ">
                Хэрвээ та галзуу бэлгийн харилцааг хүсэж байвал дараах
                бараануудыг сонирхоод үзээрэй !!!
              </p>
              <p className="text-2xl text-[#a3554b]">
                Хослуулж хэргэлвэл гал гарна
              </p>
              <div className=" overflow-y-auto mt-2 h-[400px] ">
                <div className=" flex gap-4 mt-4 ">
                  <img
                    className=" h-16 w-16 rounded-2xl "
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div>
                    <p>Tokyogiin zuragtai shodoi haha </p>
                    <span className="text-2xl block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        product.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={minusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {orderProducts}
                    </span>
                    <button
                      onClick={plusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className=" flex gap-4 mt-4 ">
                  <img
                    className=" h-16 w-16 rounded-2xl "
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div>
                    <p>Tokyogiin zuragtai shodoi haha </p>
                    <span className="text-2xl block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        product.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={minusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {orderProducts}
                    </span>
                    <button
                      onClick={plusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className=" flex gap-4 mt-4 ">
                  <img
                    className=" h-16 w-16 rounded-2xl "
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div>
                    <p>Tokyogiin zuragtai shodoi haha </p>
                    <span className="text-2xl block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        product.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={minusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {orderProducts}
                    </span>
                    <button
                      onClick={plusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className=" flex gap-4 mt-4 ">
                  <img
                    className=" h-16 w-16 rounded-2xl "
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div>
                    <p>Tokyogiin zuragtai shodoi haha </p>
                    <span className="text-2xl block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        product.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={minusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {orderProducts}
                    </span>
                    <button
                      onClick={plusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className=" flex gap-4 mt-4 ">
                  <img
                    className=" h-16 w-16 rounded-2xl "
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div>
                    <p>Tokyogiin zuragtai shodoi haha </p>
                    <span className="text-2xl block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        product.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={minusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {orderProducts}
                    </span>
                    <button
                      onClick={plusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className=" flex gap-4 mt-4 ">
                  <img
                    className=" h-16 w-16 rounded-2xl "
                    src="zurag.png"
                    alt="Zurag"
                  />
                  <div>
                    <p>Tokyogiin zuragtai shodoi haha </p>
                    <span className="text-2xl block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        product.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={minusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {orderProducts}
                    </span>
                    <button
                      onClick={plusCount}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons for navigation */}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
