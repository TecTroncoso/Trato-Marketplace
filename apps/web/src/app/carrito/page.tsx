"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { selectCartSubtotal, useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-client";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const mounted = useMounted();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const clear = useCartStore((state) => state.clear);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1000px] px-3 py-6 sm:px-4">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1000px] px-3 py-10 sm:px-4">
        <div className="rounded-xl bg-white shadow-[var(--shadow-card)]">
          <EmptyState
            icon={ShoppingCart}
            title="Tu carrito está vacío"
            description="Explorá nuestro catálogo y agregá productos para comprar en cuotas sin interés y con envío gratis."
            action={
              <Button asChild variant="yellow">
                <Link href="/buscar">Explorar productos</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-6 sm:px-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-trato-ink sm:text-2xl">
          Tu carrito <span className="text-sm font-normal text-trato-muted">({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
        </h1>
        <button
          type="button"
          onClick={() => {
            clear();
            toast.success("Carrito vaciado");
          }}
          className="flex items-center gap-1 text-xs font-semibold text-trato-muted transition hover:text-red-600"
        >
          <Trash2 className="size-3.5" /> Vaciar
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl bg-white px-4 shadow-[var(--shadow-card)] sm:px-5">
          <ul>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-base font-semibold text-trato-ink">Resumen de compra</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-trato-muted">Productos ({totalItems})</dt>
                <dd className="text-trato-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-trato-muted">Envío</dt>
                <dd className="font-semibold text-trato-green">Gratis</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-trato-line pt-3 text-base">
                <dt className="font-semibold text-trato-ink">Total</dt>
                <dd className="font-bold text-trato-ink">{formatPrice(subtotal)}</dd>
              </div>
            </dl>
            <Button asChild size="lg" variant="primary" className="mt-5 w-full">
              <Link href="/checkout">Continuar la compra</Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full text-trato-muted">
              <Link href="/buscar">Seguir comprando</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
