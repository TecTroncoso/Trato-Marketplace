import Link from "next/link";
import type { Category } from "@trato/shared";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section aria-labelledby="categorias-titulo">
      <h2 id="categorias-titulo" className="mb-3 mt-6 px-1 text-lg font-semibold text-trato-ink sm:text-xl">
        Explorá por categoría
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categorias/${category.slug}`}
            className="group flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.35)]"
          >
            <span className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-black/[0.04] text-2xl transition group-hover:scale-105">
              {category.icon ?? "🛍️"}
            </span>
            <span className="line-clamp-2 text-xs font-semibold leading-tight text-trato-ink">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
