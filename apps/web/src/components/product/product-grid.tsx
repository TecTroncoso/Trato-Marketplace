import type { ProductSummary } from "@trato/shared";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = "default",
}: {
  products: ProductSummary[];
  className?: string;
  columns?: "default" | "compact";
}) {
  return (
    <ul
      role="list"
      className={cn(
        "grid gap-3",
        columns === "default"
          ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3",
        className,
      )}
    >
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
