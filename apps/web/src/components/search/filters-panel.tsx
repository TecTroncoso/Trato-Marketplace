"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { SearchFacets } from "@trato/shared";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SearchParamsShape } from "@/lib/search-params";
import { hasActiveFilters, searchHref } from "@/lib/search-params";
import { cn } from "@/lib/utils";

interface FiltersProps {
  basePath: string;
  params: SearchParamsShape;
  facets: SearchFacets;
}

const PRICE_PRESETS = [
  { label: "Hasta $50.000", min: "", max: "50000" },
  { label: "$50.000 a $200.000", min: "50000", max: "200000" },
  { label: "$200.000 a $600.000", min: "200000", max: "600000" },
  { label: "Más de $600.000", min: "600000", max: "" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-trato-line px-4 py-4 last:border-b-0">
      <h3 className="mb-3 text-sm font-bold text-trato-ink">{title}</h3>
      {children}
    </div>
  );
}

export function FiltersPanel({ basePath, params, facets }: FiltersProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(params.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? "");
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    setMinPrice(params.minPrice ?? "");
    setMaxPrice(params.maxPrice ?? "");
  }, [params.minPrice, params.maxPrice]);

  function go(overrides: Partial<SearchParamsShape>) {
    router.push(searchHref(basePath, params, overrides), { scroll: false });
  }

  const visibleBrands = showAllBrands ? facets.brands : facets.brands.slice(0, 8);
  const active = hasActiveFilters(params);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-trato-line px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold text-trato-ink">
          <SlidersHorizontal className="size-4" /> Filtros
        </span>
        {active && (
          <button
            type="button"
            onClick={() => router.push(searchHref(basePath, { q: params.q, brand: [] }), { scroll: false })}
            className="flex items-center gap-1 text-xs font-semibold text-trato-blue hover:underline"
          >
            <X className="size-3" /> Limpiar
          </button>
        )}
      </div>

      <Section title="Precio">
        <div className="mb-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Mínimo"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="h-9 w-full rounded-md border border-trato-line px-2 text-sm outline-none focus:border-trato-blue"
          />
          <span className="text-trato-muted">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Máximo"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-9 w-full rounded-md border border-trato-line px-2 text-sm outline-none focus:border-trato-blue"
          />
        </div>
        <button
          type="button"
          onClick={() => go({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined })}
          className="mb-3 w-full rounded-md bg-trato-blue-soft py-1.5 text-xs font-bold text-trato-blue transition hover:bg-trato-blue hover:text-white"
        >
          Aplicar rango
        </button>
        <div className="flex flex-col gap-1.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => go({ minPrice: preset.min || undefined, maxPrice: preset.max || undefined })}
              className="text-left text-xs text-trato-blue transition hover:underline"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Section>

      {facets.conditions.length > 0 && (
        <Section title="Condición">
          <div className="flex flex-col gap-2.5">
            {facets.conditions.map((bucket) => (
              <label key={bucket.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={params.condition === bucket.value}
                  onCheckedChange={() => go({ condition: params.condition === bucket.value ? undefined : bucket.value })}
                />
                <span className="flex-1 capitalize text-trato-ink">{bucket.value}</span>
                <span className="text-xs text-trato-muted">{bucket.count}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section title="Envío y stock">
        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={Boolean(params.freeShipping)} onCheckedChange={() => go({ freeShipping: params.freeShipping ? undefined : "1" })} />
            <span className="flex-1 text-trato-ink">Envío gratis</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={Boolean(params.inStock)} onCheckedChange={() => go({ inStock: params.inStock ? undefined : "1" })} />
            <span className="flex-1 text-trato-ink">Solo con stock</span>
          </label>
        </div>
      </Section>

      {facets.locations.length > 0 && (
        <Section title="Ubicación">
          <select
            value={params.location ?? ""}
            onChange={(event) => go({ location: event.target.value || undefined })}
            className="h-10 w-full rounded-md border border-trato-line bg-white px-2 text-sm outline-none focus:border-trato-blue"
          >
            <option value="">Todas las ubicaciones</option>
            {facets.locations.map((bucket) => (
              <option key={bucket.value} value={bucket.value}>
                {bucket.value} ({bucket.count})
              </option>
            ))}
          </select>
        </Section>
      )}

      {facets.brands.length > 0 && (
        <Section title="Marca">
          <div className="flex flex-col gap-2.5">
            {visibleBrands.map((bucket) => {
              const checked = params.brand.includes(bucket.value);
              return (
                <label key={bucket.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      go({
                        brand: checked ? params.brand.filter((item) => item !== bucket.value) : [...params.brand, bucket.value],
                      })
                    }
                  />
                  <span className="flex-1 text-trato-ink">{bucket.value}</span>
                  <span className="text-xs text-trato-muted">{bucket.count}</span>
                </label>
              );
            })}
          </div>
          {facets.brands.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllBrands((current) => !current)}
              className="mt-3 text-xs font-semibold text-trato-blue hover:underline"
            >
              {showAllBrands ? "Mostrar menos" : `Mostrar todas (${facets.brands.length})`}
            </button>
          )}
        </Section>
      )}
    </div>
  );
}

export function MobileFilters(props: FiltersProps) {
  const active = hasActiveFilters(props.params);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={cn("lg:hidden", active && "border-trato-blue bg-trato-blue-soft")}>
          <SlidersHorizontal /> Filtros{active ? " •" : ""}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto pt-14" >
        <SheetTitle className="sr-only">Filtros de búsqueda</SheetTitle>
        <FiltersPanel {...props} />
      </SheetContent>
    </Sheet>
  );
}
