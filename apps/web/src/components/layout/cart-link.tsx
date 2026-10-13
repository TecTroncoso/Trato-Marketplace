"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore, selectCartCount } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-client";

export function CartLink() {
  const mounted = useMounted();
  const count = useCartStore(selectCartCount);

  return (
    <Link
      href="/carrito"
      aria-label="Carrito de compras"
      className="relative flex items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
    >
      <span className="relative flex items-center">
        <ShoppingCart className="size-5" />
        {mounted && count > 0 && (
          <span className="absolute -right-2.5 -top-2 flex min-w-5 items-center justify-center rounded-full bg-trato-blue px-1 text-[11px] font-bold text-white ring-2 ring-trato-navy-deep">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden sm:block">Carrito</span>
    </Link>
  );
}
