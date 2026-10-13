"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ProductSummary } from "@trato/shared";
import { ProductCard } from "@/components/product/product-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FeaturedTabs({
  bestSellers,
  topRated,
  newest,
}: {
  bestSellers: ProductSummary[];
  topRated: ProductSummary[];
  newest: ProductSummary[];
}) {
  const lists: Record<string, ProductSummary[]> = {
    best: bestSellers,
    rated: topRated,
    newest,
  };
  const [tab, setTab] = useState("best");
  const current = lists[tab]?.length ? lists[tab] : bestSellers;
  if (!current.length) return null;

  return (
    <section aria-labelledby="destacados-titulo" className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h2 id="destacados-titulo" className="text-lg font-bold text-trato-ink sm:text-xl">
          Productos destacados
        </h2>
        <Link href="/buscar" className="inline-flex items-center gap-1 text-sm font-semibold text-trato-blue transition hover:gap-2">
          Ver todos <ArrowRight className="size-4" />
        </Link>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="best">Más vendidos</TabsTrigger>
          <TabsTrigger value="rated">Mejores valorados</TabsTrigger>
          <TabsTrigger value="newest">Nuevos ingresos</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          >
            {current.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} variant="compact" />
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
