import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { avg, count, desc, eq } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { products, reviews, users, type SafeUser } from "../../db/schema";

export interface ReviewPayload {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  createdAt: string;
  author: { name: string; avatar: string | null };
}

export interface ReviewsPayload {
  summary: { average: number; total: number; histogram: Record<"1" | "2" | "3" | "4" | "5", number> };
  reviews: ReviewPayload[];
}

const EMPTY_HISTOGRAM: Record<"1" | "2" | "3" | "4" | "5", number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

@Injectable()
export class ReviewsService {
  constructor(private readonly db: DbService) {}

  async listForProduct(productId: string): Promise<ReviewsPayload> {
    const rows = await this.db.db
      .select({ review: reviews, author: users })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt))
      .limit(100);

    const histogram = { ...EMPTY_HISTOGRAM };
    let totalScore = 0;
    for (const row of rows) {
      const clamped = Math.min(5, Math.max(1, Math.round(row.review.rating)));
      histogram[String(clamped) as "1" | "2" | "3" | "4" | "5"] += 1;
      totalScore += row.review.rating;
    }
    const average = rows.length ? Math.round((totalScore / rows.length) * 10) / 10 : 0;
    return {
      summary: { average, total: rows.length, histogram },
      reviews: rows.map((row) => ({
        id: row.review.id,
        rating: row.review.rating,
        title: row.review.title,
        comment: row.review.comment,
        createdAt: row.review.createdAt.toISOString(),
        author: { name: row.author.name, avatar: row.author.avatar },
      })),
    };
  }

  async create(
    user: SafeUser,
    dto: { productId: string; rating: number; title?: string; comment: string },
  ): Promise<ReviewPayload> {
    const rating = Math.round(dto.rating);
    if (rating < 1 || rating > 5) {
      throw new BadRequestException("La calificación debe ser entre 1 y 5 estrellas");
    }
    const [product] = await this.db.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, dto.productId))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }

    const [review] = await this.db.db
      .insert(reviews)
      .values({
        productId: dto.productId,
        userId: user.id,
        rating,
        title: dto.title?.trim() || null,
        comment: dto.comment.trim(),
      })
      .onConflictDoUpdate({
        target: [reviews.productId, reviews.userId],
        set: { rating, title: dto.title?.trim() || null, comment: dto.comment.trim() },
      })
      .returning();

    await this.recalculate(dto.productId);

    return {
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      author: { name: user.name, avatar: user.avatar },
    };
  }

  private async recalculate(productId: string): Promise<void> {
    const [aggregate] = await this.db.db
      .select({ average: avg(reviews.rating), total: count() })
      .from(reviews)
      .where(eq(reviews.productId, productId));
    const average = aggregate?.average ? Number(aggregate.average) : 0;
    await this.db.db
      .update(products)
      .set({ rating: Math.round(average * 10) / 10, reviewsCount: Number(aggregate?.total ?? 0) })
      .where(eq(products.id, productId));
  }
}
