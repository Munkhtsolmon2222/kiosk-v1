"use client";

import ProductCard from "@/app/_components/product";
import { useParams } from "next/navigation";
import { useProducts } from "../../../../providers/productContext";
import { useCategories } from "../../../../providers/CategoriesContext";
import IdleRedirect from "@/app/_components/idleRedirect";
import { useIsOpen } from "../../../../providers/isOpenContext";
import { useEffect, useState } from "react";

export default function Page() {
  const params = useParams();
  const { id } = params;
  const { data, isLoading, error } = useProducts();
  const { data1 } = useCategories();
  const { open, setOpen } = useIsOpen();
  const [isLongerIdleTimeoutNeeded, setIsLongerIdleTimeoutNeeded] =
    useState<boolean>(false);

  // ✅ Always call hooks before any returns
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, extending timeout");
      setIsLongerIdleTimeoutNeeded(true);
    } else {
      console.log("Dialog closed, restoring default timeout");
      setIsLongerIdleTimeoutNeeded(false);
    }
  }, [open]);

  // ❌ These were before some hooks — now placed below
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const bigData = data?.pages.flatMap((page) => page.data) || [];
  const dataSpread = [...bigData];
  const filteredProducts = dataSpread.filter((product: any) =>
    product?.categories?.some((category: any) => category.id.toString() === id)
  );
  const categoriesData = data1;

  return (
    <div className="mt-[220px] ml-45">
      <IdleRedirect
        timeout={isLongerIdleTimeoutNeeded ? 610000 : 30000}
        redirectPath="/"
        excludePaths={["/"]}
        dialogOpen={open}
      />
      {categoriesData
        ?.filter((category) => category.id.toString() == id)
        .map((category, i) => (
          <div
            key={i}
            className="text-[#ab3030] bg-[#f1f1f1] text-center p-3 rounded-2xl font-bold mx-auto w-fit text-[24px]"
          >
            {category.name}
          </div>
        ))}
      {filteredProducts.length === 0 ? (
        <p className="w-fit mt-10 mx-auto">Та түр хүлээнэ үү.</p>
      ) : (
        <div className="grid grid-cols-2 ml-32">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
