import Link from "next/link";
import { Store } from "lucide-react";

export function SellCta() {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-trato-navy-deep via-trato-navy-mid to-[#1d3a8f] px-6 py-8 text-white shadow-[var(--shadow-card)] sm:px-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            <Store className="size-4" /> Sumate a Trato
          </span>
          <h2 className="text-xl font-extrabold sm:text-2xl">Publicá tus productos y empezá a vender</h2>
          <p className="mt-1 text-sm text-white/75">
            Creá tu publicación en minutos y llegá a miles de compradores en todo el país.
          </p>
        </div>
        <Link
          href="/vender"
          className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-trato-navy transition hover:brightness-95"
        >
          Quiero vender
        </Link>
      </div>
    </section>
  );
}
