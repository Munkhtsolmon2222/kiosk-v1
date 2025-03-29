"use client";
import { useEffect, useState } from "react";
import ProductCard from "./_components/product";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const consumerKey = "ck_d8c09aa4161ba973413d2bf799538bc1f578cd7e";
  const consumerSecret = "cs_394951181832519dcf98ab0d10b6515552e31019";
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let allProducts: any = [];
        let page = 1;
        let perPage = 10; // Number of products per page

        const res = await fetch(
          `https://erchuudiindelguur.mn/wp-json/wc/v3/products?per_page=${perPage}&page=${page}`,
          {
            headers: {
              Authorization:
                "Basic " + btoa(`${consumerKey}:${consumerSecret}`),
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();

        allProducts = [...allProducts, ...data];
        page++; // Move to the next page

        setProducts(allProducts); // Set all products after fetching all pages
      } catch (e: any) {
        setError(e.message);
      }
    };

    fetchProducts();
  }, []);

  if (error) return <div>Error: {error}</div>;
  console.log(products);
  return (
    <div>
      {products.length === 0 ? (
        <p>Loading products...</p>
      ) : (
        products.map((product: any, index: any) => (
          <ProductCard key={index} product={product} />
        ))
      )}
    </div>
  );
}
