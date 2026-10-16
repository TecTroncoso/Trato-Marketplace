import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { DbService } from "../../db/db.service";
import { orderItems, orders, products, users } from "../../db/schema";
import { productCardSelection } from "../../db/queries/products";
import { CheckoutDto, UpdateOrderStatusDto } from "./dto/order.dto";
import type { OrderItemRow, OrderRow } from "../../db/schema";
import type { Order as SharedOrder, OrderItem as SharedOrderItem } from "@trato/shared";

const PAYMENT_LABELS: Record<string, string> = {
  tarjeta_credito: "Tarjeta de crédito",
  tarjeta_debito: "Tarjeta de débito",
  efectivo: "Efectivo en punto de pago",
  transferencia: "Transferencia bancaria",
};

@Injectable()
export class OrdersService {
  constructor(private readonly db: DbService) {}

  async checkout(userId: string, dto: CheckoutDto): Promise<SharedOrder> {
    const items = dto.items ?? [];
    if (!items.length) {
      throw new BadRequestException("El carrito está vacío");
    }
    const productIds = Array.from(new Set(items.map((item) => item.productId)));
    const rows = await productCardSelection(this.db.db).where(inArray(products.id, productIds));
    const byId = new Map(rows.map((row) => [row.product.id, row]));

    let subtotal = 0;
    const lines: (Omit<OrderItemRow, "id" | "orderId" | "createdAt">)[] = [];
    for (const item of items) {
      const row = byId.get(item.productId);
      if (!row || row.product.status !== "active") {
        throw new BadRequestException("Uno de los productos ya no está disponible");
      }
      const product = row.product;
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Solo quedan ${product.stock} unidades de "${product.title}"`);
      }
      subtotal += product.price * item.quantity;
      lines.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] ?? null,
        sellerId: product.sellerId,
        sellerName: row.seller.sellerName ?? row.seller.name,
        slug: product.slug,
      });
    }

    const [buyer] = await this.db.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!buyer) {
      throw new ForbiddenException("Necesitás iniciar sesión para comprar");
    }

    const shippingCost = 0;
    const orderId = crypto.randomUUID();
    const code = await this.generateCode();
    const createdAt = new Date();

    await this.db.db.batch([
      this.db.db.insert(orders).values({
        id: orderId,
        code,
        userId,
        status: "confirmado",
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        paymentMethod: dto.paymentMethod,
        shippingMethod: dto.shippingMethod ?? "estandar",
        addressSnapshot: { ...dto.address, phone: dto.address.phone ?? null },
        createdAt,
      }),
      this.db.db.insert(orderItems).values(lines.map((line) => ({ ...line, orderId, createdAt }))),
      ...lines.map((line) =>
        this.db.db
          .update(products)
          .set({
            stock: sql`${products.stock} - ${line.quantity}`,
            soldQuantity: sql`${products.soldQuantity} + ${line.quantity}`,
          })
          .where(eq(products.id, line.productId as string)),
      ),
    ]);

    await this.db.sync();

    const [order] = await this.db.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const orderLines = await this.db.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    return this.mapOrder(order, orderLines, buyer.name);
  }

  async myOrders(userId: string): Promise<SharedOrder[]> {
    const orderRows = await this.db.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    if (!orderRows.length) return [];
    const items = await this.loadItems(orderRows.map((order) => order.id));
    return orderRows.map((order) => this.mapOrder(order, items.get(order.id) ?? []));
  }

  async sales(userId: string): Promise<SharedOrder[]> {
    const sellerRows = await this.db.db
      .selectDistinct({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(eq(orderItems.sellerId, userId));
    const ids = sellerRows.map((row) => row.orderId);
    if (!ids.length) return [];
    const orderRows = await this.db.db
      .select({ order: orders, buyer: users })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(inArray(orders.id, ids))
      .orderBy(desc(orders.createdAt));
    const items = await this.loadItems(ids);
    return orderRows.map((row) => this.mapOrder(row.order, items.get(row.order.id) ?? [], row.buyer.name));
  }

  async detail(userId: string, orderId: string): Promise<SharedOrder> {
    const [row] = await this.db.db
      .select({ order: orders, buyer: users })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!row) {
      throw new NotFoundException("El pedido no existe");
    }
    const items = await this.db.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const isBuyer = row.order.userId === userId;
    const isSeller = items.some((item) => item.sellerId === userId);
    if (!isBuyer && !isSeller) {
      throw new ForbiddenException("No tenés acceso a este pedido");
    }
    return this.mapOrder(row.order, items, row.buyer.name);
  }

  async updateStatus(userId: string, orderId: string, dto: UpdateOrderStatusDto): Promise<SharedOrder> {
    const [order] = await this.db.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      throw new NotFoundException("El pedido no existe");
    }
    const [sellerItem] = await this.db.db
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(and(eq(orderItems.orderId, orderId), eq(orderItems.sellerId, userId)))
      .limit(1);
    if (!sellerItem) {
      throw new ForbiddenException("Solo el vendedor puede actualizar el envío");
    }
    await this.db.db.update(orders).set({ status: dto.status }).where(eq(orders.id, orderId));
    await this.db.sync();
    return this.detail(userId, orderId);
  }

  private async loadItems(orderIds: string[]): Promise<Map<string, OrderItemRow[]>> {
    const rows = await this.db.db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));
    const grouped = new Map<string, OrderItemRow[]>();
    for (const row of rows) {
      const list = grouped.get(row.orderId) ?? [];
      list.push(row);
      grouped.set(row.orderId, list);
    }
    return grouped;
  }

  private mapOrder(order: OrderRow, items: OrderItemRow[], buyerName?: string): SharedOrder {
    return {
      id: order.id,
      code: order.code,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentLabel: PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod,
      shippingMethod: order.shippingMethod,
      address: order.addressSnapshot,
      items: items.map(
        (item): SharedOrderItem => ({
          id: item.id,
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sellerId: item.sellerId,
          sellerName: item.sellerName,
          slug: item.slug,
        }),
      ),
      createdAt: order.createdAt.toISOString(),
      buyerName,
    };
  }

  private async generateCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `TR-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;
      const [existing] = await this.db.db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.code, code))
        .limit(1);
      if (!existing) return code;
    }
    return `TR-${Date.now()}`;
  }
}
