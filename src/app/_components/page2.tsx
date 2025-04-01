"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
export function Page2({ product, setPage }: any) {
  const [orderProducts, setOrderProducts] = useState(1);
  const images = product?.images || [];
  const [variationsProduct, setVariationsProduct] = useState<any>();

  const minusCount = () => {
    setOrderProducts((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const plusCount = () => {
    setOrderProducts((prev) => prev + 1);
  };
  useEffect(() => {
    if (!product?.id || !product.variations?.length) return;

    const fetchVariations = async () => {
      try {
        const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
        const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
        const authHeader = btoa(`${consumerKey}:${consumerSecret}`);

        const res = await fetch(
          `https://erchuudiindelguur.mn/wp-json/wc/v3/products/${product.id}/variations`,
          {
            headers: { Authorization: `Basic ${authHeader}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch variations");

        const resJson = await res.json();
        setVariationsProduct(resJson);
      } catch (error) {
        console.error("Error fetching variations:", error);
      }
    };

    fetchVariations();
  }, []);
  return (
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
      <DialogHeader>
        <DialogTitle className="text-3xl font-bold">
          Нэмэлт мэдээлэл
        </DialogTitle>
      </DialogHeader>
      {product?.variations.length > 0 && (
        <div className="text-xl mt-4 px-4 w-full text-center">
          <p className="text-gray-600 mt-4">Төрөл</p>
          <div className="flex justify-center gap-6 p-5">
            {variationsProduct?.map((variationId: any, index: any) => {
              const variations = product?.variations || [];
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
                  <p className="text-sm">{variationsProduct.name || "Төрөл"}</p>
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
          Хэрвээ та галзуу бэлгийн харилцааг хүсэж байвал дараах бараануудыг
          сонирхоод үзээрэй !!!
        </p>
        <p className="text-2xl text-[#a3554b]">Хослуулж хэргэлвэл гал гарна</p>
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
                ({new Intl.NumberFormat("mn-MN").format(product?.regular_price)}
                ₮)
              </span>
            </div>
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-2xl text-[#ab3030]">
                -
              </button>
              <span className="text-2xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-2xl text-[#ab3030]">
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
                ({new Intl.NumberFormat("mn-MN").format(product?.regular_price)}
                ₮)
              </span>
            </div>
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-2xl text-[#ab3030]">
                -
              </button>
              <span className="text-2xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-2xl text-[#ab3030]">
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
                ({new Intl.NumberFormat("mn-MN").format(product?.regular_price)}
                ₮)
              </span>
            </div>
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-2xl text-[#ab3030]">
                -
              </button>
              <span className="text-2xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-2xl text-[#ab3030]">
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
                ({new Intl.NumberFormat("mn-MN").format(product?.regular_price)}
                ₮)
              </span>
            </div>
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-2xl text-[#ab3030]">
                -
              </button>
              <span className="text-2xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-2xl text-[#ab3030]">
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
                ({new Intl.NumberFormat("mn-MN").format(product?.regular_price)}
                ₮)
              </span>
            </div>
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-2xl text-[#ab3030]">
                -
              </button>
              <span className="text-2xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-2xl text-[#ab3030]">
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
                ({new Intl.NumberFormat("mn-MN").format(product?.regular_price)}
                ₮)
              </span>
            </div>
            <div className="border-4 border-[#ab3030] mx-auto px-8 flex items-center gap-10 py-2 rounded-[15px]">
              <button onClick={minusCount} className="text-2xl text-[#ab3030]">
                -
              </button>
              <span className="text-2xl text-[#ab3030]">{orderProducts}</span>
              <button onClick={plusCount} className="text-2xl text-[#ab3030]">
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
    </div>
  );
}
