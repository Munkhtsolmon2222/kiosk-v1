"use client";

import { useEffect, useState } from "react";
import { useProducts } from "../../providers/productContext";
import { getCookie } from "cookies-next/client";
import { AiFillSetting } from "react-icons/ai";
import ProductCard from "./_components/product";
import Link from "next/link";
import { Settings } from "./_components/settings";

export default function Home() {
  const [setting, setSetting] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [isClient, setIsClient] = useState(false); // To check if we're on the client-side
  const { data, isLoading, error } = useProducts();
  const defaultCategory = getCookie("defaultCategory");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  console.log(data);
  return (
    <div className="mt-44 ml-64">
      {defaultCategory ? (
        <div className="relative">
          <Link href={`/category/${defaultCategory}`}>
            <img src="./zurag.png" className="w-full h-[60vh]" />
            <img
              src="https://res.cloudinary.com/ds9r4eovz/image/upload/v1743849351/cld-sample-2.jpg"
              className="w-[90vw] h-[60vh]"
            />
          </Link>
        </div>
      ) : (
        <div className="relative">
          <Link href={`/category/53`}>
            <img src="./zurag.png" className="w-full h-[60vh]" />
            <img
              src="https://res.cloudinary.com/ds9r4eovz/image/upload/v1743849351/cld-sample-2.jpg"
              className="w-[90vw] h-[60vh]"
            />
          </Link>
        </div>
      )}

      {/* Products */}
      {data?.pages.flatMap((page) => page.data).length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {/* {data?.pages
            .flatMap((page) => page.data)
            .map((product, i) => (
              <ProductCard key={i} product={product} />
            ))} */}
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setSetting((prev) => !prev)}
        className="absolute top-4 right-4 p-2 bg-gray-800 text-white rounded"
      >
        <AiFillSetting />
      </button>
      {setting && <div>Settings Panel</div>}
    </div>
  );
}
