import { Injectable, NotFoundException } from "@nestjs/common";
import { asc } from "drizzle-orm";
import { TtlCache } from "../../common/ttl-cache";
import { DbService } from "../../db/db.service";
import { categories, type CategoryRow } from "../../db/schema";
import { mapCategoryFlat } from "../../db/mappers";
import type { Category as SharedCategory } from "@trato/shared";

type CategoryNode = SharedCategory & { children: SharedCategory[] };

@Injectable()
export class CategoriesService {
  private readonly cache = new TtlCache(60_000);

  constructor(private readonly db: DbService) {}

  private allRows(): Promise<CategoryRow[]> {
    const cached = this.cache.get<CategoryRow[]>("all");
    if (cached) return Promise.resolve(cached);
    return this.db.db
      .select()
      .from(categories)
      .orderBy(asc(categories.level), asc(categories.order), asc(categories.name))
      .then((rows) => this.cache.set("all", rows, 60_000));
  }

  async tree(): Promise<SharedCategory[]> {
    const rows = await this.allRows();
    const nodes = new Map<string, CategoryNode>();
    for (const row of rows) {
      nodes.set(row.id, { ...mapCategoryFlat(row), children: [] });
    }
    const roots: CategoryNode[] = [];
    for (const row of rows) {
      const node = nodes.get(row.id) as CategoryNode;
      const parent = row.parentId ? nodes.get(row.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  async flat(): Promise<SharedCategory[]> {
    const rows = await this.allRows();
    return rows.map(mapCategoryFlat);
  }

  async findBySlug(slug: string) {
    const rows = await this.allRows();
    const byId = new Map(rows.map((row) => [row.id, row]));
    const category = rows.find((row) => row.slug === slug);
    if (!category) {
      throw new NotFoundException("La categoría no existe");
    }
    const parent = category.parentId ? byId.get(category.parentId) ?? null : null;
    const grandparent = parent?.parentId ? byId.get(parent.parentId) ?? null : null;
    const children = rows.filter((row) => row.parentId === category.id);
    return {
      ...category,
      children,
      parent: parent ? { ...parent, parent: grandparent } : null,
    };
  }

  async ancestors(slug: string): Promise<CategoryRow[]> {
    const rows = await this.allRows();
    const byId = new Map(rows.map((row) => [row.id, row]));
    let current: CategoryRow | undefined = rows.find((row) => row.slug === slug);
    if (!current) {
      throw new NotFoundException("La categoría no existe");
    }
    const chain: CategoryRow[] = [];
    const guard = new Set<string>();
    while (current && !guard.has(current.id)) {
      guard.add(current.id);
      chain.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
    return chain;
  }

  async descendantIds(slug: string): Promise<string[] | null> {
    const rows = await this.allRows();
    const category = rows.find((row) => row.slug === slug);
    if (!category) return null;
    return [category.id, ...rows.filter((row) => row.parentId === category.id).map((row) => row.id)];
  }
}
