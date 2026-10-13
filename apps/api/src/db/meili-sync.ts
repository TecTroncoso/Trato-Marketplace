import {
  buildProductDocument,
  FILTERABLE_ATTRIBUTES,
  RANKING_RULES,
  SEARCHABLE_ATTRIBUTES,
  SEARCH_SYNONYMS,
  SORTABLE_ATTRIBUTES,
} from "../modules/search/product-document";
import type { JoinedProductRow } from "./mappers";

export type MeilisearchInstance = InstanceType<
  typeof import("meilisearch", { with: { "resolution-mode": "import" } }).Meilisearch
>;

export const SEARCH_INDEX = "products";

export async function createMeiliClient(): Promise<MeilisearchInstance | null> {
  const host = process.env.MEILISEARCH_URL?.trim();
  if (!host) return null;
  const { Meilisearch } = await import("meilisearch");
  return new Meilisearch({ host, apiKey: process.env.MEILISEARCH_MASTER_KEY?.trim() || undefined });
}

export async function pingMeilisearch(client: MeilisearchInstance): Promise<boolean> {
  try {
    await client.health();
    return true;
  } catch {
    return false;
  }
}

export async function syncMeilisearch(client: MeilisearchInstance, rows: JoinedProductRow[]): Promise<number> {
  const index = client.index(SEARCH_INDEX);
  const documents = rows.map(buildProductDocument);
  await index.deleteAllDocuments();
  for (let i = 0; i < documents.length; i += 200) {
    await index.addDocuments(documents.slice(i, i + 200), { primaryKey: "id" });
  }
  await index.updateFilterableAttributes(FILTERABLE_ATTRIBUTES);
  await index.updateSortableAttributes(SORTABLE_ATTRIBUTES);
  await index.updateSearchableAttributes(SEARCHABLE_ATTRIBUTES);
  await index.updateSynonyms(SEARCH_SYNONYMS);
  await index.updateRankingRules(RANKING_RULES);
  return documents.length;
}
