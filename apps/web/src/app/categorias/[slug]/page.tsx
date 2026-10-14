import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import type { SearchResult } from "@trato/shared";
import { buildQuery, serverFetch } from "@/lib/api";
import { parseSearchParams, searchHref, toApiQuery } from "@/lib/search-params";
import { ApiOffline } from "@/components/layout/api-offline";
import { FiltersPanel, MobileFilters } from "@/components/search/filters-panel";
import { SortTabs } from "@/components/search/sort-tabs";
import { ProductGrid } from "@/components/product/product-grid";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  level: number;
  parentId: string | null;
  children?: CategoryNode[];
  parent?: { id: string; name: string; slug: string; icon: string | null; parent?: { id: string; name: string; slug: string } | null } | null;
}

async function loadCategory(slug: string): Promise<CategoryNode> {
  return serverFetch<CategoryNode>(`/categories/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await loadCategory(slug);
    return {
      title: `${category.name} | Comprá online`,
      description: `Encontrá lo mejor en ${category.name} con envío gratis y cuotas sin interés en Trato.`,
    };
  } catch {
    return { title: "Categoría" };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const raw = await searchParams;
  const searchState = parseSearchParams(raw);
  const basePath = `/categorias/${slug}`;

  let category: CategoryNode;
  let result: SearchResult;
  try {
    [category, result] = await Promise.all([
      loadCategory(slug),
      serverFetch<SearchResult>(
        `/search${buildQuery(toQueryWithCategory(searchState, slug))}`,
      ),
    ]);
  } catch (error) {
    return (
      <div className="px-3 py-10">
        <ApiOffline detail={(error as Error).message} />
      </div>
    );
  }

  const crumbs = [
    { label: "Inicio", href: "/" },
    ...(category.parent ? [{ label: category.parent.name, href: `/categorias/${category.parent.slug}` }] : []),
    { label: category.name },
  ];

  return (
    <div className="mx-auto max-w-[1220px] px-3 py-4 sm:px-4">
      <Breadcrumbs items={crumbs} className="mb-3" />

      <header className="mb-4 flex items-center gap-4 rounded-xl bg-white p-4 shadow-[var(--shadow-card)]">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-3xl">
          {category.icon ?? "🛍️"}
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-trato-ink sm:text-2xl">{category.name}</h1>
          <p className="text-sm text-trato-muted">
            {result.total.toLocaleString("es-AR")} productos disponibles
            {category.parent ? ` en ${category.parent.name}` : ""}
          </p>
        </div>
      </header>

      {category.children && category.children.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categorias/${child.slug}`}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-trato-ink shadow-[var(--shadow-card)] transition hover:bg-trato-blue-soft hover:text-trato-blue"
            >
              {child.icon ? `${child.icon} ` : ""}
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <FiltersPanel basePath={basePath} params={searchState} facets={result.facets} />
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MobileFilters basePath={basePath} params={searchState} facets={result.facets} />
          </div>
          <SortTabs basePath={basePath} params={searchState} total={result.total} />

          {result.hits.length > 0 ? (
            <>
              <ProductGrid products={result.hits} columns="compact" className="md:grid-cols-3 xl:grid-cols-4" />
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                hrefFor={(page) => searchHref(basePath, searchState, { page: String(page) })}
              />
            </>
          ) : (
            <div className="rounded-lg bg-white shadow-[var(--shadow-card)]">
              <EmptyState
                icon={PackageSearch}
                title="No hay productos con estos filtros"
                description="Probá quitando algunos filtros para ver más resultados en esta categoría."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toQueryWithCategory(state: ReturnType<typeof parseSearchParams>, slug: string) {
  const query = toApiQuery(state, 24);
  return { ...query, category: slug };
}
