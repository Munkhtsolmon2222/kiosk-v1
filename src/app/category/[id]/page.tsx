"use client";

import ProductCard from "@/app/_components/product";
import { useParams } from "next/navigation";
import { useProducts } from "../../../../providers/productContext";

export default function Page() {
  const params = useParams(); // Get dynamic parameters from the URL
  const { id } = params; // Destructure to get the 'id' from the URL
  const { data, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Ensure bigData is always an array
  const bigData = data?.pages.flatMap((page) => page.data) || []; // ✅ Fix applied
  const dataSpread = [...bigData];

  // Filter the products based on the 'id' parameter from the URL (category id)
  const filteredProducts = dataSpread.filter((product: any) =>
    product?.categories?.some((category: any) => category.id.toString() === id)
  );

  console.log(filteredProducts);

  return (
    <div className="mt-44 ml-60">
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
