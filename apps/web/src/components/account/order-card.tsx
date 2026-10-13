"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, RotateCcw, Truck } from "lucide-react";
import { toast } from "sonner";
import { ORDER_STATUSES, type Order } from "@trato/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { cn, formatDate, formatPrice } from "@/lib/utils";

const TONES: Record<string, string> = {
  info: "bg-trato-blue-soft text-trato-blue",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-trato-green-soft text-trato-green",
  danger: "bg-red-100 text-red-600",
  neutral: "bg-black/[0.06] text-trato-muted",
};

function StatusBadge({ status }: { status: string }) {
  const meta = ORDER_STATUSES[status] ?? { label: status, tone: "neutral" as const };
  return <Badge className={cn("normal-case", TONES[meta.tone])}>{meta.label}</Badge>;
}

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  confirmado: { status: "preparando", label: "Marcar en preparación" },
  preparando: { status: "enviado", label: "Marcar como enviado" },
  enviado: { status: "entregado", label: "Marcar como entregado" },
};

export function OrderCard({
  order,
  mode,
  onUpdated,
}: {
  order: Order;
  mode: "purchase" | "sale";
  onUpdated?: (order: Order) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const token = useAuthStore((state) => state.token);
  const addToCart = useCartStore((state) => state.add);
  const [updating, setUpdating] = useState(false);

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

  function repurchase() {
    for (const item of order.items) {
      addToCart({
        productId: item.productId ?? item.id,
        slug: item.slug ?? "",
        title: item.title,
        price: item.price,
        image: item.image ?? "/products/placeholder.svg",
        sellerId: item.sellerId ?? "",
        sellerName: item.sellerName,
        stock: 99,
      });
    }
    toast.success("Productos agregados al carrito");
  }

  async function advance() {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(true);
    try {
      const updated = await apiFetch<Order>(`/orders/${order.id}/status`, {
        method: "PUT",
        token,
        body: { status: next.status },
      });
      toast.success(`Pedido actualizado: ${ORDER_STATUSES[updated.status]?.label ?? updated.status}`);
      onUpdated?.(updated);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <article className="rounded-xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-trato-line pb-3">
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="text-xs text-trato-muted">
            Pedido <span className="font-semibold text-trato-ink">{order.code}</span> · {formatDate(order.createdAt)}
          </span>
        </div>
        <span className="text-xs text-trato-muted">
          {mode === "sale" && order.buyerName ? `Comprador: ${order.buyerName}` : `${itemCount} ${itemCount === 1 ? "producto" : "productos"}`}
        </span>
      </header>

      <ul className="flex flex-col gap-3 py-3">
        {order.items.slice(0, 3).map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image ?? "/products/placeholder.svg"} alt={item.title} className="size-12 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              {item.slug ? (
                <Link href={`/productos/${item.slug}`} className="line-clamp-1 text-sm text-trato-ink transition hover:text-trato-blue">
                  {item.title}
                </Link>
              ) : (
                <p className="line-clamp-1 text-sm text-trato-ink">{item.title}</p>
              )}
              <p className="text-xs text-trato-muted">
                {item.quantity} × {formatPrice(item.price)}
                {mode === "sale" ? ` · Vendedor: vos` : ""}
              </p>
            </div>
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="text-xs text-trato-muted">y {order.items.length - 3} producto(s) más…</li>
        )}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-trato-line pt-3">
        <div className="text-sm">
          <span className="text-trato-muted">Total: </span>
          <span className="font-bold text-trato-ink">{formatPrice(order.total)}</span>
          <span className="ml-2 text-xs text-trato-muted">· {order.paymentLabel}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setDetailOpen(true)}>
            Ver detalle
          </Button>
          {mode === "purchase" ? (
            <Button size="sm" variant="ghost" onClick={repurchase}>
              <RotateCcw /> Volver a comprar
            </Button>
          ) : (
            NEXT_STATUS[order.status] && (
              <Button size="sm" onClick={advance} disabled={updating}>
                <Truck /> {NEXT_STATUS[order.status].label}
              </Button>
            )
          )}
        </div>
      </footer>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Pedido {order.code}</DialogTitle>
            <DialogDescription>
              {formatDate(order.createdAt)} · Estado: {ORDER_STATUSES[order.status]?.label ?? order.status}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto">
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image ?? "/products/placeholder.svg"} alt={item.title} className="size-14 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-trato-ink">{item.title}</p>
                    <p className="text-xs text-trato-muted">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-trato-ink">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 grid gap-2 border-t border-trato-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-trato-muted">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-trato-muted">Envío</dt>
                <dd className="font-semibold text-trato-green">{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
              <div className="mt-2 rounded-lg bg-black/[0.03] p-3 text-xs text-trato-muted">
                <p className="mb-1 font-semibold text-trato-ink">
                  <Package className="mr-1 inline size-3" /> Envío a {order.address.recipient}
                </p>
                <p>
                  {order.address.street} · {order.address.city}, {order.address.province} ({order.address.zip})
                </p>
                <p className="mt-1">Método de pago: {order.paymentLabel}</p>
              </div>
            </dl>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
