import type { QueryValue } from "./api";

export interface SearchParamsShape {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  brand: string[];
  location?: string;
  freeShipping?: string;
  inStock?: string;
  sort?: string;
  page?: string;
}

function first(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function parseSearchParams(raw: Record<string, string | string[] | undefined>): SearchParamsShape {
  const brandRaw = raw.brand;
  const brand = brandRaw === undefined ? [] : Array.isArray(brandRaw) ? brandRaw : [brandRaw];
  return {
    q: first(raw.q),
    category: first(raw.category),
    minPrice: first(raw.minPrice),
    maxPrice: first(raw.maxPrice),
    condition: first(raw.condition),
    brand,
    location: first(raw.location),
    freeShipping: first(raw.freeShipping),
    inStock: first(raw.inStock),
    sort: first(raw.sort),
    page: first(raw.page),
  };
}

export function searchHref(
  basePath: string,
  params: SearchParamsShape,
  overrides: Partial<SearchParamsShape> = {},
): string {
  const merged: SearchParamsShape = { ...params, page: undefined, ...overrides };
  const search = new URLSearchParams();
  if (merged.q) search.set("q", merged.q);
  if (merged.category) search.set("category", merged.category);
  if (merged.minPrice) search.set("minPrice", merged.minPrice);
  if (merged.maxPrice) search.set("maxPrice", merged.maxPrice);
  if (merged.condition) search.set("condition", merged.condition);
  for (const brand of merged.brand ?? []) search.append("brand", brand);
  if (merged.location) search.set("location", merged.location);
  if (merged.freeShipping) search.set("freeShipping", "1");
  if (merged.inStock) search.set("inStock", "1");
  if (merged.sort && merged.sort !== "relevance") search.set("sort", merged.sort);
  if (merged.page && merged.page !== "1") search.set("page", merged.page);
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function toApiQuery(params: SearchParamsShape, perPage = 24): Record<string, QueryValue> {
  const page = Number(params.page ?? "1");
  return {
    q: params.q,
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    condition: params.condition,
    brand: params.brand.length ? params.brand : undefined,
    location: params.location,
    freeShipping: params.freeShipping ? true : undefined,
    inStock: params.inStock ? true : undefined,
    sort: (params.sort as QueryValue) ?? undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage,
  };
}

export function hasActiveFilters(params: SearchParamsShape): boolean {
  return Boolean(
    params.minPrice ||
      params.maxPrice ||
      params.condition ||
      params.brand.length ||
      params.location ||
      params.freeShipping ||
      params.inStock,
  );
}
