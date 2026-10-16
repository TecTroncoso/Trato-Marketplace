import { Injectable } from "@nestjs/common";
import { and, eq, gt, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { CategoriesService } from "../categories/categories.service";
import { TtlCache } from "../../common/ttl-cache";
import { products, users } from "../../db/schema";
import { productCardSelection, productSelection } from "../../db/queries/products";
import { categoryChain, toProductSummary, type JoinedProductRow, type SummaryRow } from "../../db/mappers";
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

const SEARCH_SYNONYMS: Record<string, string[]> = {
  notebook: ["laptop", "laptops", "computadora"],
  laptop: ["notebook", "notebooks", "computadora"],
  computadora: ["laptop", "notebook"],
  televisor: ["tv", "television", "smart"],
  television: ["tv", "televisor"],
  tv: ["televisor", "television", "smart"],
  celular: ["smartphone", "telefono", "movil", "celulares"],
  celulares: ["smartphone", "celular"],
  smartphone: ["celular", "celulares", "telefono"],
  telefono: ["celular", "smartphone", "celulares"],
  zapatillas: ["calzado", "zapatos", "tenis", "sneakers"],
  sneakers: ["zapatillas", "calzado"],
  zapatos: ["zapatillas", "calzado"],
  auriculares: ["cascos", "headphones", "audifonos", "auricular"],
  auricular: ["auriculares", "cascos"],
  cascos: ["parlante", "altavoz", "headphones"],
  parlante: ["bocina", "altavoz", "parlantes", "speaker"],
  parlantes: ["parlante", "bocina", "altavoz"],
  heladera: ["refrigerador", "nevera", "frigorifico", "refri"],
  refrigerador: ["heladera", "nevera"],
  lavarropas: ["lavadora"],
  lavadora: ["lavarropas"],
  bicicleta: ["bici", "bike"],
  bici: ["bicicleta"],
  bocina: ["parlante", "altavoz"],
  altavoz: ["parlante", "bocina"],
  campera: ["chaqueta", "abrigo"],
  chaqueta: ["campera", "abrigo"],
  abrigo: ["campera", "chaqueta"],
  buzo: ["sudadera", "hoodie"],
  sudadera: ["buzo", "hoodie"],
  mochila: ["mochilas", "backpack", "bolso"],
  mochilas: ["mochila"],
  silla: ["butaca", "sillon", "sofa"],
  gym: ["fitness", "gimnasio", "ejercicio"],
  fitness: ["gym", "gimnasio", "ejercicio"],
  camara: ["fotografica", "foto", "fotografia"],
  camaras: ["camara", "fotografica"],
  consola: ["ps5", "xbox", "switch", "playstation"],
};

export function buildFtsMatch(query: string): string {
  const groups = tokenize(query).map((token) => [token, ...(SEARCH_SYNONYMS[token] ?? [])]);
  return groups
    .map((group) => {
      const terms = group.map((token) => `"${token.replace(/"/g, "")}"*`).join(" OR ");
      return group.length > 1 ? `( ${terms} )` : terms;
    })
    .filter(Boolean)
    .join(" AND ");
}

@Injectable()
export class SearchService {
  private ftsReady: Promise<boolean> | null = null;
  private readonly suggestCache = new TtlCache(30_000, 300);

  constructor(
    private readonly db: DbService,
    private readonly categories: CategoriesService,
  ) {}

  async search(dto: SearchQueryDto): Promise<SearchResult> {
    const started = Date.now();
    return this.searchLocally(dto, dto.page ?? 1, dto.perPage ?? 24, started);
  }

  async isFtsEnabled(): Promise<boolean> {
    return this.ftsAvailable();
  }

  async suggest(query: string): Promise<string[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const cacheKey = `suggest:${normalize(trimmed)}`;
    const cached = this.suggestCache.get<string[]>(cacheKey);
    if (cached) return cached;
    const ftsMatch = buildFtsMatch(trimmed);
    if (ftsMatch && (await this.ftsAvailable())) {
      try {
        const response = await this.db.client.execute({
          sql: `select distinct title from products_fts where products_fts match ? limit 8`,
          args: [ftsMatch],
        });
        const titles = Array.from(new Set(response.rows.map((row) => String(row.title))));
        if (titles.length) {
          return this.suggestCache.set(cacheKey, titles.slice(0, 6), 30_000);
        }
      } catch {
        void 0;
      }
    }
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
    return this.suggestCache.set(cacheKey, Array.from(new Set(rows.map((row) => row.title))).slice(0, 6), 30_000);
  }

  private async ftsAvailable(): Promise<boolean> {
    if (!this.ftsReady) {
      this.ftsReady = this.db.client
        .execute("select product_id from products_fts limit 0")
        .then(() => true)
        .catch(() => false);
    }
    return this.ftsReady;
  }

  private async candidatesFromFts(query: string, condition: SQL | undefined): Promise<JoinedProductRow[] | null> {
    const match = buildFtsMatch(query);
    if (!match) return null;
    if (!(await this.ftsAvailable())) return null;
    try {
      const idRows = await this.db.client.execute({
        sql: `select product_id from products_fts where products_fts match ? limit 600`,
        args: [match],
      });
      const ids = idRows.rows.map((row) => String(row.product_id)).filter(Boolean);
      if (!ids.length) return [];
      return productSelection(this.db.db).where(and(condition, inArray(products.id, ids)));
    } catch {
      return null;
    }
  }

  private async searchLocally(
    dto: SearchQueryDto,
    page: number,
    perPage: number,
    started: number,
  ): Promise<SearchResult> {
    const condition = await this.buildLocalWhere(dto);
    const query = dto.q?.trim() ?? "";
    const ftsPool = query ? await this.candidatesFromFts(query, condition) : null;

    if (!query) {
      const cardRows = await productCardSelection(this.db.db).where(condition).limit(600);
      const sorted = cardRows
        .map((row) => ({ row, score: 1 }))
        .sort((a, b) => this.compareEntries(a, b, (dto.sort ?? "relevance") as SortValue))
        .map((entry) => entry.row);
      const start = (page - 1) * perPage;
      return {
        hits: sorted.slice(start, start + perPage).map((row) => toProductSummary(row)),
        total: sorted.length,
        page,
        perPage,
        totalPages: Math.max(1, Math.ceil(sorted.length / perPage)),
        facets: this.buildLocalFacets(sorted),
        tookMs: Date.now() - started,
      };
    }

    const rows = ftsPool && ftsPool.length ? ftsPool : await productSelection(this.db.db).where(condition).limit(600);
    const scored = rows
      .map((row) => ({ row, score: this.scoreProduct(row, query) }))
      .filter((entry) => (query ? entry.score > 0 : true));
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
    a: { row: JoinedProductRow | SummaryRow; score: number },
    b: { row: JoinedProductRow | SummaryRow; score: number },
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

  private scoreProduct(row: JoinedProductRow | SummaryRow, query: string): number {
    const tokens = tokenize(query);
    if (!tokens.length) return 1;
    const { product } = row;
    const title = normalize(product.title);
    const words = title.split(/[^a-z0-9]+/).filter(Boolean);
    const brand = normalize(product.brand ?? "");
    const categoryName = normalize(categoryChain(row).map((category) => category.name).join(" "));
    const description = normalize(product.description ?? "");
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const variants = [token, ...(SEARCH_SYNONYMS[token] ?? [])];
      let tokenScore = 0;
      for (const variant of variants) {
        const isOriginal = variant === token;
        let variantScore = 0;
        if (title.includes(variant)) variantScore = isOriginal ? 12 : 9;
        else if (words.some((word) => word.startsWith(variant))) variantScore = isOriginal ? 8 : 6;
        else if (words.some((word) => levenshtein(word, variant) <= tolerance(variant))) variantScore = 6;
        else if (categoryName.includes(variant)) variantScore = isOriginal ? 7 : 5;
        else if (brand.includes(variant)) variantScore = isOriginal ? 5 : 4;
        else if (brand.length > 0 && levenshtein(brand, variant) <= tolerance(variant)) variantScore = 4;
        else if (description.includes(variant)) variantScore = 2;
        if (variantScore > tokenScore) tokenScore = variantScore;
      }
      if (tokenScore === 0) matchedAll = false;
      score += tokenScore;
    }
    if (!matchedAll) score -= 6;
    score += Math.min(product.soldQuantity, 3000) / 1500;
    score += product.rating / 2;
    if (product.freeShipping) score += 0.3;
    return score;
  }

  private buildLocalFacets(rows: (JoinedProductRow | SummaryRow)[]): SearchFacets {
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
