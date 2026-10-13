import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { products, questions, users, type SafeUser } from "../../db/schema";

export interface QuestionPayload {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
  author: { name: string; avatar: string | null } | null;
}

@Injectable()
export class QuestionsService {
  constructor(private readonly db: DbService) {}

  async listForProduct(productId: string): Promise<QuestionPayload[]> {
    const rows = await this.db.db
      .select({ question: questions, author: users })
      .from(questions)
      .innerJoin(users, eq(questions.userId, users.id))
      .where(eq(questions.productId, productId))
      .orderBy(desc(questions.createdAt))
      .limit(60);
    return rows.map((row) => this.toPayload(row.question, row.author));
  }

  async ask(user: SafeUser, dto: { productId: string; question: string }): Promise<QuestionPayload> {
    const [product] = await this.db.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, dto.productId))
      .limit(1);
    if (!product) {
      throw new NotFoundException("El producto no existe");
    }
    const [created] = await this.db.db
      .insert(questions)
      .values({ productId: dto.productId, userId: user.id, question: dto.question.trim() })
      .returning();
    return this.toPayload(created, { name: user.name, avatar: user.avatar });
  }

  async answer(userId: string, questionId: string, answer: string): Promise<QuestionPayload> {
    const [row] = await this.db.db
      .select({ question: questions, sellerId: products.sellerId, author: users })
      .from(questions)
      .innerJoin(products, eq(questions.productId, products.id))
      .innerJoin(users, eq(questions.userId, users.id))
      .where(eq(questions.id, questionId))
      .limit(1);
    if (!row) {
      throw new NotFoundException("La pregunta no existe");
    }
    if (row.sellerId !== userId) {
      throw new ForbiddenException("Solo el vendedor puede responder esta pregunta");
    }
    const [updated] = await this.db.db
      .update(questions)
      .set({ answer: answer.trim(), answeredAt: new Date() })
      .where(eq(questions.id, questionId))
      .returning();
    return this.toPayload(updated, row.author);
  }

  private toPayload(
    question: typeof questions.$inferSelect,
    author: { name: string; avatar: string | null } | null,
  ): QuestionPayload {
    return {
      id: question.id,
      question: question.question,
      answer: question.answer,
      answeredAt: question.answeredAt?.toISOString() ?? null,
      createdAt: question.createdAt.toISOString(),
      author: author ? { name: author.name, avatar: author.avatar } : null,
    };
  }
}
