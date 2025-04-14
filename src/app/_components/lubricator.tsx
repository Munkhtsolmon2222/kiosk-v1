"use client";

import { useEffect, useState } from "react";

export default function Lubricator({
  lubricator,
  handleLubricatorCount,
  lubricatorOrderCounts,
}: any) {
  const [variationPrice, setVariationPrice] = useState<string>("");

  useEffect(() => {
    if (lubricator?.type === "variable") {
      try {
        // const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
        // const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
        // if (!consumerKey || !consumerSecret) {
        //   throw new Error("WooCommerce API keys are missing");
        // }
        // const authHeader =
        //   typeof window === "undefined"
        //     ? Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
        //         "base64"
        //       )
        //     : btoa(`${consumerKey}:${consumerSecret}`);
        // const response = await fetch(
        //   `https://erchuudiindelguur.mn/wp-json/wc/v3/lubricators/${lubricator.id}/variations?per_page=100`,
        //   {
        //     headers: {
        //       Authorization: `Basic ${authHeader}`,
        //     },
        //   }
        // );
        // if (!response.ok) {
        //   throw new Error(`Error ${response.status}: ${response.statusText}`);
        // }
        // const variations = await response.json();
        // if (variations.length > 0) {
        //   setPrice(
        //     new Intl.NumberFormat("mn-MN").format(variations[0].price)
        //   );
        // }
        setVariationPrice(
          new Intl.NumberFormat("mn-MN").format(lubricator.price)
        );
      } catch (error) {
        console.error("Failed to fetch variations", error);
      }
    } else {
      setVariationPrice(
        new Intl.NumberFormat("mn-MN").format(lubricator.regular_price)
      );
    }
  }, [lubricator]);

  return (
    <div
      key={lubricator.id}
      className="flex gap-4 items-center my-[10px] border-b border-gray"
    >
      <div className="flex gap-4 w-fit mb-[5px]">
        {lubricator.images?.slice(0, 1).map((image: any, index: any) => (
          <img
            key={index}
            src={image.src}
            alt="Aaviin Baraa"
            className="w-20 h-20 object-cover mx-auto rounded-full"
          />
        ))}
        <div className="">
          <p>{lubricator.name}</p>
          <span className="text-2xl w-[100px] block">({variationPrice} ₮)</span>
        </div>
        <h5
          className={`${
            lubricator?.stock_status == "instock"
              ? "text-[#5dc477]"
              : lubricator?.stock_status == "onbackorder"
              ? "text-[#4882f0]"
              : "text-[#ab3030]"
          } text-center w-3 mt-1`}
        >
          {lubricator?.stock_status == "instock"
            ? "Бэлэн"
            : lubricator?.stock_status == "onbackorder"
            ? "Захиалгаар"
            : "Дууссан"}
        </h5>
      </div>

      <div className="border-4 border-[#ab3030] mx-auto w-[130px] mr-5 px-8 flex items-center gap-5 py-2 rounded-[15px]">
        <button
          onClick={() => handleLubricatorCount(lubricator.id, false)}
          className="text-xl text-[#ab3030]"
        >
          -
        </button>
        <span className="text-xl text-[#ab3030]">
          {lubricatorOrderCounts[lubricator.id] || 0}
        </span>
        <button
          onClick={() => handleLubricatorCount(lubricator.id, true)}
          className="text2xl text-[#ab3030]"
        >
          +
        </button>
      </div>
    </div>
  );
}
