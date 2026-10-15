"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Heart, Minus, Plus, RotateCcw, Share2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import type { ProductDetail } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { useAuthStore } from "@/store/auth-store";
import { Section } from "@/components/ui/section";
import { useCartStore } from "@/store/cart-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useFavoriteToggle } from "@/hooks/use-favorite-toggle";
import { cn, formatCompact, formatPrice } from "@/lib/utils";

export function BuyBox({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.add);
  const user = useAuthStore((state) => state.user);
  const toggleFavorite = useFavoriteToggle();
  const isFavorite = useFavoritesStore((state) => state.items.some((item) => item.id === product.id));
  const soldOut = product.stock === 0;
  const image = product.images[0] ?? "/products/placeholder.svg";

  function buildLine() {
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image,
      sellerId: product.seller.id,
      sellerName: product.seller.name,
      stock: product.stock,
    };
  }

  function handleAdd() {
    addToCart(buildLine(), quantity);
    toast.success(`${quantity} ${quantity === 1 ? "unidad agregada" : "unidades agregadas"} al carrito`);
  }

  function handleBuyNow() {
    addToCart(buildLine(), quantity);
    router.push("/checkout");
  }

  async function handleFavorite() {
    const added = await toggleFavorite(product);
    toast.success(added ? "Agregado a favoritos" : "Quitado de favoritos");
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace del producto copiado");
    } catch {
      toast.error("No pudimos copiar el enlace");
    }
  }

  return (
    <Section>
      <p className="text-xs text-trato-muted">
        <span className={cn("font-semibold", product.condition === "nuevo" ? "text-trato-ink" : "text-trato-muted")}>
          {product.condition === "nuevo" ? "Nuevo" : "Usado"}
        </span>
        {product.soldQuantity > 0 ? ` · +${formatCompact(product.soldQuantity)} vendidos` : ""}
      </p>
      <h1 className="mt-1 text-lg font-semibold leading-snug text-trato-ink sm:text-xl">{product.title}</h1>

      <a href="#opiniones" className="mt-1 inline-flex items-center gap-2">
        <Rating value={product.rating} count={product.reviewsCount} />
      </a>

      {product.originalPrice ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-trato-muted">
          <span className="line-through">{formatPrice(product.originalPrice)}</span>
          <span className="font-semibold text-trato-green">{product.discount}% OFF</span>
        </p>
      ) : (
        <div className="mt-3" />
      )}

      <p className="text-3xl font-normal text-trato-ink">{formatPrice(product.price)}</p>
      {product.installments && (
        <p className="mt-1 text-sm text-trato-green">
          en {product.installments.quantity}x {formatPrice(product.installments.amount)} sin interés
        </p>
      )}
      <p className="mt-1 text-xs font-semibold text-trato-blue">Ver los medios de pago</p>

      {!soldOut && (
        <p className="mt-3 text-sm">
          {product.stock <= 3 ? (
            <span className="font-semibold text-red-600">¡Últimas {product.stock} {product.stock === 1 ? "unidad" : "unidades"}!</span>
          ) : (
            <span className="text-trato-muted">
              Stock disponible: <span className="font-semibold text-trato-ink">{product.stock}</span>
            </span>
          )}
        </p>
      )}

      {!soldOut && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-trato-muted">Cantidad:</span>
          <div className="flex items-center overflow-hidden rounded-md border border-trato-line">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              className="flex size-9 items-center justify-center text-trato-muted transition hover:bg-black/[0.04] disabled:opacity-40"
              aria-label="Restar unidad"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
              disabled={quantity >= product.stock}
              className="flex size-9 items-center justify-center text-trato-muted transition hover:bg-black/[0.04] disabled:opacity-40"
              aria-label="Sumar unidad"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <Button variant="primary" size="lg" disabled={soldOut} onClick={handleBuyNow}>
          {soldOut ? "Sin stock" : "Comprar ahora"}
        </Button>
        <Button variant="outline" size="lg" disabled={soldOut} onClick={handleAdd}>
          <ShoppingCart /> Agregar al carrito
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 text-trato-muted" onClick={handleFavorite}>
            <Heart className={cn(isFavorite && "fill-red-500 text-red-500")} />
            {isFavorite ? "En favoritos" : "Agregar a favoritos"}
          </Button>
          <Button variant="ghost" size="icon" className="text-trato-muted" onClick={handleShare} aria-label="Compartir">
            <Share2 />
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-trato-line pt-4 text-sm">
        <div className="flex gap-3">
          <Truck className="mt-0.5 size-4 shrink-0 text-trato-green" />
          <div>
            <p className="font-semibold text-trato-green">{product.freeShipping ? "Envío gratis" : "Envío a calcular"}</p>
            <p className="text-xs text-trato-muted">Llega gratis mañana si comprás hoy</p>
          </div>
        </div>
        <div className="flex gap-3">
          <RotateCcw className="mt-0.5 size-4 shrink-0 text-trato-muted" />
          <div>
            <p className="font-semibold text-trato-ink">Devolución gratis</p>
            <p className="text-xs text-trato-muted">Tenés 30 días desde que lo recibís</p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-trato-blue" />
          <div>
            <p className="font-semibold text-trato-ink">Compra protegida</p>
            <p className="text-xs text-trato-muted">Recibí el producto que esperabas o te devolvemos el dinero</p>
          </div>
        </div>
        <div className="flex gap-3">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-trato-muted" />
          <div>
            <p className="font-semibold text-trato-ink">Cuotas sin interés</p>
            <p className="text-xs text-trato-muted">Hasta 12 cuotas con tarjetas seleccionadas</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-trato-line pt-4">
        <Badge variant="shipping">
          <Check className="size-3" /> {product.favoriteCount} personas lo guardaron
        </Badge>
        {product.condition === "usado" && <Badge variant="used">Producto usado</Badge>}
        {product.freeShipping && <Badge variant="shipping">Envío gratis</Badge>}
      </div>

      {!user && (
        <p className="mt-3 text-center text-xs text-trato-muted">
          Ingresá para guardar tus favoritos y ver tus compras.
        </p>
      )}
    </Section>
  );
}
