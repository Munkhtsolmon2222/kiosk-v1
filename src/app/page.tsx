import ProductCard from "./_components/product";

export default function Home() {
  return (
    <div className="mt-44 ml-60 gap-3 flex">
      <ProductCard />
      <ProductCard />
    </div>
  );
}
