"use client";

import { useCategories } from "../../../providers/CategoriesContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Router } from "next/router";
import { useEffect, useState } from "react";
import { Settings } from "./settings";

export function Navigation() {
  const { data, isLoading, isError, error, setMainCategory, mainCategory } =
    useCategories(); // Consume the context
  const [activeParentId, setActiveParentId] = useState<number | null>(null); // Define setActiveParentId
  const router = useRouter();
  const handleCategorySelection = (category: string) => {
    setMainCategory(category); // Сонгосон категориийг хадгалах
    console.log("Сонгосон категори: ", category);
  };
  const [subCategory, setSubCategory] = useState(0); // initial subcategory
  const handleSubCategory = (subCategorySelect: any) => {
    setSubCategory(subCategorySelect);
  };
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const categories = data || [];
  const parentId =
    categories.find((category) => category.name === mainCategory)?.id || null;

  return (
    <div>
      <header className="w-full h-32 bg-white shadow-md fixed right-10 left-0 top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-full">
          <div className="flex items-center justify-start">
            <img src="./jpg.jpg" alt="Logo" className="h-25" />
          </div>
          <nav className="hidden md:flex gap-10 text-red-700 font-bold">
            {["Эрэгтэй", "Эмэгтэй", "Хосуудад", "Парти тоглоом"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setMainCategory(category)}
                  className="text-[20px]"
                >
                  {category}
                </button>
              )
            )}{" "}
            <Settings
              onSelectCategory={handleCategorySelection}
              onSubCategory={handleSubCategory}
            />
          </nav>
        </div>
      </header>

      <aside className="fixed top-32 left-0 h-full bg-[#ab3030] text-white transition-all w-56">
        <nav className="flex flex-col gap-6 p-4">
          {categories
            .filter((category) => category.parent === parentId)
            .map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => {
                    const subCategories = categories.filter(
                      (sub) => sub.parent === category.id
                    );
                    if (subCategories.length === 0) {
                      router.push(`/category/${category.id}`);
                    } else {
                      setActiveParentId(
                        activeParentId === category.id ? null : category.id
                      );
                    }
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded"
                >
                  {category.name}
                </button>
                {activeParentId === category.id &&
                  categories
                    .filter((sub) => sub.parent === category.id)
                    .map((subCategory) => (
                      <button
                        key={subCategory.id}
                        className="mt-2 ml-3 text-[10px]"
                        onClick={() =>
                          router.push(`/category/${subCategory.id}`)
                        }
                      >
                        {subCategory.name}
                      </button>
                    ))}
              </div>
            ))}
        </nav>
      </aside>
    </div>
  );
}
