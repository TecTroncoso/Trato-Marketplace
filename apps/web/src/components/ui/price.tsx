import { cn, formatNumber, formatPrice } from "@/lib/utils";
import type { Installment } from "@trato/shared";

export function PriceTag({
  price,
  originalPrice,
  installments,
  size = "md",
  showInstallments = false,
  className,
}: {
  price: number;
  originalPrice?: number | null;
  installments?: Installment | null;
  size?: "sm" | "md" | "lg";
  showInstallments?: boolean;
  className?: string;
}) {
  const hasDiscount = Boolean(originalPrice && originalPrice > price);
  const percent = hasDiscount && originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const priceClass =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  return (
    <div className={cn("flex flex-col", className)}>
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className={cn("text-trato-muted line-through", size === "lg" ? "text-base" : "text-xs")}>
            {formatPrice(originalPrice as number)}
          </span>
          <span className={cn("text-trato-green", size === "lg" ? "text-base" : "text-xs")}>{percent}% OFF</span>
        </div>
      )}
      <span className={cn("font-normal text-trato-ink", priceClass)}>{formatPrice(price)}</span>
      {showInstallments && installments && (
        <span className="text-sm text-trato-green">
          {installments.quantity}x {formatPrice(installments.amount)}
          {installments.interestFree ? " sin interés" : ""}
        </span>
      )}
      {showInstallments && installments && size === "lg" && (
        <span className="mt-0.5 text-xs text-trato-blue">
          Ver los medios de pago
        </span>
      )}
      {showInstallments && !installments && <span className="text-xs text-trato-muted">{formatNumber(price)}</span>}
    </div>
  );
}
