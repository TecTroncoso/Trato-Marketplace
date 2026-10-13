import type { JoinedProductRow } from "../../db/mappers";
import { categoryChain, discountPct } from "../../db/mappers";

export interface ProductDocument {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  condition: string;
  brand: string | null;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  categoryPath: string[];
  sellerId: string;
  sellerName: string;
  sellerStatus: string | null;
  sellerSales: number;
  sellerRating: number;
  location: string | null;
  freeShipping: boolean;
  stock: number;
  soldQuantity: number;
  rating: number;
  reviewsCount: number;
  favoriteCount: number;
  images: string[];
  createdAt: number;
}

export const FILTERABLE_ATTRIBUTES = [
  "categoryPath",
  "categorySlug",
  "condition",
  "brand",
  "location",
  "freeShipping",
  "price",
  "sellerId",
  "discount",
];

export const SORTABLE_ATTRIBUTES = ["price", "soldQuantity", "rating", "createdAt", "discount"];

export const SEARCHABLE_ATTRIBUTES = ["title", "brand", "description", "categoryName", "sellerName"];

export const FACET_ATTRIBUTES = ["brand", "condition", "location"];

export const RANKING_RULES = [
  "words",
  "typo",
  "proximity",
  "attributeRank",
  "sort",
  "wordPosition",
  "exactness",
  "soldQuantity:desc",
  "rating:desc",
];

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  notebook: ["laptop", "laptops", "computadora"],
  laptops: ["notebook", "notebooks", "computadora"],
  celular: ["smartphone", "telefono", "movil"],
  celulares: ["smartphone", "telefonos", "moviles"],
  zapatillas: ["calzado", "zapatos", "tenis"],
  heladera: ["refrigerador", "refri", "nevera"],
  lavarropas: ["lavadora"],
  "aire acondicionado": ["split", "climatizador"],
  tv: ["televisor", "television", "smart tv"],
  auriculares: ["cascos", "headphones"],
  parlante: ["bocina", "altavoz", "speaker"],
  campera: ["chaqueta", "abrigo"],
  buzo: ["sudadera", "hoodie"],
  mochila: ["backpack", "bolso"],
  bicicleta: ["bici", "bike"],
  silla: ["asiento", "butaca"],
};

export function buildProductDocument(row: JoinedProductRow): ProductDocument {
  const { product, seller } = row;
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    discount: discountPct(product.price, product.originalPrice),
    condition: product.condition,
    brand: product.brand,
    categoryId: product.categoryId,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    categoryPath: categoryChain(row).map((category) => category.slug),
    sellerId: product.sellerId,
    sellerName: seller.sellerName ?? seller.name,
    sellerStatus: seller.sellerStatus,
    sellerSales: seller.sellerSales,
    sellerRating: seller.sellerRating,
    location: seller.location,
    freeShipping: product.freeShipping,
    stock: product.stock,
    soldQuantity: product.soldQuantity,
    rating: product.rating,
    reviewsCount: product.reviewsCount,
    favoriteCount: product.favoriteCount,
    images: product.images,
    createdAt: product.createdAt.getTime(),
  };
}
