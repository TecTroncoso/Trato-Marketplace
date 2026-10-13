import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, gt, isNotNull } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { products } from "../../db/schema";
import { productSelection } from "../../db/queries/products";
import { toProductSummary } from "../../db/mappers";
import { CategoriesService } from "../categories/categories.service";
import type { Banner, HomePayload, ProductSummary } from "@trato/shared";

const HOME_BANNERS: Banner[] = [
  {
    id: "banner-tecnologia",
    eyebrow: "Tecnología que te acompaña",
    title: "Llevá tu mundo siempre con vos",
    subtitle: "Celulares, notebooks, auriculares y más. Las mejores marcas, en un solo lugar.",
    cta: "Ver ofertas",
    href: "/buscar?sort=sold_desc",
    theme: "yellow",
  },
  {
    id: "banner-cuotas",
    eyebrow: "Banco Trato",
    title: "12 cuotas sin interés",
    subtitle: "Todos los lunes en electrónica y tecnología",
    cta: "Ver productos",
    href: "/categorias/celulares",
    theme: "blue",
  },
  {
    id: "banner-vender",
    eyebrow: "Sumate a Trato",
    title: "Publicá y empezá a vender hoy",
    subtitle: "Miles de compradores te están esperando",
    cta: "Quiero vender",
    href: "/vender",
    theme: "green",
  },
];

@Injectable()
export class HomeService {
  constructor(
    private readonly db: DbService,
    private readonly categories: CategoriesService,
  ) {}

  async payload(): Promise<HomePayload> {
    const database = this.db.db;
    const [categories, rawDeals, bestSellers, topRated, newest, featured, productCount, activeSellers] =
      await Promise.all([
        this.categories.tree(),
        productSelection(database)
          .where(and(eq(products.status, "active"), isNotNull(products.originalPrice)))
          .orderBy(desc(products.soldQuantity))
          .limit(40),
        productSelection(database)
          .where(eq(products.status, "active"))
          .orderBy(desc(products.soldQuantity))
          .limit(14),
        productSelection(database)
          .where(and(eq(products.status, "active"), gt(products.reviewsCount, 0)))
          .orderBy(desc(products.rating), desc(products.reviewsCount))
          .limit(14),
        productSelection(database)
          .where(eq(products.status, "active"))
          .orderBy(desc(products.createdAt))
          .limit(14),
        productSelection(database)
          .where(and(eq(products.status, "active"), eq(products.featured, true)))
          .limit(14),
        database.select({ value: count() }).from(products).where(eq(products.status, "active")),
        database.selectDistinct({ sellerId: products.sellerId }).from(products).where(eq(products.status, "active")),
      ]);

    const deals: ProductSummary[] = rawDeals
      .map((row) => ({
        product: toProductSummary(row),
        saving: (row.product.originalPrice ?? 0) - row.product.price,
      }))
      .sort((a, b) => b.saving - a.saving)
      .slice(0, 14)
      .map((entry) => entry.product);

    const bestSellerList = bestSellers.map(toProductSummary);
    const featuredList = featured.length ? featured.map(toProductSummary) : bestSellerList;

    return {
      banners: HOME_BANNERS,
      categories,
      deals,
      bestSellers: bestSellerList,
      topRated: topRated.map(toProductSummary),
      newest: newest.map(toProductSummary),
      featured: featuredList,
      stats: {
        products: Number(productCount[0]?.value ?? 0),
        sellers: activeSellers.length,
        categories: categories.length,
      },
    };
  }
}
