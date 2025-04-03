"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProductCard from "./_components/product";
import { AiFillSetting } from "react-icons/ai";
import { useState, useEffect } from "react";
import { useProducts } from "../../providers/productContext";
import Link from "next/link";
import { getCookie } from "cookies-next/client";
export default function Home() {
  const [isConnected, setIsConnected] = useState(true);
  const [setting, setSetting] = useState(false);

  const { data, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  const defaultCategory = getCookie("defaultCategory");
  console.log(defaultCategory);
  console.log(data?.pages?.flat());
  return (
    <div className="mt-44 ml-64">
      {defaultCategory ? (
        <Link href={`/category/${defaultCategory}`}>
          <button>Continue </button>
        </Link>
      ) : (
        <div></div>
      )}

      {data?.pages.flatMap((page) => page.data).length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {data?.pages
            .flatMap((page) => page.data)
            .map((product, i) => (
              <ProductCard key={i} product={product} />
            ))}
        </div>
      )}

      <button onClick={() => setSetting((prev) => !prev)}>
        <AiFillSetting />
      </button>
      {setting && <div>Settings Panel sfdjas</div>}
    </div>
  );
}
