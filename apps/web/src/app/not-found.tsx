import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-[var(--shadow-card)]">
        <PackageSearch className="size-9 text-trato-muted" />
      </div>
      <h1 className="text-2xl font-bold text-trato-ink">No encontramos esta página</h1>
      <p className="text-sm text-trato-muted">
        Puede que el producto ya no esté disponible o que el enlace esté roto. Probá buscando otra cosa.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild variant="yellow">
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/buscar">Explorar productos</Link>
        </Button>
      </div>
    </div>
  );
}
