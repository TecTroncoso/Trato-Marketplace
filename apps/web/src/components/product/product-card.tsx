"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import type { ProductSummary } from "@trato/shared";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { PriceTag } from "@/components/ui/price";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useFavoriteToggle } from "@/hooks/use-favorite-toggle";
import { cn, formatPrice } from "@/lib/utils";

function FavoriteButton({ product }: { product: ProductSummary }) {
  const toggleFavorite = useFavoriteToggle();
  const favorites = useFavoritesStore((state) => state.items);
  const user = useAuthStore((state) => state.user);
  const isFavorite = favorites.some((item) => item.id === product.id);

  async function handleFavorite(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const added = await toggleFavorite(product);
    if (!user) {
      toast.message(added ? "Guardado en favoritos" : "Quitado de favoritos", {
        description: "Ingresá para sincronizar tus favoritos en todos tus dispositivos.",
      });
      return;
    }
    toast.success(added ? "Agregado a favoritos" : "Quitado de favoritos");
  }

  return (
    <button
      type="button"
      onClick={handleFavorite}
      aria-label="Agregar a favoritos"
      className="absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-trato-muted shadow-sm backdrop-blur transition hover:scale-110 hover:text-red-500"
    >
      <Heart className={cn("size-4", isFavorite && "fill-red-500 text-red-500")} />
    </button>
  );
}

export function ProductCard({
  product,
  className,
  variant = "default",
}: {
  product: ProductSummary;
  className?: string;
  variant?: "default" | "compact";
}) {
  const addToCart = useCartStore((state) => state.add);
  const image = product.images[0] ?? "/products/placeholder.svg";

  function handleAdd(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addToCart({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image,
      sellerId: product.seller.id,
      sellerName: product.seller.name,
      stock: product.stock,
    });
    toast.success("Producto agregado al carrito");
  }

  if (variant === "compact") {
    return (
      <motion.article
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl bg-white p-2.5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_12px_28px_-14px_rgba(16,26,63,0.35)]",
          className,
        )}
      >
        <FavoriteButton product={product} />
        <Link href={`/productos/${product.slug}`} className="flex flex-1 flex-col">
          <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-black/[0.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={product.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
            {product.discount ? (
              <span className="absolute left-2 top-2 rounded-md bg-trato-green px-1.5 py-0.5 text-[10px] font-bold text-white">
                {product.discount}%
              </span>
            ) : null}
          </div>
          <h3 className="line-clamp-2 text-xs leading-snug text-trato-ink">{product.title}</h3>
          <div className="mt-auto pt-1.5">
            {product.originalPrice ? (
              <span className="block text-[11px] text-trato-muted line-through">{formatPrice(product.originalPrice)}</span>
            ) : null}
            <span className="block text-sm font-semibold text-trato-ink">{formatPrice(product.price)}</span>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[0_14px_30px_-16px_rgba(16,26,63,0.4)]",
        className,
      )}
    >
      <FavoriteButton product={product} />

      <Link href={`/productos/${product.slug}`} className="flex flex-1 flex-col p-3">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-black/[0.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
          {product.discount ? (
            <span className="absolute left-2 top-2 rounded-md bg-trato-green px-1.5 py-0.5 text-[11px] font-bold text-white">
              -{product.discount}%
            </span>
          ) : null}
          {product.stock === 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold uppercase tracking-wide text-trato-muted">
              Sin stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          {product.brand && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-trato-muted">{product.brand}</span>
          )}
          <h3 className="line-clamp-2 text-sm leading-snug text-trato-ink">{product.title}</h3>

          <Rating value={product.rating} count={product.reviewsCount} size={12} className="mt-0.5" />

          <div className="mt-auto pt-2">
            <PriceTag
              price={product.price}
              originalPrice={product.originalPrice}
              installments={product.installments}
              size="md"
              showInstallments
            />
            {product.freeShipping ? (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-trato-green-soft px-2 py-0.5 text-[11px] font-semibold text-trato-green">
                <Truck className="size-3" /> Envío gratis
              </span>
            ) : (
              <span className="mt-1.5 block text-xs text-trato-muted">Llega el jueves</span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {product.condition === "usado" ? <Badge variant="used">Usado</Badge> : <Badge variant="new">Nuevo</Badge>}
            {product.stock > 0 && product.stock <= 5 && <Badge variant="hot">Últimas {product.stock}</Badge>}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <motion.button
          type="button"
          onClick={handleAdd}
          disabled={product.stock === 0}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-trato-blue-soft py-2 text-xs font-bold text-trato-blue transition hover:bg-trato-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-trato-blue-soft disabled:hover:text-trato-blue"
        >
          <ShoppingCart className="size-3.5" />
          {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </motion.button>
      </div>
    </motion.article>
  );
}
