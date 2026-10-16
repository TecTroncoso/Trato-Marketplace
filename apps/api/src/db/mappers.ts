import type { Category as SharedCategory, Installment, ProductDetail, ProductSummary, SellerSummary } from "@trato/shared";
import type { CategoryRow, ProductRowBase, UserRow } from "./schema";

export interface JoinedProductRow {
  product: ProductRowBase;
  seller: UserRow;
  category: CategoryRow;
  parent: CategoryRow | null;
  grandparent: CategoryRow | null;
}

export interface SummaryCategoryRow {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface SummaryProductRow {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number | null;
  condition: string;
  stock: number;
  soldQuantity: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  brand: string | null;
  freeShipping: boolean;
  categoryId: string;
  sellerId: string;
  status: string;
  createdAt: Date;
  description?: string;
}

export interface SummaryRow {
  product: SummaryProductRow;
  seller: UserRow;
  category: SummaryCategoryRow;
  parent: SummaryCategoryRow | null;
  grandparent: SummaryCategoryRow | null;
}

export function discountPct(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round((1 - price / originalPrice) * 100);
}

export function installmentFor(price: number): Installment {
  const quantity = price >= 100000 ? 12 : price >= 25000 ? 6 : 3;
  return { quantity, amount: Math.ceil(price / quantity), interestFree: true };
}

export function mapSeller(user: UserRow): SellerSummary {
  return {
    id: user.id,
    name: user.sellerName ?? user.name,
    status: user.sellerStatus,
    sales: user.sellerSales,
    rating: user.sellerRating,
    location: user.location,
    memberSince: user.memberSince,
    avatar: user.avatar,
  };
}

export function categoryChain(row: SummaryRow): CategoryRow[] {
  return [row.grandparent, row.parent, row.category].filter((category): category is CategoryRow => Boolean(category));
}

export function mapCategoryFlat(category: CategoryRow): SharedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    icon: category.icon,
    level: category.level,
    parentId: category.parentId,
  };
}

export function toProductSummary(row: SummaryRow): ProductSummary {
  const { product, seller } = row;
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    discount: discountPct(product.price, product.originalPrice),
    condition: product.condition,
    freeShipping: product.freeShipping,
    stock: product.stock,
    soldQuantity: product.soldQuantity,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    images: product.images,
    brand: product.brand,
    location: seller.location,
    categoryId: product.categoryId,
    categorySlug: row.category.slug,
    categoryPath: categoryChain(row).map((category) => category.slug),
    installments: installmentFor(product.price),
    seller: mapSeller(seller),
  };
}

export function toProductDetail(row: JoinedProductRow): ProductDetail {
  return {
    ...toProductSummary(row),
    description: row.product.description,
    attributes: row.product.attributes,
    views: row.product.views,
    createdAt: row.product.createdAt.toISOString(),
    favoriteCount: row.product.favoriteCount,
  };
}
