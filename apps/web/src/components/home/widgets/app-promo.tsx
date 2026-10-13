"use client";

import { Download, Smartphone } from "lucide-react";
import { toast } from "sonner";

function StoreButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        toast.message("Aplicación móvil", {
          description: "Las apps de tienda no forman parte de esta demo.",
        })
      }
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-black/45 px-2 py-2 text-[11px] font-semibold text-white ring-1 ring-white/15 transition hover:bg-black/65"
    >
      <Download className="size-3" />
      {label}
    </button>
  );
}

export function AppPromo() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-trato-navy-deep to-trato-navy-mid p-4 text-white shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">Descargá nuestra app</h3>
          <p className="mt-1 text-xs text-white/70">Comprá desde donde quieras.</p>
        </div>
        <Smartphone className="size-8 shrink-0 text-white/50" />
      </div>
      <div className="mt-3 flex gap-2">
        <StoreButton label="Google Play" />
        <StoreButton label="App Store" />
      </div>
    </div>
  );
}
