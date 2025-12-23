"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";

interface Category {
  id: number;
  name: string;
  parent: number | null;
}

interface CategoryContextType {
  data1: Category[] | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  setMainCategory: React.Dispatch<React.SetStateAction<string>>;
  mainCategory: string;
  setSubCategory: React.Dispatch<React.SetStateAction<number>>;
  subCategory: number;
  setThirdCategory: React.Dispatch<React.SetStateAction<number>>;
  thirdCategory: number;
  fetchCategories: any;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  const defaultCategoryMain = getCookie("defaultCategoryMain"); // onee of 4 main categories got from cookies!!!!!!!!!
  const defaultCategorySub = getCookie("defaultCategorySub");
  const defaultCategoryThird = getCookie("defaultCategoryThird");
  console.log(defaultCategoryMain, defaultCategorySub, defaultCategoryThird);
  const [mainCategory, setMainCategory] = useState<any>(
    defaultCategoryMain || "Эрэгтэй"
  );
  const [subCategory, setSubCategory] = useState<any>(defaultCategorySub || 0);
  const [thirdCategory, setThirdCategory] = useState<any>(
    defaultCategoryThird || 0
  );

  // Fetch categories with react-query
  const fetchCategories = async ({ pageParam = 1 }) => {
    const perPage = 100;

    // Use Next.js API route to avoid CORS issues
    const response = await fetch(
      `/api/categories?per_page=${perPage}&page=${pageParam}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Error ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  };

  const { data, error, isLoading, isError } = useInfiniteQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 100 ? allPages.length + 1 : undefined,
    refetchInterval:
      typeof window !== "undefined" && navigator.onLine ? false : 1000,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 60 * 24, // 1 day
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return (
    <CategoryContext.Provider
      value={{
        data1: data?.pages.flat() || [],
        error,
        isLoading,
        isError,
        setMainCategory,
        mainCategory,
        setSubCategory,
        subCategory,
        setThirdCategory,
        thirdCategory,
        fetchCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
};
