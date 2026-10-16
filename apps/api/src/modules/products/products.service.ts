import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, ne, or, sql } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { categories, products, users } from "../../db/schema";
import { productSelection } from "../../db/queries/products";
import { toProductDetail, toProductSummary, type JoinedProductRow } from "../../db/mappers";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { slugify } from "../../common/slugify";
import type { ProductDetail, ProductSummary } from "@trato/shared";

@Injectable()
export class ProductsService {
  constructor(private readonly db: DbService) {}

  async findByParam(param: string): Promise<ProductDetail> {
    const [row] = await productSelection(this.db.db)
      .where(or(eq(products.slug, param), eq(products.id, param)))
      .limit(1);
    if (!row) {
      throw new NotFoundException("El producto no existe o fue pausado");
    }
    return toProductDetail(row);
  }

  async create(userId: string, dto: CreateProductDto): Promise<ProductDetail> {
    const [category] = await this.db.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, dto.categorySlug))
      .limit(1);
    if (!category) {
      throw new BadRequestException("La categoría seleccionada no existe");
    }
    const [user] = await this.db.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new ForbiddenException("Necesitás iniciar sesión para publicar");
    }
    if (!user.sellerName) {
      await this.db.db.update(users).set({ sellerName: user.name }).where(eq(users.id, userId));
    }

    const slug = await this.uniqueSlug(slugify(dto.title));
    const [created] = await this.db.db
      .insert(products)
      .values({
        title: dto.title.trim(),
        slug,
        description: dto.description.trim(),
        price: dto.price,
        originalPrice: dto.originalPrice ?? null,
        condition: dto.condition,
        stock: dto.stock,
        brand: dto.brand?.trim() || null,
        freeShipping: dto.freeShipping ?? true,
        images: dto.images?.length ? dto.images : this.placeholderImages(slug),
        attributes: dto.attributes ?? {},
        categoryId: category.id,
        sellerId: userId,
        status: "active",
      })
      .returning({ id: products.id });

    const row = await this.findRow(created.id);
    return toProductDetail(row);
  }

  async update(userId: string, productId: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const [product] = await this.db.db
      .select({ id: products.id, sellerId: products.sellerId })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }
    if (product.sellerId !== userId) {
      throw new ForbiddenException("Solo el vendedor puede editar esta publicación");
    }

    let categoryId: string | undefined;
    const withCategory = dto as UpdateProductDto & { categorySlug?: string };
    if (withCategory.categorySlug) {
      const [category] = await this.db.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, withCategory.categorySlug))
        .limit(1);
      if (category) categoryId = category.id;
    }

    await this.db.db
      .update(products)
      .set({
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.originalPrice !== undefined ? { originalPrice: dto.originalPrice } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.condition !== undefined ? { condition: dto.condition } : {}),
        ...(dto.brand !== undefined ? { brand: dto.brand?.trim() || null } : {}),
        ...(dto.freeShipping !== undefined ? { freeShipping: dto.freeShipping } : {}),
        ...(dto.attributes !== undefined ? { attributes: dto.attributes } : {}),
        ...(categoryId ? { categoryId } : {}),
      })
      .where(eq(products.id, productId));

    const row = await this.findRow(productId);
    return toProductDetail(row);
  }

  async pause(userId: string, productId: string): Promise<{ id: string; status: string }> {
    const [product] = await this.db.db
      .select({ id: products.id, sellerId: products.sellerId, status: products.status })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }
    if (product.sellerId !== userId) {
      throw new ForbiddenException("Solo el vendedor puede pausar esta publicación");
    }
    const status = product.status === "active" ? "paused" : "active";
    await this.db.db.update(products).set({ status }).where(eq(products.id, productId));
    await this.db.db.update(products).set({ status }).where(eq(products.id, productId));
    await this.db.sync();
    return { id: productId, status };
  }

  async mine(userId: string): Promise<(ProductSummary & { status: string; createdAt: string })[]> {
    const rows = await productSelection(this.db.db)
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));
    return rows.map((row) => ({
      ...toProductSummary(row),
      status: row.product.status,
      createdAt: row.product.createdAt.toISOString(),
    }));
  }

  async bySeller(sellerId: string, limit = 8): Promise<ProductSummary[]> {
    const rows = await productSelection(this.db.db)
      .where(and(eq(products.sellerId, sellerId), eq(products.status, "active")))
      .orderBy(desc(products.soldQuantity))
      .limit(limit);
    return rows.map(toProductSummary);
  }

  async related(productId: string, categoryId: string, sellerId: string, limit = 8): Promise<ProductSummary[]> {
    const rows = await productSelection(this.db.db)
      .where(
        and(
          eq(products.status, "active"),
          ne(products.id, productId),
          or(eq(products.categoryId, categoryId), eq(products.sellerId, sellerId)),
        ),
      )
      .orderBy(desc(products.soldQuantity))
      .limit(limit);
    return rows.map(toProductSummary);
  }

  async relatedFor(productId: string): Promise<ProductSummary[]> {
    const [product] = await this.db.db
      .select({ id: products.id, categoryId: products.categoryId, sellerId: products.sellerId })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }
    return this.related(product.id, product.categoryId, product.sellerId, 10);
  }

  async registerView(productIdOrSlug: string): Promise<{ id: string; views: number }> {
    const [product] = await this.db.db
      .select({ id: products.id, views: products.views })
      .from(products)
      .where(or(eq(products.id, productIdOrSlug), eq(products.slug, productIdOrSlug)))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }
    const [updated] = await this.db.db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, product.id))
      .returning({ id: products.id, views: products.views });
    return updated;
  }

  private async findRow(productId: string): Promise<JoinedProductRow> {
    const [row] = await productSelection(this.db.db).where(eq(products.id, productId)).limit(1);
    if (!row) {
      throw new NotFoundException("El producto no existe");
    }
    return row;
  }

  private async uniqueSlug(base: string): Promise<string> {
    const candidate = base || "publicacion";
    const [existing] = await this.db.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    return `${candidate}-${Math.random().toString(36).slice(2, 7)}`;
  }

  private placeholderImages(slug: string): string[] {
    return [`/products/${slug}-1.svg`, `/products/${slug}-2.svg`, `/products/${slug}-3.svg`];
  }
}
