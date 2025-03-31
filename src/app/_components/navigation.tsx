"use client";

import { useCategories } from "../../../providers/CategoriesContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings } from "./settings";

export function Navigation() {
  const { data, isLoading, isError, error, setMainCategory, mainCategory } =
    useCategories();
  const [activeParentId, setActiveParentId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );
  const [selectedThirdCategory, setSelectedThirdCategory] = useState<
    string | null
  >(null);

  const router = useRouter();

  const categories = data || [];

  const parentId =
    categories.find((category) => category.name === mainCategory)?.id || null;

  const handleCategorySelection = (category: string) => {
    setMainCategory(category);
    setSelectedCategory(category);

    const mainCat = categories.find((c) => c.name === category);
    if (mainCat) {
      const subCategories = categories.filter(
        (sub) => sub.parent === mainCat.id
      );
      if (subCategories.length > 0) {
        const firstSubCategory = subCategories[0];
        setSelectedSubCategory(firstSubCategory.name);
        router.push(`/category/${firstSubCategory.id}`);

        const thirdCategories = categories.filter(
          (third) => third.parent === firstSubCategory.id
        );
        if (thirdCategories.length > 0) {
          setSelectedThirdCategory(thirdCategories[0].name);
          router.push(`/category/${thirdCategories[0].id}`);
        } else {
          setSelectedThirdCategory(null);
        }
      } else {
        setSelectedSubCategory(null);
        setSelectedThirdCategory(null);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <header className="w-full h-32 bg-white shadow-md fixed right-10 left-0 top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-full">
          <div className="flex items-center justify-start">
            <img src="./png.png" alt="Logo" className="h-25" />
          </div>
          <nav className="hidden md:flex gap-10 text-red-700 font-bold">
            {["Эрэгтэй", "Эмэгтэй", "Хосуудад", "Парти тоглоом"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelection(category)}
                  className={`text-[20px] font-semibold py-2 px-4 rounded-lg transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-blue-500 text-white"
                      : "bg-transparent hover:bg-blue-100"
                  }`}
                >
                  {category}
                </button>
              )
            )}
            <Settings
              onSelectCategory={handleCategorySelection}
              onSubCategory={setSelectedSubCategory}
              onThirdCategory={setSelectedThirdCategory} // Pass setSelectedThirdCategory as onThirdCategory
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
                      setSelectedCategory(category.name);
                    } else {
                      setActiveParentId(
                        activeParentId === category.id ? null : category.id
                      );
                      setSelectedCategory(category.name);
                    }
                  }}
                  className={`text-start p-3 rounded-lg text-lg transition-all duration-300 ${
                    selectedCategory === category.name
                      ? "bg-blue-500 text-white"
                      : "bg-transparent hover:bg-blue-100"
                  }`}
                >
                  {category.name}
                </button>

                {/* Render subcategories when the parent is active */}
                {activeParentId === category.id &&
                  categories
                    .filter((sub) => sub.parent === category.id)
                    .map((subCategory) => {
                      const hasThirdCategories = categories.some(
                        (child) => child.parent === subCategory.id
                      );

                      return (
                        <div key={subCategory.id}>
                          <button
                            className={`mt-2 ml-5 px-2 text-md text-start transition-all duration-300 ${
                              selectedSubCategory === subCategory.name
                                ? "bg-blue-900 text-white rounded-2xl"
                                : "bg-amber-900 text-white hover:bg-blue-700 rounded-2xl"
                            }`}
                            onClick={() => {
                              router.push(`/category/${subCategory.id}`);
                              setSelectedSubCategory(subCategory.name);

                              const thirdCategories = categories.filter(
                                (third) => third.parent === subCategory.id
                              );

                              if (thirdCategories.length > 0) {
                                setSelectedThirdCategory(
                                  thirdCategories[0].name
                                );
                                router.push(
                                  `/category/${thirdCategories[0].id}`
                                );
                              } else {
                                setSelectedThirdCategory(null);
                              }
                            }}
                          >
                            {subCategory.name}
                          </button>

                          {/* Render third categories */}
                          {hasThirdCategories &&
                            categories
                              .filter(
                                (third) => third.parent === subCategory.id
                              )
                              .map((thirdCategory) => (
                                <button
                                  key={thirdCategory.id}
                                  className={`mt-2 ml-10 px-2 text-sm text-start transition-all duration-300 ${
                                    selectedThirdCategory === thirdCategory.name
                                      ? "bg-blue-700 text-white rounded-xl"
                                      : "bg-gray-700 text-white hover:bg-blue-500 rounded-xl"
                                  }`}
                                  onClick={() => {
                                    router.push(
                                      `/category/${thirdCategory.id}`
                                    );
                                    setSelectedThirdCategory(
                                      thirdCategory.name
                                    );
                                  }}
                                >
                                  {thirdCategory.name}
                                </button>
                              ))}
                        </div>
                      );
                    })}
              </div>
            ))}
        </nav>
      </aside>
    </div>
  );
}
