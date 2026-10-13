"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductSummary } from "@trato/shared";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductRail({
  products,
  title,
  subtitle,
  href,
  hrefLabel = "Ver todo",
  className,
}: {
  products: ProductSummary[];
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  if (!products.length) return null;

  function scroll(direction: 1 | -1) {
    scroller.current?.scrollBy({ left: direction * (scroller.current.clientWidth * 0.85), behavior: "smooth" });
  }

  return (
    <section className={cn("rounded-xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-5", className)}>
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-trato-ink sm:text-xl">{title}</h2>
          {subtitle && <p className="text-sm text-trato-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {href && (
            <Link href={href} className="text-sm font-semibold text-trato-blue transition hover:underline">
              {hrefLabel}
            </Link>
          )}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Anterior"
              className="flex size-8 items-center justify-center rounded-full border border-trato-line text-trato-muted transition hover:border-trato-blue hover:text-trato-blue"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Siguiente"
              className="flex size-8 items-center justify-center rounded-full border border-trato-line text-trato-muted transition hover:border-trato-blue hover:text-trato-blue"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <div ref={scroller} className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {products.map((product) => (
          <div key={product.id} className="w-[172px] shrink-0 snap-start sm:w-[200px] lg:w-[224px]">
            <ProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
