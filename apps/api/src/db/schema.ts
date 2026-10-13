import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

const primaryId = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

export const users = sqliteTable(
  "users",
  {
    id: primaryId(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    avatar: text("avatar"),
    role: text("role").notNull().default("user"),
    sellerName: text("seller_name"),
    sellerStatus: text("seller_status"),
    sellerSales: integer("seller_sales").notNull().default(0),
    sellerRating: real("seller_rating").notNull().default(0),
    location: text("location"),
    memberSince: integer("member_since").default(2021),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const addresses = sqliteTable(
  "addresses",
  {
    id: primaryId(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    recipient: text("recipient").notNull(),
    street: text("street").notNull(),
    city: text("city").notNull(),
    province: text("province").notNull(),
    zip: text("zip").notNull(),
    phone: text("phone"),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [index("addresses_user_idx").on(table.userId)],
);

export const categories = sqliteTable(
  "categories",
  {
    id: primaryId(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    image: text("image"),
    icon: text("icon"),
    level: integer("level").notNull().default(1),
    order: integer("order").notNull().default(0),
    parentId: text("parent_id").references((): AnySQLiteColumn => categories.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
  ],
);

export const products = sqliteTable(
  "products",
  {
    id: primaryId(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    originalPrice: integer("original_price"),
    condition: text("condition").notNull().default("nuevo"),
    stock: integer("stock").notNull().default(0),
    soldQuantity: integer("sold_quantity").notNull().default(0),
    views: integer("views").notNull().default(0),
    brand: text("brand"),
    images: text("images", { mode: "json" }).$type<string[]>().notNull(),
    attributes: text("attributes", { mode: "json" }).$type<Record<string, string>>().notNull(),
    freeShipping: integer("free_shipping", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    status: text("status").notNull().default("active"),
    rating: real("rating").notNull().default(0),
    reviewsCount: integer("reviews_count").notNull().default(0),
    favoriteCount: integer("favorite_count").notNull().default(0),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_category_idx").on(table.categoryId),
    index("products_seller_idx").on(table.sellerId),
    index("products_status_idx").on(table.status),
    index("products_status_category_sold_idx").on(table.status, table.categoryId, table.soldQuantity),
    index("products_status_created_idx").on(table.status, table.createdAt),
    index("products_status_rating_idx").on(table.status, table.rating),
    index("products_status_price_idx").on(table.status, table.price),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: primaryId(),
    code: text("code").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("confirmado"),
    subtotal: integer("subtotal").notNull(),
    shippingCost: integer("shipping_cost").notNull().default(0),
    total: integer("total").notNull(),
    paymentMethod: text("payment_method").notNull(),
    shippingMethod: text("shipping_method").notNull().default("estandar"),
    addressSnapshot: text("address_snapshot", { mode: "json" }).$type<{
      recipient: string;
      street: string;
      city: string;
      province: string;
      zip: string;
      phone: string | null;
    }>().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("orders_code_unique").on(table.code),
    index("orders_user_idx").on(table.userId),
    index("orders_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: primaryId(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull(),
    image: text("image"),
    sellerId: text("seller_id"),
    sellerName: text("seller_name").notNull(),
    slug: text("slug"),
    createdAt: createdAt(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId), index("order_items_seller_idx").on(table.sellerId)],
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: primaryId(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    comment: text("comment").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("reviews_product_user_unique").on(table.productId, table.userId),
    index("reviews_product_idx").on(table.productId),
  ],
);

export const questions = sqliteTable(
  "questions",
  {
    id: primaryId(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    answeredAt: integer("answered_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("questions_product_idx").on(table.productId),
    index("questions_product_created_idx").on(table.productId, table.createdAt),
  ],
);

export const favorites = sqliteTable(
  "favorites",
  {
    id: primaryId(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("favorites_user_product_unique").on(table.userId, table.productId),
    index("favorites_user_idx").on(table.userId),
    index("favorites_product_idx").on(table.productId),
  ],
);

export const schema = {
  users,
  addresses,
  categories,
  products,
  orders,
  orderItems,
  reviews,
  questions,
  favorites,
};

export type UserRow = typeof users.$inferSelect;
export type AddressRow = typeof addresses.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type ProductRowBase = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
export type FavoriteRow = typeof favorites.$inferSelect;

export type SafeUser = Omit<UserRow, "password">;
