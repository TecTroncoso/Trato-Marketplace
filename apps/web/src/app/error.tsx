"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-[var(--shadow-card)]">
        <AlertTriangle className="size-9 text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-trato-ink">Algo salió mal</h1>
      <p className="text-sm text-trato-muted">
        Tuvimos un problema al cargar esta sección. Podés reintentar o volver al inicio.
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="primary" onClick={() => reset()}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
