"use client";

import Link from "next/link";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { SORT_OPTIONS, type SearchFacets } from "@trato/shared";
import type { SearchParamsShape } from "@/lib/search-params";
import { searchHref } from "@/lib/search-params";
import { cn } from "@/lib/utils";

export function SortTabs({
  basePath,
  params,
  total,
  engine,
}: {
  basePath: string;
  params: SearchParamsShape;
  total: number;
  engine: string;
}) {
  const current = params.sort ?? "relevance";
  const active = SORT_OPTIONS.find((option) => option.value === current) ?? SORT_OPTIONS[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-sm text-trato-muted">
        <span className="font-semibold text-trato-ink">{total.toLocaleString("es-AR")}</span>
        {params.q ? `resultados para "${params.q}"` : "productos"}
        <span
          className={cn(
            "hidden rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline",
            engine === "meilisearch" ? "bg-trato-green-soft text-trato-green" : "bg-trato-blue-soft text-trato-blue",
          )}
          title={engine === "meilisearch" ? "Búsqueda con Meilisearch" : "Búsqueda local con tolerancia a errores"}
        >
          {engine === "meilisearch" ? "Meilisearch" : "Buscador local"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-trato-muted sm:block">Ordenar por</span>
        <div className="hidden gap-1 sm:flex">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={searchHref(basePath, params, { sort: option.value })}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                current === option.value
                  ? "bg-trato-blue text-white"
                  : "text-trato-blue hover:bg-trato-blue-soft",
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <div className="sm:hidden">
          <select
            value={current}
            onChange={(event) => {
              window.location.href = searchHref(basePath, params, { sort: event.target.value });
            }}
            className="h-9 rounded-md border border-trato-line bg-white px-2 text-xs font-semibold text-trato-blue"
            aria-label="Ordenar por"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <span className="hidden items-center gap-1 text-xs text-trato-muted lg:flex">
          <SlidersHorizontal className="size-3.5" />
          {active.label}
          <ChevronDown className="size-3" />
        </span>
      </div>
    </div>
  );
}

export function facetsSummary(facets: SearchFacets): string {
  return `${facets.brands.length} marcas · ${facets.conditions.length} condiciones · ${facets.locations.length} ubicaciones`;
}
