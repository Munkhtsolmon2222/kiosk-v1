"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import ProductCard from "./_components/product";
<<<<<<< HEAD
import { AiFillSetting } from "react-icons/ai";
import { useState, useEffect } from "react";
import { useProducts } from "../../providers/productContext";

export default function Home() {
  const [isConnected, setIsConnected] = useState(true);
  const [setting, setSetting] = useState(false);
=======

export default function Home() {
  // Check if the user is connected
  const isConnected = navigator.onLine;
  // Fetch products with pagination until we have all products
  const fetchProduct = async ({ pageParam = 1 }) => {
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce API keys are missing");
    }
>>>>>>> 2-boonaa

  const { data, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  console.log(data?.pages?.flat());
  return (
    <div className="mt-44 ml-64">
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
<<<<<<< HEAD

      <button onClick={() => setSetting((prev) => !prev)}>
        <AiFillSetting />
      </button>
      {setting && <div>Settings Panel</div>}
=======
>>>>>>> 2-boonaa
    </div>
  );
}
