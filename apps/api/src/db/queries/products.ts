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
    .leftJoin(grandparentCategory, eq(parentCategory.parentId, grandparentCategory.id))
    .$dynamic();
}

const productSummaryColumns = {
  id: products.id,
  slug: products.slug,
  title: products.title,
  price: products.price,
  originalPrice: products.originalPrice,
  condition: products.condition,
  stock: products.stock,
  soldQuantity: products.soldQuantity,
  rating: products.rating,
  reviewsCount: products.reviewsCount,
  images: products.images,
  brand: products.brand,
  freeShipping: products.freeShipping,
  categoryId: products.categoryId,
  sellerId: products.sellerId,
  status: products.status,
  createdAt: products.createdAt,
};

export function productCardSelection(db: Database) {
  return db
    .select({
      product: productSummaryColumns,
      seller: users,
      category: { id: categories.id, name: categories.name, slug: categories.slug, parentId: categories.parentId },
      parent: { id: parentCategory.id, name: parentCategory.name, slug: parentCategory.slug, parentId: parentCategory.parentId },
      grandparent: {
        id: grandparentCategory.id,
        name: grandparentCategory.name,
        slug: grandparentCategory.slug,
        parentId: grandparentCategory.parentId,
      },
    })
    .from(products)
    .innerJoin(users, eq(products.sellerId, users.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id))
    .leftJoin(grandparentCategory, eq(parentCategory.parentId, grandparentCategory.id))
    .$dynamic();
}

export function activeProductSelection(db: Database) {
  return productSelection(db).where(eq(products.status, "active"));
}

export function activeProductCardSelection(db: Database) {
  return productCardSelection(db).where(eq(products.status, "active"));
}
