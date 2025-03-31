"use client";

import ProductCard from "@/app/_components/product";
import { useParams } from "next/navigation";
import { useProducts } from "../../../../providers/productContext";
import { useCategories } from "../../../../providers/CategoriesContext";

export default function Page() {
  const params = useParams(); // Get dynamic parameters from the URL
  const { id } = params; // Destructure to get the 'id' from the URL
  const { data, isLoading, error } = useProducts();
  const { data1 } = useCategories();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Ensure bigData is always an array
  const bigData = data?.pages.flatMap((page) => page.data) || []; // ✅ Fix applied
  const dataSpread = [...bigData];

  // Filter the products based on the 'id' parameter from the URL (category id)
  const filteredProducts = dataSpread.filter((product: any) =>
    product?.categories?.some((category: any) => category.id.toString() === id)
  );
  const categoriesData = data1;

  console.log(filteredProducts);

  return (
    <div className="mt-44 ml-60">
      {categoriesData
        ?.filter((category) => category.id.toString() == id)
        .map((category) => (
          <div className="text-[#ab3030] font-bold mx-auto w-[40vw] text-[24px]">
            {category.name}
          </div>
        ))}
      {filteredProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
