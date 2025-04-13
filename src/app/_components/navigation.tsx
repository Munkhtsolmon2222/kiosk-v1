"use client";

import { useCategories } from "../../../providers/CategoriesContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings } from "./settings";
import Link from "next/link";
import { getCookie } from "cookies-next/client";

export function Navigation() {
  const {
    data1,
    isLoading,
    isError,
    error,
    subCategory,
    setMainCategory,
    mainCategory,
    thirdCategory,
  } = useCategories();
  const [activeParentId, setActiveParentId] = useState<number | null>(
    subCategory
  );
  const [selectedCategory, setSelectedCategory] = useState<any>(subCategory);
  const [selectedMainCategoryActive, setSelectedMainCategoryActive] =
    useState<any>(mainCategory);
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<any>(thirdCategory);
  const [selectedThirdCategory, setSelectedThirdCategory] = useState<any>(null);
  console.log(selectedSubCategory);
  console.log(selectedThirdCategory);
  const router = useRouter();
  const pathname = usePathname();
  const lastRoute = pathname.split("/").pop(); // This will give "71"
  const categories = data1 || [];

  const parentId =
    categories.find((category) => category.name === mainCategory)?.id || null;
  useEffect(() => {
    setSelectedMainCategoryActive(mainCategory);
    setSelectedCategory(subCategory);
    setSelectedSubCategory(subCategory);
    setSelectedThirdCategory(thirdCategory);

    // Ensure categories are available before setting defaults
    if (categories.length > 0 && activeParentId === null) {
      const defaultMainCategory = categories.find(
        (category) => !category.parent
      ); // Find the first main category
      if (defaultMainCategory) {
        setActiveParentId(defaultMainCategory.id);
        setSelectedCategory(defaultMainCategory.id);

        // Expand its first subcategory, if available
        const firstSubCategory = categories.find(
          (sub) => sub.parent === defaultMainCategory.id
        );
        if (firstSubCategory) {
          setSelectedSubCategory(firstSubCategory.id);

          // Expand its first third category, if available
          const firstThirdCategory = categories.find(
            (third) => third.parent === firstSubCategory.id
          );
          if (firstThirdCategory) {
            setSelectedThirdCategory(firstThirdCategory.id);
          }
        }
      }
    }
  }, [mainCategory, subCategory, thirdCategory, categories, router]); // Depend on categories to re-run when they are updated

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
  console.log(selectedCategory);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  console.log(categories);
  console.log(activeParentId);

  return (
    <div>
      <header className="w-full h-48 bg-[#f7eaea] border-[3px] border-black font-semibold rounded-b-xl shadow-md fixed right-10 left-0 top-0 z-50">
        <div className="container mx-auto flex items-center justify-around px-4 py-4 max-w-full">
          <Link href={`/`}>
            <div className="flex items-center justify-start">
              <img
                src="https://res.cloudinary.com/drp3yksbi/image/upload/v1743924416/Logo_mrf73b.jpg"
                alt="Logo"
                className="h-25"
              />
            </div>
          </Link>

          <nav className="md:flex gap-10 text-red-700 font-bold">
            {["Эрэгтэй", "Эмэгтэй", "Хосуудад", "Парти "].map(
              (category: any) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedMainCategoryActive(category);
                    handleCategorySelection(category);
                  }}
                  className={`text-[20px] w-[80px] h-[100px] font-semibold border border-[#ab3030] text-center whitespace-nowrap rounded-lg transition-all duration-300 ${
                    selectedMainCategoryActive === category
                      ? "bg-[#a58c8c] text-[#ab3030]"
                      : "bg-transparent hover:bg-blue-100"
                  }`}
                >
                  {category?.image?.src && (
                    <img
                      className="w-[30px] h-[30px] rounded-[10px]"
                      src={category?.image?.src}
                      alt={`${category} image`} // Alt text for accessibility
                    />
                  )}
                  {category}
                </button>
              )
            )}
            <Settings
              onSelectCategory={handleCategorySelection}
              onSubCategory={setSelectedSubCategory}
              onThirdCategory={setSelectedThirdCategory}
            />
          </nav>
        </div>
      </header>

      <aside className="fixed top-48 left-0 h-full bg-[#ab3030] text-white rounded-3xl transition-all w-80">
        <nav className="flex flex-col gap-6 p-4">
          {categories
            .filter((category) => category.parent === parentId)
            .map((category: any) => (
              <div key={category.id}>
                {" "}
                <div className="flex border-white border rounded-2xl justify-center items-center">
                  {category?.image?.src && (
                    <img
                      className="w-[30px] h-[30px] border-white border rounded-[10px]"
                      src={category?.image?.src}
                    />
                  )}{" "}
                  <button
                    onClick={() => {
                      const subCategories = categories.filter(
                        (sub) => sub.parent === category.id
                      );
                      if (subCategories.length === 0) {
                        router.push(`/category/${category.id}`);
                        setSelectedCategory(category.id);
                      } else {
                        setActiveParentId(
                          activeParentId === category.id ? null : category.id
                        );
                        setSelectedCategory(category.id);
                      }
                    }}
                    className={`text-start p-3 rounded-lg text-lg transition-all  duration-300 ${
                      selectedCategory === category.id
                        ? "bg-gray-800  text-white"
                        : "bg-transparent "
                    }`}
                  >
                    {category.name}
                  </button>
                </div>
                {/* Render subcategories when the parent is active */}
                {activeParentId === category.id &&
                  categories
                    .filter((sub) => sub.parent === category.id)
                    .map((subCategory) => {
                      const hasThirdCategories = categories.some(
                        (child) => child.parent === subCategory.id
                      );
                      console.log(activeParentId, category.id);
                      return (
                        <div key={subCategory.id}>
                          <button
                            className={`mt-2 ml-5 px-2 text-md text-start transition-all duration-300 ${
                              selectedSubCategory === subCategory.id
                                ? "bg-gray-700 text-white rounded-2xl"
                                : "bg-amber-900 text-white hover:bg-blue-700 rounded-2xl"
                            }`}
                            onClick={() => {
                              router.push(`/category/${subCategory.id}`);
                              setSelectedSubCategory(subCategory.id);
                              console.log(selectedSubCategory, subCategory.id);
                              // Preserve the selectedCategory (Main category) and don't override it
                              if (!selectedCategory) {
                                setSelectedCategory(category.id);
                              }

                              const thirdCategories = categories.filter(
                                (third) => third.parent === subCategory.id
                              );

                              if (thirdCategories.length > 0) {
                                setSelectedThirdCategory(thirdCategories[0].id);
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
                                    selectedThirdCategory === thirdCategory.id
                                      ? "bg-gray-700 text-white rounded-xl"
                                      : "bg-gray-700 text-white hover:bg-blue-500 rounded-xl"
                                  }`}
                                  onClick={() => {
                                    router.push(
                                      `/category/${thirdCategory.id}`
                                    );
                                    setSelectedThirdCategory(thirdCategory.id);
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
