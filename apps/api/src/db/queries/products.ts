import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { categories, products, users } from "../schema";
import type { schema } from "../schema";

export type Database = LibSQLDatabase<typeof schema>;

const parentCategory = alias(categories, "parent_category");
const grandparentCategory = alias(categories, "grandparent_category");

export function productSelection(db: Database) {
  return db
    .select({
      product: products,
      seller: users,
      category: categories,
      parent: parentCategory,
      grandparent: grandparentCategory,
    })
    .from(products)
    .innerJoin(users, eq(products.sellerId, users.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
    .leftJoin(grandparentCategory, eq(parentCategory.parentId, grandparentCategory.id));
}

export function activeProductSelection(db: Database) {
  return productSelection(db).where(eq(products.status, "active"));
}
