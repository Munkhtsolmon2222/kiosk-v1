"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import DOMPurify from "dompurify";
import { useProducts } from "../../../providers/productContext";
import { useCart } from "../../../providers/cartContext";
export function Page2({ product, setPage }: any) {
  const [orderProducts, setOrderProducts] = useState(1);
  const [upsellOrderCounts, setUpsellOrderCounts] = useState<{
    [key: number]: number;
  }>({});
  const images = product?.images || [];
  const [variationsProduct, setVariationsProduct] = useState<any>([]);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const { data } = useProducts();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { setCartItems } = useCart();
  const minusCount = () => {
    setOrderProducts((prev) => (prev > 1 ? prev - 1 : 1));
  };
  const [lubricatorOrderCounts, setLubricatorOrderCounts] = useState<{
    [key: number]: number;
  }>({});
  const plusCount = () => {
    setOrderProducts((prev) => prev + 1);
  };
  const handleUpsellCount = (upsellId: number, isIncrement: boolean) => {
    setUpsellOrderCounts((prev) => ({
      ...prev,
      [upsellId]: isIncrement
        ? (prev[upsellId] || 0) + 1
        : Math.max((prev[upsellId] || 0) - 1, 0),
    }));
  };

  const handleLubricatorCount = (
    lubricatorId: number,
    isIncrement: boolean
  ) => {
    setLubricatorOrderCounts((prev) => ({
      ...prev,
      [lubricatorId]: isIncrement
        ? (prev[lubricatorId] || 0) + 1
        : Math.max((prev[lubricatorId] || 0) - 1, 0),
    }));
  };

  useEffect(() => {
    if (!product?.id || !product.variations?.length) return;

    const fetchVariations = async () => {
      try {
        setLoading(true); // Start loading
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
        const reversedVariations = [...(resJson || [])].reverse();
        setSelectedVariation(reversedVariations[0]);
      } catch (error) {
        console.error("Error fetching variations:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchVariations();
  }, [product]);

  const handleVariationClick = (variation: any) => {
    setSelectedVariation(variation);
  };
  const reversedVariations = [...(variationsProduct || [])].reverse();
  // Ensure bigData is always an array
  const bigData = data?.pages.flatMap((page) => page.data) || []; // ✅ Fix applied
  const dataSpread = [...bigData];

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    // Check if the selected variation or product is out of stock
    if (
      selectedVariation?.stock_status === "outofstock" ||
      product?.stock_status === "outofstock"
    ) {
      alert("Энэхүү бүтээгдэхүүн дууссан тул худалдан авах боломжгүй.");
      return;
    }

    const cartItem = {
      id: selectedVariation ? selectedVariation.id : product.id,
      name: selectedVariation ? selectedVariation.name : product.name,
      price: selectedVariation ? selectedVariation.price : product.price,
      quantity: orderProducts,
      image: selectedVariation
        ? selectedVariation.image?.src
        : product.images[0]?.src,
      stock_status: selectedVariation
        ? selectedVariation.stock_status
        : product.stock_status,
    };

    // Add upsell products but exclude those that are out of stock
    const upsellItems = Object.entries(lubricatorOrderCounts)
      .filter(([id, count]) => count > 0) // Only add lubricators with count > 0
      .map(([id, count]) => {
        console.log(id);
        const lubricator = dataSpread.find((p) => p.id == id);
        console.log(lubricator);
        if (lubricator && lubricator.stock_status !== "outofstock") {
          return {
            id: lubricator.id,
            name: lubricator.name,
            price: lubricator.regular_price,
            quantity: count,
            image: lubricator.images?.[0]?.src || "zurag.png",
            stock_status: lubricator.stock_status,
          };
        }
        return null; // Skip out-of-stock lubricators
      })
      .filter(Boolean); // Remove null values

    cart.push(cartItem, ...upsellItems);
    localStorage.setItem("cart", JSON.stringify(cart));
    setCartItems(cart);
    console.log("Cart Updated:", cart);
    setPage(3);
  };
  const lubricators = dataSpread.filter((product: any) =>
    product?.categories?.some(
      (category: any) => category.id.toString() === "63"
    )
  );
  console.log(product);
  console.log(lubricators);
  return (
    <div>
      {loading ? (
        <p className="text-center text-gray-600">Түр хүлээнэ үү...</p>
      ) : (
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

          {product?.variations.length > 0 && variationsProduct.length > 0 ? (
            <div className="text-xl mt-4 px-4 w-full text-center">
              <p className="text-gray-600 mt-4">Төрөл</p>
              <div className="flex justify-center gap-6 p-5">
                {reversedVariations.map((variation: any, index: any) => (
                  <div
                    key={index}
                    onClick={() => handleVariationClick(variation)}
                    className={`flex flex-col items-center cursor-pointer ${
                      selectedVariation?.id === variation.id
                        ? "border-2 border-blue-500 p-2 rounded-lg"
                        : ""
                    }`}
                  >
                    <p className="text-sm">{variation.name || "Төрөл"}</p>
                    <img
                      className=" rounded-full bg-cover"
                      src={variation.image?.src || "./zurag.png"}
                      alt={variation.name || "Variation"}
                    />
                  </div>
                ))}
              </div>
              {selectedVariation ? (
                <h5
                  className={`${
                    selectedVariation?.stock_status == "instock"
                      ? "text-[#5dc477]"
                      : selectedVariation?.stock_status == "onbackorder"
                      ? "text-[#00b3fa]"
                      : "text-[#ab3030]"
                  } text-center mt-1`}
                >
                  {selectedVariation?.stock_status == "instock"
                    ? "Бэлэн"
                    : selectedVariation?.stock_status == "onbackorder"
                    ? "Захиалгаар"
                    : "Дууссан"}
                </h5>
              ) : (
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
              )}

              <div
                className="product-description w-full p-4 font-medium text-[14px] overflow-y-auto max-h-[500px]"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedVariation?.description),
                }}
              />
            </div>
          ) : (
            <div className="w-fit mx-2">
              {" "}
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
          )}

          {/* Keep all other parts of your code unchanged */}
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
          <div className="border-4 m-10 border-[#ab3030] mx-auto flex justify-center gap-10 py-2 rounded-[15px]">
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
            <p className="text-2xl text-[#a3554b]">
              Хослуулж хэргэлвэл гал гарна
            </p>

            <div className=" overflow-y-auto w-full  mt-2 h-[400px] ">
              {lubricators.map((lubricator: any) => (
                <div key={lubricator.id} className="flex gap-4 items-center">
                  {/* <img
                    className="h-16 w-16 rounded-2xl"
                    src={lubricator.images?.[0]?.src || "zurag.png"}
                    alt={lubricator.name}
                  /> */}
                  {lubricator.images
                    ?.slice(0, 1)
                    .map((image: any, index: any) => (
                      <img
                        key={index}
                        src={image.src}
                        alt="Aaviin Baraa"
                        className="w-20 h-20 object-cover mx-auto rounded-full"
                      />
                    ))}
                  <div>
                    <p>{lubricator.name}</p>
                    <span className="text-2xl w-[100px] block">
                      (
                      {new Intl.NumberFormat("mn-MN").format(
                        lubricator.regular_price
                      )}
                      ₮)
                    </span>
                  </div>
                  <h5
                    className={`${
                      lubricator?.stock_status == "instock"
                        ? "text-[#5dc477]"
                        : lubricator?.stock_status == "onbackorder"
                        ? "text-[#00b3fa]"
                        : "text-[#ab3030]"
                    } text-center w-3 mt-1`}
                  >
                    {lubricator?.stock_status == "instock"
                      ? "Бэлэн"
                      : lubricator?.stock_status == "onbackorder"
                      ? "Захиалгаар"
                      : "Дууссан"}
                  </h5>
                  <div className="border-4 border-[#ab3030] mx-auto mr-4 px-8 flex items-center gap-10 py-2 rounded-[15px]">
                    <button
                      onClick={() =>
                        handleLubricatorCount(lubricator.id, false)
                      }
                      className="text-2xl text-[#ab3030]"
                    >
                      -
                    </button>
                    <span className="text-2xl text-[#ab3030]">
                      {lubricatorOrderCounts[lubricator.id] || 0}
                    </span>
                    <button
                      onClick={() => handleLubricatorCount(lubricator.id, true)}
                      className="text-2xl text-[#ab3030]"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* display the upsell products */}
              {/* {product?.upsell_ids.length > 0 ? (
                <div className="flex flex-col gap-4 mt-4">
                  {product?.upsell_ids.map((upsell_id: any) =>
                    dataSpread
                      ?.filter((product) => product.id == upsell_id)
                      .map((upsell: any) => (
                        <div
                          key={upsell.id}
                          className="flex gap-4 items-center"
                        >
                          <img
                            className="h-16 w-16 rounded-2xl"
                            src={upsell.images?.[0]?.src || "zurag.png"}
                            alt={upsell.name}
                          />
                          <div>
                            <p>{upsell.name}</p>
                            <span className="text-2xl w-[100px] block">
                              (
                              {new Intl.NumberFormat("mn-MN").format(
                                upsell.regular_price
                              )}
                              ₮)
                            </span>
                          </div>
                          <h5
                            className={`${
                              upsell?.stock_status == "instock"
                                ? "text-[#5dc477]"
                                : upsell?.stock_status == "onbackorder"
                                ? "text-[#00b3fa]"
                                : "text-[#ab3030]"
                            } text-center w-3 mt-1`}
                          >
                            {upsell?.stock_status == "instock"
                              ? "Бэлэн"
                              : upsell?.stock_status == "onbackorder"
                              ? "Захиалгаар"
                              : "Дууссан"}
                          </h5>
                          <div className="border-4 border-[#ab3030] mx-auto mr-4 px-8 flex items-center gap-10 py-2 rounded-[15px]">
                            <button
                              onClick={() =>
                                handleUpsellCount(upsell.id, false)
                              }
                              className="text-2xl text-[#ab3030]"
                            >
                              -
                            </button>
                            <span className="text-2xl text-[#ab3030]">
                              {upsellOrderCounts[upsell.id] || 0}
                            </span>
                            <button
                              onClick={() => handleUpsellCount(upsell.id, true)}
                              className="text-2xl text-[#ab3030]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <div></div>
              )} */}
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
            <DialogClose asChild>
              <Button
                onClick={() => {
                  handleAddToCart();
                }}
                className="text-2xl px-8 py-4 bg-blue-500 text-white"
              >
                Сагсанд хийх
              </Button>
            </DialogClose>
          </div>
        </div>
      )}
    </div>
  );
}
