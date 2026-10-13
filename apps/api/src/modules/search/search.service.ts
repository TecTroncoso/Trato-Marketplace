import { Injectable, Logger } from "@nestjs/common";
import { and, eq, gt, gte, inArray, like, lte, or, sql, type SQL } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { CategoriesService } from "../categories/categories.service";
import { products, users } from "../../db/schema";
import { activeProductSelection, productSelection } from "../../db/queries/products";
import { installmentFor, toProductSummary, type JoinedProductRow } from "../../db/mappers";
import { ENV } from "../../config";
import { SearchQueryDto } from "./dto/search.dto";
import {
  FACET_ATTRIBUTES,
  FILTERABLE_ATTRIBUTES,
  ProductDocument,
  RANKING_RULES,
  SEARCHABLE_ATTRIBUTES,
  SEARCH_SYNONYMS,
  SORTABLE_ATTRIBUTES,
  buildProductDocument,
} from "./product-document";
import type { FacetBucket, SearchFacets, SearchResult, SortValue } from "@trato/shared";

export type SearchEngine = "meilisearch" | "local";

type MeilisearchModule = typeof import("meilisearch", { with: { "resolution-mode": "import" } });
type MeilisearchInstance = InstanceType<MeilisearchModule["Meilisearch"]>;

const SORT_MAP: Record<SortValue, string[]> = {
  relevance: [],
  price_asc: ["price:asc"],
  price_desc: ["price:desc"],
  sold_desc: ["soldQuantity:desc"],
  rating_desc: ["rating:desc"],
  newest: ["createdAt:desc"],
};

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

function escapeFilterValue(value: string): string {
  return value.replace(/["\\]/g, "");
}

function toBuckets(distribution: Record<string, number> | undefined, limit = 12): FacetBucket[] {
  if (!distribution) return [];
  return Object.entries(distribution)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function sanitizeLikeTerm(value: string): string {
  return value.replace(/[%_]/g, "").trim();
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger("SearchService");
  private readonly indexName = "products";
  private client: MeilisearchInstance | null = null;
  private clientLoading: Promise<void> | null = null;
  private currentEngine: SearchEngine = "local";
  private healthy = false;
  private lastHealthCheck = 0;

  constructor(
    private readonly db: DbService,
    private readonly categories: CategoriesService,
  ) {}

  get engine(): SearchEngine {
    return this.currentEngine;
  }

  private async ensureClient(): Promise<MeilisearchInstance | null> {
    if (this.client) return this.client;
    if (!ENV.meilisearchUrl) return null;
    if (!this.clientLoading) {
      this.clientLoading = (async () => {
        try {
          const { Meilisearch } = await import("meilisearch");
          this.client = new Meilisearch({
            host: ENV.meilisearchUrl,
            apiKey: ENV.meilisearchMasterKey || undefined,
          });
        } catch (error) {
          this.logger.warn(`No se pudo inicializar Meilisearch: ${(error as Error).message}`);
          this.client = null;
        }
      })();
    }
    await this.clientLoading;
    return this.client;
  }

  async configureIndex(): Promise<SearchEngine> {
    const client = await this.ensureClient();
    if (!client) return "local";
    try {
      const index = client.index(this.indexName);
      await index.updateFilterableAttributes(FILTERABLE_ATTRIBUTES);
      await index.updateSortableAttributes(SORTABLE_ATTRIBUTES);
      await index.updateSearchableAttributes(SEARCHABLE_ATTRIBUTES);
      await index.updateSynonyms(SEARCH_SYNONYMS);
      await index.updateRankingRules(RANKING_RULES);
      await client.health();
      this.healthy = true;
      this.currentEngine = "meilisearch";
      this.lastHealthCheck = Date.now();
      return "meilisearch";
    } catch (error) {
      this.logger.warn(
        `Meilisearch no disponible (${(error as Error).message}); se usa el buscador local tolerante a errores.`,
      );
      this.currentEngine = "local";
      return "local";
    }
  }

  async reindexAll(): Promise<{ indexed: number; engine: SearchEngine; message?: string }> {
    const client = await this.ensureClient();
    if (!client || !(await this.ping())) {
      return {
        indexed: 0,
        engine: "local",
        message: "Meilisearch no responde: la búsqueda sigue activa en modo local",
      };
    }
    const rows = await activeProductSelection(this.db.db);
    const documents = rows.map(buildProductDocument);
    const index = client.index(this.indexName);
    await index.deleteAllDocuments();
    for (let i = 0; i < documents.length; i += 200) {
      await index.addDocuments(documents.slice(i, i + 200), { primaryKey: "id" });
    }
    await this.configureIndex();
    this.logger.log(`Índice reconstruido con ${documents.length} documentos`);
    return { indexed: documents.length, engine: "meilisearch" };
  }

  async indexProduct(row: JoinedProductRow): Promise<void> {
    const client = await this.ensureClient();
    if (!client || !(await this.checkHealth())) return;
    try {
      await client.index(this.indexName).addDocuments([buildProductDocument(row)], { primaryKey: "id" });
    } catch (error) {
      this.logger.warn(`No se pudo indexar ${row.product.id}: ${(error as Error).message}`);
    }
  }

  async removeProduct(productId: string): Promise<void> {
    const client = await this.ensureClient();
    if (!client || !(await this.checkHealth())) return;
    try {
      await client.index(this.indexName).deleteDocument(productId);
    } catch (error) {
      this.logger.warn(`No se pudo eliminar ${productId} del índice: ${(error as Error).message}`);
    }
  }

  async search(dto: SearchQueryDto): Promise<SearchResult> {
    const started = Date.now();
    const page = dto.page ?? 1;
    const perPage = dto.perPage ?? 24;
    const client = await this.ensureClient();
    if (client && (await this.checkHealth())) {
      try {
        return await this.searchWithMeilisearch(client, dto, page, perPage, started);
      } catch (error) {
        this.logger.warn(`Fallo Meilisearch, usando buscador local: ${(error as Error).message}`);
        this.healthy = false;
        this.currentEngine = "local";
      }
    }
    return this.searchLocally(dto, page, perPage, started);
  }

  async suggest(query: string): Promise<string[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    const client = await this.ensureClient();
    if (client && (await this.checkHealth())) {
      try {
        const response = await client.index(this.indexName).search(trimmed, {
          limit: 6,
          attributesToRetrieve: ["title"],
        });
        const titles = (response.hits as unknown as ProductDocument[]).map((hit) => hit.title);
        return Array.from(new Set(titles)).slice(0, 6);
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
    return Array.from(new Set(rows.map((row) => row.title))).slice(0, 6);
  }

  private async ping(): Promise<boolean> {
    const client = await this.ensureClient();
    if (!client) return false;
    try {
      await client.health();
      return true;
    } catch {
      return false;
    }
  }

  private async checkHealth(): Promise<boolean> {
    const client = await this.ensureClient();
    if (!client) {
      this.currentEngine = "local";
      return false;
    }
    const now = Date.now();
    if (this.healthy && now - this.lastHealthCheck < 30_000) {
      return true;
    }
    try {
      await client.health();
      this.healthy = true;
      this.currentEngine = "meilisearch";
    } catch {
      this.healthy = false;
      this.currentEngine = "local";
    }
    this.lastHealthCheck = now;
    return this.healthy;
  }

  private async searchWithMeilisearch(
    client: MeilisearchInstance,
    dto: SearchQueryDto,
    page: number,
    perPage: number,
    started: number,
  ): Promise<SearchResult> {
    const index = client.index(this.indexName);
    const filters: string[] = [];
    if (dto.category) filters.push(`categoryPath = "${escapeFilterValue(dto.category)}"`);
    if (dto.minPrice != null) filters.push(`price >= ${dto.minPrice}`);
    if (dto.maxPrice != null) filters.push(`price <= ${dto.maxPrice}`);
    if (dto.condition) filters.push(`condition = "${escapeFilterValue(dto.condition)}"`);
    if (dto.freeShipping) filters.push("freeShipping = true");
    if (dto.location) filters.push(`location = "${escapeFilterValue(dto.location)}"`);
    if (dto.inStock) filters.push("stock > 0");
    if (dto.brand?.length) {
      filters.push(`brand IN [${dto.brand.map((brand) => `"${escapeFilterValue(brand)}"`).join(", ")}]`);
    }
    const sort = SORT_MAP[(dto.sort ?? "relevance") as SortValue];
    const response = await index.search(dto.q ?? "", {
      filter: filters.length ? filters : undefined,
      sort: sort.length ? sort : undefined,
      facets: FACET_ATTRIBUTES,
      page,
      hitsPerPage: perPage,
    });
    const documents = response.hits as unknown as ProductDocument[];
    const facets: SearchFacets = {
      brands: toBuckets(response.facetDistribution?.brand),
      conditions: toBuckets(response.facetDistribution?.condition),
      locations: toBuckets(response.facetDistribution?.location),
    };
    return {
      hits: documents.map((document) => this.documentToSummary(document)),
      total: response.totalHits ?? response.estimatedTotalHits ?? documents.length,
      page: response.page ?? page,
      perPage,
      totalPages: response.totalPages ?? 1,
      facets,
      engine: "meilisearch",
      tookMs: Date.now() - started,
    };
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
      engine: "local",
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

  private documentToSummary(document: ProductDocument) {
    return {
      id: document.id,
      slug: document.slug,
      title: document.title,
      price: document.price,
      originalPrice: document.originalPrice,
      discount: document.discount,
      condition: document.condition,
      freeShipping: document.freeShipping,
      stock: document.stock,
      soldQuantity: document.soldQuantity,
      rating: document.rating,
      reviewsCount: document.reviewsCount,
      images: document.images,
      brand: document.brand,
      location: document.location,
      categoryId: document.categoryId,
      categorySlug: document.categorySlug,
      categoryPath: document.categoryPath,
      installments: installmentFor(document.price),
      seller: {
        id: document.sellerId,
        name: document.sellerName,
        status: document.sellerStatus,
        sales: document.sellerSales,
        rating: document.sellerRating,
        location: document.location,
        memberSince: null,
        avatar: null,
      },
    };
  }
}
