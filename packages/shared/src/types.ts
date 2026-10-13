export type ID = string;

export interface User {
  id: ID;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  createdAt: string;
  sellerName: string | null;
  sellerStatus: string | null;
  sellerSales: number;
  sellerRating: number;
  location: string | null;
  memberSince: number | null;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
  level: number;
  parentId: ID | null;
  children?: Category[];
}

export interface SellerSummary {
  id: ID;
  name: string;
  status: string | null;
  sales: number;
  rating: number;
  location: string | null;
  memberSince: number | null;
  avatar: string | null;
}

export interface Installment {
  quantity: number;
  amount: number;
  interestFree: boolean;
}

export interface ProductSummary {
  id: ID;
  slug: string;
  title: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  condition: string;
  freeShipping: boolean;
  stock: number;
  soldQuantity: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  brand: string | null;
  location: string | null;
  categoryId: ID;
  categorySlug: string;
  categoryPath: string[];
  installments: Installment | null;
  seller: SellerSummary;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  attributes: Record<string, string>;
  views: number;
  createdAt: string;
  favoriteCount: number;
}

export interface Review {
  id: ID;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  author: { name: string; avatar: string | null };
}

export interface ReviewSummary {
  average: number;
  total: number;
  histogram: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface Question {
  id: ID;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  author: { name: string; avatar: string | null } | null;
}

export interface FacetBucket {
  value: string;
  count: number;
}

export interface SearchFacets {
  brands: FacetBucket[];
  conditions: FacetBucket[];
  locations: FacetBucket[];
}

export interface SearchResult {
  hits: ProductSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: SearchFacets;
  engine: "meilisearch" | "local";
  tookMs: number;
}

export interface Address {
  id: ID;
  label: string;
  recipient: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  phone: string | null;
  isDefault: boolean;
}

export interface OrderItem {
  id: ID;
  productId: ID | null;
  title: string;
  price: number;
  quantity: number;
  image: string | null;
  sellerId: ID | null;
  sellerName: string;
  slug: string | null;
}

export interface Order {
  id: ID;
  code: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentLabel: string;
  shippingMethod: string;
  address: {
    recipient: string;
    street: string;
    city: string;
    province: string;
    zip: string;
    phone: string | null;
  };
  items: OrderItem[];
  createdAt: string;
  buyerName?: string;
}

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  theme: "yellow" | "blue" | "green";
}

export interface HomePayload {
  banners: Banner[];
  categories: Category[];
  deals: ProductSummary[];
  bestSellers: ProductSummary[];
  topRated: ProductSummary[];
  newest: ProductSummary[];
  featured: ProductSummary[];
  stats: { products: number; sellers: number; categories: number };
}

export interface CheckoutItemInput {
  productId: ID;
  quantity: number;
}

export interface CartLine {
  productId: ID;
  slug: string;
  title: string;
  price: number;
  image: string;
  sellerId: ID;
  sellerName: string;
  stock: number;
  quantity: number;
}
