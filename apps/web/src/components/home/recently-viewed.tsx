"use client";

import { History, X } from "lucide-react";
import { ProductRail } from "@/components/product/product-rail";
import { useRecentStore } from "@/store/recent-store";
import { useMounted } from "@/hooks/use-client";

export function RecentlyViewed() {
  const mounted = useMounted();
  const items = useRecentStore((state) => state.items);
  const clear = useRecentStore((state) => state.clear);

  if (!mounted || items.length < 4) return null;

  return (
    <div className="relative">
      <ProductRail
        products={items}
        title="Inspirado en lo que viste"
        subtitle="Productos que estuviste mirando"
        href="/buscar"
        hrefLabel="Seguir explorando"
      />
      <button
        type="button"
        onClick={clear}
        className="absolute right-4 top-5 hidden items-center gap-1 text-xs font-semibold text-trato-muted transition hover:text-trato-ink lg:flex"
      >
        <X className="size-3" /> Borrar historial
      </button>
      <span className="sr-only">
        <History className="size-3" /> Historial de navegación
      </span>
    </div>
  );
}
