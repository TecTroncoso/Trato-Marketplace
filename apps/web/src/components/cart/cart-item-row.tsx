"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, Truck } from "lucide-react";
import type { CartLine } from "@trato/shared";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartItemRow({ item }: { item: CartLine }) {
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="flex gap-3 border-b border-trato-line py-4 last:border-b-0 sm:gap-4"
    >
      <Link href={`/productos/${item.slug}`} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          className="size-20 rounded-lg object-cover sm:size-24"
          loading="lazy"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/productos/${item.slug}`} className="line-clamp-2 text-sm text-trato-ink transition hover:text-trato-blue">
          {item.title}
        </Link>
        <p className="mt-0.5 text-xs text-trato-muted">Vendido por {item.sellerName}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-trato-green">
          <Truck className="size-3" /> Envío gratis
        </p>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <div className="flex items-center overflow-hidden rounded-md border border-trato-line">
            <button
              type="button"
              onClick={() => decrement(item.productId)}
              disabled={item.quantity <= 1}
              className="flex size-8 items-center justify-center text-trato-muted transition hover:bg-black/[0.04] disabled:opacity-40"
              aria-label="Restar"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-9 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => increment(item.productId)}
              disabled={item.quantity >= item.stock}
              className="flex size-8 items-center justify-center text-trato-muted transition hover:bg-black/[0.04] disabled:opacity-40"
              aria-label="Sumar"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(item.productId)}
            className="flex items-center gap-1 text-xs font-semibold text-trato-muted transition hover:text-red-600"
          >
            <Trash2 className="size-3.5" /> Eliminar
          </button>
        </div>
      </div>

      <div className="shrink-0 text-right">
        {item.quantity > 1 && (
          <p className="text-xs text-trato-muted">
            {item.quantity} × {formatPrice(item.price)}
          </p>
        )}
        <p className="text-base font-semibold text-trato-ink">{formatPrice(item.price * item.quantity)}</p>
      </div>
    </motion.li>
  );
}
