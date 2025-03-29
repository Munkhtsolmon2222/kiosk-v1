"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import ProductCard from "./_components/product";

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

    const perPage = 100; // Maximum per page limit

    const response = await fetch(
      `https://erchuudiindelguur.mn/wp-json/wc/v3/products?per_page=${perPage}&page=${pageParam}`,
      {
        headers: {
          Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Use react-query's useInfiniteQuery to fetch all pages of products
  const { data, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["product"], // Query key to uniquely identify this query
    queryFn: fetchProduct, // The function that fetches the data
    getNextPageParam: (lastPage, allPages) => {
      // If the current page contains 100 products, there might be more to fetch
      return lastPage.length === 100 ? allPages.length + 1 : undefined; // Return next page number or stop
    },
    refetchInterval: 10000, // Only refetch every second when offline
    initialPageParam: 1, // Start from page 1
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-44 ml-60">
      {data?.pages.flat().length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {data?.pages.flat().map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
