"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { selectCartSubtotal, selectCartCount, useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-client";
import { formatPrice } from "@/lib/utils";

export function MiniCart() {
  const mounted = useMounted();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectCartSubtotal);
  const totalItems = useCartStore(selectCartCount);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)]">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-trato-ink">Tu carrito</h3>
        {mounted && items.length > 0 && (
          <Link href="/carrito" className="text-xs font-semibold text-trato-blue transition hover:underline">
            Ver carrito →
          </Link>
        )}
      </header>

      {!mounted ? (
        <div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="mt-2 h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div>
          <p className="text-xs text-trato-muted">Todavía no agregaste productos.</p>
          <Button asChild size="sm" variant="outline" className="mt-3 w-full">
            <Link href="/buscar">Explorar productos</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-trato-muted">
            {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </p>
          <ul className="flex flex-col gap-3">
            {items.slice(0, 2).map((item) => (
              <li key={item.productId} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} className="size-12 shrink-0 rounded-lg object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <Link href={`/productos/${item.slug}`} className="line-clamp-2 text-xs text-trato-ink transition hover:text-trato-blue">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-xs font-bold text-trato-ink">{formatPrice(item.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center overflow-hidden rounded-md border border-trato-line">
                      <button
                        type="button"
                        onClick={() => decrement(item.productId)}
                        disabled={item.quantity <= 1}
                        aria-label="Restar"
                        className="flex size-6 items-center justify-center text-trato-muted transition hover:bg-black/[0.04] disabled:opacity-40"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increment(item.productId)}
                        disabled={item.quantity >= item.stock}
                        aria-label="Sumar"
                        className="flex size-6 items-center justify-center text-trato-muted transition hover:bg-black/[0.04] disabled:opacity-40"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.productId)}
                      aria-label="Quitar producto"
                      className="text-trato-muted transition hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {items.length > 2 && (
            <p className="mt-2 text-[11px] text-trato-muted">y {items.length - 2} producto(s) más…</p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-trato-line pt-3 text-sm">
            <span className="text-trato-muted">Subtotal</span>
            <span className="font-bold text-trato-ink">{formatPrice(subtotal)}</span>
          </div>
          <Button asChild className="mt-3 w-full">
            <Link href="/carrito">Ir al carrito</Link>
          </Button>
        </>
      )}
    </div>
  );
}
