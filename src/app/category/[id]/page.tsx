"use client";
import ProductCard from "@/app/_components/product";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams(); // Get dynamic parameters from the URL
  const { id } = params; // Destructure to get the 'id' from the URL

  // Define the queryFn inside the useQuery hook
  // Check if the user is connected
  const isConnected = navigator.onLine;

  // Fetch categories with pagination until we have all categories
  const fetchProduct = async ({ pageParam = 1 }) => {
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce API keys are missing");
    }

    const perPage = 400; // Increase per page limit to get more categories at once

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

  // Use react-query's useInfiniteQuery to fetch all pages of categories
  const { data, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["product"], // Query key to uniquely identify this query
    queryFn: fetchProduct, // The function that fetches the data
    getNextPageParam: (lastPage, allPages) => {
      // pageParam is implicitly handled here by React Query
      // If the number of categories returned is less than perPage, then stop fetching
      return lastPage.length === 400 ? allPages.length + 1 : undefined; // Continue fetching if there are more categories
    },
    refetchInterval: isConnected ? false : 1000, // Only refetch every second when offline
    initialPageParam: 1, // Start from page 1
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Filter the products by the 'id' parameter from the URL (category id)
  const filteredProducts = data?.pages
    .flat()
    ?.filter((product: any) =>
      product.categories.some((category: any) => category.id.toString() === id)
    );
  console.log(filteredProducts);
  console.log(data);
  console.log(data?.pages.flat());
  return (
    <div className="mt-44 ml-60">
      {filteredProducts?.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {filteredProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
