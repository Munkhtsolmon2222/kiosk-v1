import { useQuery } from "@tanstack/react-query";
import ProductCard from "./_components/product";

export default function Home() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["products"], // ✅ Now uses an object
    queryFn: async () => {
      const consumerKey = process.env.NEXT_PUBLIC_WC_CONSUMER_KEY;
      const consumerSecret = process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET;
      if (!consumerKey || !consumerSecret) {
        throw new Error("WooCommerce API keys are missing");
      }
      const response = await fetch(
        `https://erchuudiindelguur.mn/wp-json/wc/v3/products?per_page=10&page=1`,
        {
          headers: {
            Authorization: "Basic " + btoa(`${consumerKey}:${consumerSecret}`),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="mt-44 ml-64">
      {data.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid gap-3 grid-cols-2">
          {data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
