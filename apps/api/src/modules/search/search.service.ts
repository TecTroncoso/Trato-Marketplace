import { Injectable } from "@nestjs/common";
import { and, eq, gt, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { CategoriesService } from "../categories/categories.service";
import { products, users } from "../../db/schema";
import { productSelection } from "../../db/queries/products";
import { toProductSummary, type JoinedProductRow } from "../../db/mappers";
import { SearchQueryDto } from "./dto/search.dto";
import type { FacetBucket, SearchFacets, SearchResult, SortValue } from "@trato/shared";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

function tolerance(token: string): number {
  if (token.length >= 7) return 2;
  if (token.length >= 4) return 1;
  return 0;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i += 1) {
    matrix[i] = [i];
    for (let j = 1; j <= a.length; j += 1) {
      matrix[i][j] = i === 0 ? j : 0;
    }
  }
  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[b.length][a.length];
}

function sanitizeLikeTerm(value: string): string {
  return value.replace(/[%_]/g, "").trim();
}

@Injectable()
export class SearchService {
  constructor(
    private readonly db: DbService,
    private readonly categories: CategoriesService,
  ) {}

  async search(dto: SearchQueryDto): Promise<SearchResult> {
    const started = Date.now();
    return this.searchLocally(dto, dto.page ?? 1, dto.perPage ?? 24, started);
  }

  async suggest(query: string): Promise<string[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const term = sanitizeLikeTerm(trimmed);
    if (!term) return [];
    const rows = await this.db.db
      .select({ title: products.title })
      .from(products)
      .where(
        and(
          eq(products.status, "active"),
          or(like(products.title, `%${term}%`), like(products.brand, `%${term}%`)),
        ),
      )
      .limit(6);
    return Array.from(new Set(rows.map((row) => row.title))).slice(0, 6);
  }

  private async searchLocally(
    dto: SearchQueryDto,
    page: number,
    perPage: number,
    started: number,
  ): Promise<SearchResult> {
    const condition = await this.buildLocalWhere(dto);
    const rows = await productSelection(this.db.db).where(condition).limit(600);
    const scored = rows
      .map((row) => ({ row, score: this.scoreProduct(row, dto.q ?? "") }))
      .filter((entry) => (dto.q?.trim() ? entry.score > 0 : true));
    scored.sort((a, b) => this.compareEntries(a, b, (dto.sort ?? "relevance") as SortValue));
    const total = scored.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const hits = scored.slice(start, start + perPage).map((entry) => toProductSummary(entry.row));
    return {
      hits,
      total,
      page,
      perPage,
      totalPages,
      facets: this.buildLocalFacets(scored.map((entry) => entry.row)),
      tookMs: Date.now() - started,
    };
  }

  private async buildLocalWhere(dto: SearchQueryDto): Promise<SQL | undefined> {
    const conditions: (SQL | undefined)[] = [eq(products.status, "active")];
    if (dto.category) {
      const ids = await this.categories.descendantIds(dto.category);
      conditions.push(ids && ids.length ? inArray(products.categoryId, ids) : sql`1 = 0`);
    }
    if (dto.minPrice != null) conditions.push(gte(products.price, dto.minPrice));
    if (dto.maxPrice != null) conditions.push(lte(products.price, dto.maxPrice));
    if (dto.condition) conditions.push(eq(products.condition, dto.condition));
    if (dto.freeShipping) conditions.push(eq(products.freeShipping, true));
    if (dto.inStock) conditions.push(gt(products.stock, 0));
    if (dto.brand?.length) conditions.push(inArray(products.brand, dto.brand));
    if (dto.location) conditions.push(eq(users.location, dto.location));
    return and(...conditions);
  }

  private compareEntries(
    a: { row: JoinedProductRow; score: number },
    b: { row: JoinedProductRow; score: number },
    sort: SortValue,
  ): number {
    switch (sort) {
      case "price_asc":
        return a.row.product.price - b.row.product.price;
      case "price_desc":
        return b.row.product.price - a.row.product.price;
      case "sold_desc":
        return b.row.product.soldQuantity - a.row.product.soldQuantity;
      case "rating_desc":
        return b.row.product.rating - a.row.product.rating;
      case "newest":
        return b.row.product.createdAt.getTime() - a.row.product.createdAt.getTime();
      default:
        return b.score - a.score;
    }
  }

  private scoreProduct(row: JoinedProductRow, query: string): number {
    const tokens = tokenize(query);
    if (!tokens.length) return 1;
    const { product } = row;
    const title = normalize(product.title);
    const words = title.split(/[^a-z0-9]+/).filter(Boolean);
    const brand = normalize(product.brand ?? "");
    const description = normalize(product.description);
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      let tokenScore = 0;
      if (title.includes(token)) tokenScore = 12;
      else if (words.some((word) => word.startsWith(token))) tokenScore = 8;
      else if (words.some((word) => levenshtein(word, token) <= tolerance(token))) tokenScore = 6;
      else if (brand.includes(token)) tokenScore = 5;
      else if (brand.length > 0 && levenshtein(brand, token) <= tolerance(token)) tokenScore = 4;
      else if (description.includes(token)) tokenScore = 2;
      if (tokenScore === 0) matchedAll = false;
      score += tokenScore;
    }
    if (!matchedAll) score -= 6;
    score += Math.min(product.soldQuantity, 3000) / 1500;
    score += product.rating / 2;
    if (product.freeShipping) score += 0.3;
    return score;
  }

  private buildLocalFacets(rows: JoinedProductRow[]): SearchFacets {
    const count = (values: (string | null)[]): FacetBucket[] => {
      const map = new Map<string, number>();
      for (const value of values) {
        if (!value) continue;
        map.set(value, (map.get(value) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .map(([value, total]) => ({ value, count: total }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);
    };
    return {
      brands: count(rows.map((row) => row.product.brand)),
      conditions: count(rows.map((row) => row.product.condition)),
      locations: count(rows.map((row) => row.seller.location)),
    };
  }
}
