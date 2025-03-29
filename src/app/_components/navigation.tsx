"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function Navigation() {
  const [mainCategory, setMainCategory] = useState("Эрэгтэй");
  const [subCategory, setSubCategory] = useState(0); // initial subcategory
  const [parentId, setParentId] = useState();
  console.log(mainCategory, subCategory, parentId);
  // Check if the user is connected
  const isConnected = navigator.onLine;

  // Fetch categories with pagination until we have all categories
  const fetchCategories = async ({ pageParam = 1 }) => {
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce API keys are missing");
    }

    const perPage = 100; // Increase per page limit to get more categories at once

    const response = await fetch(
      `https://erchuudiindelguur.mn/wp-json/wc/v3/products/categories?per_page=${perPage}&page=${pageParam}`,
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
    queryKey: ["categories"], // Query key to uniquely identify this query
    queryFn: fetchCategories, // The function that fetches the data
    getNextPageParam: (lastPage, allPages) => {
      // pageParam is implicitly handled here by React Query
      // If the number of categories returned is less than perPage, then stop fetching
      return lastPage.length === 100 ? allPages.length + 1 : undefined; // Continue fetching if there are more categories
    },
    refetchInterval: isConnected ? false : 1000, // Only refetch every second when offline
    initialPageParam: 1, // Start from page 1
  });

  useEffect(() => {
    if (data?.pages) {
      const parentCategory = data.pages
        .flat()
        .find((category) => category.name === mainCategory);
      console.log(parentCategory);
      setParentId(parentCategory?.id);
    }
  }, [data, mainCategory]); // Ensure useEffect is triggered when data or subCategory changes

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  console.log(data?.pages.flat()); // Debugging all categories
  return (
    <div>
      {/* Header Section */}
      <header className="w-full h-32 bg-white shadow-md fixed right-10 left-0 top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-full">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <img src="./jpg.jpg" alt="Logo" className="h-25" />
          </div>

          {/* Top Navigation Links */}
          <nav className="hidden md:flex gap-10  text-red-700 font-bold">
            <button
              onClick={() => setMainCategory("Эрэгтэй")}
              className="text-[20px]"
            >
              Эрэгтэй
            </button>
            <button
              onClick={() => setMainCategory("Эмэгтэй")}
              className="text-[20px]"
            >
              Эмэгтэй
            </button>
            <button
              onClick={() => setMainCategory("Хосуудад")}
              className="text-[20px]"
            >
              Хосуудад
            </button>
            <button
              onClick={() => setMainCategory("Парти тоглоом")}
              className="text-[20px]"
            >
              Парти тоглоом
            </button>
          </nav>
        </div>
      </header>

      {/* Sidebar Section */}
      <aside className="fixed top-32 left-0 h-full bg-[#ab3030] text-white transition-all w-56">
        {/* Sidebar Navigation Links */}
        <nav className="flex flex-col gap-6 p-4">
          {mainCategory === "Эрэгтэй" ? (
            data?.pages
              .flat()
              ?.filter((category) => category.parent === parentId)
              .map((category) => (
                <div key={category.id}>
                  {/* Make sure each element has a unique key */}
                  <button
                    onClick={() => setSubCategory(category.id)}
                    className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
                  >
                    {category.name}
                  </button>
                  {data?.pages
                    .flat()
                    ?.filter((category) => category.parent === subCategory)
                    .map((category, i) => (
                      <div key={i} className="mt-2 ml-3 text-[10px]">
                        {category.name}
                      </div>
                    ))}
                </div>
              ))
          ) : mainCategory === "Эмэгтэй" ? (
            <a
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
            >
              Эмэгтэй
            </a>
          ) : mainCategory === "Хосуудад" ? (
            <a
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
            >
              Хосуудад
            </a>
          ) : (
            <a
              href="#"
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
            >
              Парти тоглоом
            </a>
          )}
        </nav>
      </aside>
    </div>
  );
}
