"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";

interface ProductData {
  data: any; // Adjust this to match your API response structure
  totalPages: number;
}

interface ProductContextType {
  data: InfiniteData<ProductData, unknown> | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  fetchNextPage: any;
  hasNextPage: boolean;
  setting: boolean;
  setSetting: Dispatch<SetStateAction<boolean>>;
}

// ✅ Use a default value matching the type
const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [setting, setSetting] = useState(false);

  const fetchProduct = async ({ pageParam = 1 }) => {
    const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
    const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce API keys are missing");
    }

    const perPage = 100;
    const authHeader =
      typeof window === "undefined"
        ? Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
        : btoa(`${consumerKey}:${consumerSecret}`);

    const response = await fetch(
      `https://erchuudiindelguur.mn/wp-json/wc/v3/products?per_page=${perPage}&page=${pageParam}`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const totalPagesHeader = response.headers.get("X-WP-TotalPages");
    const totalPages = totalPagesHeader
      ? Number(totalPagesHeader)
      : Math.ceil(data.length / perPage);

    return { data, totalPages };
  };

  const {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: fetchProduct,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage.totalPages;
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 300000,
    gcTime: 600000,
  });

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      const delay = setTimeout(() => {
        fetchNextPage();
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const value: ProductContextType = {
    data,
    error,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    setting,
    setSetting,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
