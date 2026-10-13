import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { Category } from "@trato/shared";
import { cn } from "@/lib/utils";

export function CategoryRail({ categories, className }: { categories: Category[]; className?: string }) {
  if (!categories.length) return null;
  return (
    <nav aria-labelledby="rail-categorias" className={cn("rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]", className)}>
      <h2 id="rail-categorias" className="mb-2 px-2 text-sm font-bold text-trato-ink">
        Categorías
      </h2>
      <ul className="flex flex-col">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categorias/${category.slug}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-trato-ink transition hover:bg-trato-blue-soft hover:text-trato-blue"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-base">
                {category.icon ?? "🛍️"}
              </span>
              <span className="line-clamp-1">{category.name}</span>
            </Link>
          </li>
        ))}
        <li className="mt-1">
          <Link
            href="/buscar"
            className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-trato-blue transition hover:bg-trato-blue-soft"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-trato-blue-soft">
              <MoreHorizontal className="size-4" />
            </span>
            Más categorías
          </Link>
        </li>
      </ul>
    </nav>
  );
}
