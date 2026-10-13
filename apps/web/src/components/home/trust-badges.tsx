import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Envío rápido", detail: "a todo el país" },
  { icon: ShieldCheck, title: "Compra protegida", detail: "tu compra, siempre segura" },
  { icon: CreditCard, title: "Múltiples medios de pago", detail: "tarjetas, transferencias y más" },
  { icon: RotateCcw, title: "Devolución gratis", detail: "en los primeros 30 días" },
];

export function TrustBadges({ stats }: { stats: { products: number; sellers: number; categories: number } }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-trato-blue-soft">
              <item.icon className="size-5 text-trato-blue" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-trato-ink">{item.title}</p>
              <p className="mt-0.5 text-xs text-trato-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-trato-line pt-3 text-center text-xs text-trato-muted">
        {stats.products.toLocaleString("es-AR")} productos publicados por {stats.sellers} vendedores en {stats.categories} categorías
      </p>
    </section>
  );
}
