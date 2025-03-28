import ProductDialog from "./_components/popupDialogue";
import { ProductCard } from "./_components/product";

export default function Home() {
  return (
    <div>
      <ProductCard />
      <ProductDialog />
    </div>
  );
}
