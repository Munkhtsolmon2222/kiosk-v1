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
    const perPage = 100;

    // Use Next.js API route to avoid CORS issues
    const response = await fetch(
      `/api/products?per_page=${perPage}&page=${pageParam}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Error ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    const data = result.data;
    const totalPages = result.totalPages || Math.ceil(data.length / perPage);

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
    staleTime: 1000 * 60 * 60 * 24, // 1 day
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
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
