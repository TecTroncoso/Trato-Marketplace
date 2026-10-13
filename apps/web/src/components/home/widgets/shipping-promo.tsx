import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

export function ShippingPromo() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 bg-gradient-to-r from-trato-blue-soft via-white to-white p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <Truck className="size-5 text-trato-blue" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-trato-ink">Envíos a todo el país</h3>
          <p className="text-xs text-trato-muted">Llegamos a cada rincón de Argentina.</p>
        </div>
      </div>
      <Link
        href="/buscar?freeShipping=1"
        className="inline-flex items-center gap-1 px-4 pb-4 text-xs font-semibold text-trato-blue transition hover:gap-2"
      >
        Conocé más <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
