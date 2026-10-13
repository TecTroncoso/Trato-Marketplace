import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { ProductSummary } from "@trato/shared";
import { ProductCard } from "@/components/product/product-card";

export function DealsSection({
  products,
  href = "/buscar?sort=sold_desc",
  limit = 10,
}: {
  products: ProductSummary[];
  href?: string;
  limit?: number;
}) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="ofertas-titulo" className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 id="ofertas-titulo" className="flex items-center gap-2 text-lg font-bold text-trato-ink sm:text-xl">
          <Flame className="size-5 text-orange-500" />
          Ofertas del día
        </h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-trato-blue transition hover:gap-2"
        >
          Ver todas <ArrowRight className="size-4" />
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {products.slice(0, limit).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
