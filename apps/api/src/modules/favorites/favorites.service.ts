import { Injectable, NotFoundException } from "@nestjs/common";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { favorites, products } from "../../db/schema";
import { activeProductCardSelection } from "../../db/queries/products";
import { toProductSummary } from "../../db/mappers";
import type { ProductSummary } from "@trato/shared";

@Injectable()
export class FavoritesService {
  constructor(private readonly db: DbService) {}

  async list(userId: string): Promise<ProductSummary[]> {
    const favoriteRows = await this.db.db
      .select({ productId: favorites.productId })
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    const ids = favoriteRows.map((row) => row.productId);
    if (!ids.length) return [];
    const rows = await activeProductCardSelection(this.db.db).where(
      and(inArray(products.id, ids), eq(products.status, "active")),
    );
    const byId = new Map(rows.map((row) => [row.product.id, row]));
    return ids
      .map((id) => byId.get(id))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map(toProductSummary);
  }

  async add(userId: string, productId: string): Promise<{ productId: string; added: boolean }> {
    const [product] = await this.db.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }
    const inserted = await this.db.db
      .insert(favorites)
      .values({ userId, productId })
      .onConflictDoNothing()
      .returning({ id: favorites.id });
    await this.recalculate(productId);
    await this.db.sync();
    return { productId, added: inserted.length > 0 };
  }

  async remove(userId: string, productId: string): Promise<{ productId: string; removed: boolean }> {
    const removed = await this.db.db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
      .returning({ id: favorites.id });
    await this.recalculate(productId);
    await this.db.sync();
    return { productId, removed: removed.length > 0 };
  }

  async sync(userId: string, productIds: string[]): Promise<{ added: number }> {
    const unique = Array.from(new Set(productIds));
    if (!unique.length) {
      return { added: 0 };
    }
    const inserted = await this.db.db
      .insert(favorites)
      .values(unique.map((productId) => ({ userId, productId })))
      .onConflictDoNothing()
      .returning({ id: favorites.id });
    for (const productId of unique) {
      await this.recalculate(productId);
    }
    await this.db.sync();
    return { added: inserted.length };
  }

  private async recalculate(productId: string): Promise<void> {
    const [row] = await this.db.db
      .select({ value: count() })
      .from(favorites)
      .where(eq(favorites.productId, productId));
    await this.db.db
      .update(products)
      .set({ favoriteCount: Number(row?.value ?? 0) })
      .where(eq(products.id, productId));
  }
}
