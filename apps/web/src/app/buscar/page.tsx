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

export const metadata: Metadata = {
  title: "Resultados de búsqueda",
};

const SUGGESTIONS = ["Samsung Galaxy", "iPhone 15", "Notebook", "Smart TV", "Auriculares", "Zapatillas", "Bicicleta"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = parseSearchParams(raw);
  const basePath = "/buscar";

  let result: SearchResult;
  try {
    result = await serverFetch<SearchResult>(`/search${buildQuery(toApiQuery(params, 24))}`, { revalidate: 30 });
  } catch (error) {
    return (
      <div className="px-3 py-10">
        <ApiOffline detail={(error as Error).message} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1220px] px-3 py-4 sm:px-4">
      {params.q && (
        <p className="mb-3 flex flex-wrap items-center gap-2 text-xs text-trato-muted">
          <Link href="/" className="transition hover:text-trato-blue">
            Inicio
          </Link>
          <span>›</span>
          <span className="font-semibold text-trato-ink">Búsqueda: {params.q}</span>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <FiltersPanel basePath={basePath} params={params} facets={result.facets} />
          </div>
        </aside>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MobileFilters basePath={basePath} params={params} facets={result.facets} />
          </div>
          <SortTabs basePath={basePath} params={params} total={result.total} />

          {result.hits.length > 0 ? (
            <>
              <ProductGrid products={result.hits} columns="compact" className="md:grid-cols-3 xl:grid-cols-4" />
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                hrefFor={(page) => searchHref(basePath, params, { page: String(page) })}
              />
            </>
          ) : (
            <div className="rounded-lg bg-white shadow-[var(--shadow-card)]">
              <EmptyState
                icon={PackageSearch}
                title={`No encontramos resultados${params.q ? ` para "${params.q}"` : ""}`}
                description="Revisá la ortografía, usá menos palabras o probá con otra búsqueda. Nuestro buscador tolera errores de tipeo, así que también podés intentar de nuevo."
              />
              <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
                {SUGGESTIONS.map((suggestion) => (
                  <Link
                    key={suggestion}
                    href={`/buscar?q=${encodeURIComponent(suggestion)}`}
                    className="rounded-full bg-trato-blue-soft px-3 py-1.5 text-xs font-semibold text-trato-blue transition hover:bg-trato-blue hover:text-white"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
