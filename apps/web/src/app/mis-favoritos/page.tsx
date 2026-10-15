"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ProductSummary } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductGrid } from "@/components/product/product-grid";
import { PageContainer } from "@/components/ui/page-container";
import { Section } from "@/components/ui/section";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { useMounted } from "@/hooks/use-client";

export default function FavoritesPage() {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const items = useFavoritesStore((state) => state.items);
  const clear = useFavoritesStore((state) => state.clear);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    (async () => {
      try {
        const localIds = useFavoritesStore.getState().items.map((item) => item.id);
        if (localIds.length) {
          await apiFetch("/favorites/sync", { method: "POST", token, body: { productIds: localIds } }).catch(() => undefined);
        }
        const list = await apiFetch<ProductSummary[]>("/favorites", { token });
        useFavoritesStore.setState({ items: list });
      } catch {
        void 0;
      } finally {
        setReady(true);
      }
    })();
  }, [token]);

  if (!mounted || !ready) {
    return (
      <div className="mx-auto max-w-[1220px] px-3 py-6 sm:px-4">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-trato-ink sm:text-2xl">Mis favoritos</h1>
          <p className="text-sm text-trato-muted">
            {user
              ? "Estos productos se sincronizan en todos tus dispositivos."
              : "Guardá productos favoritos; al ingresar se sincronizan con tu cuenta."}
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" className="text-trato-muted" onClick={clear}>
            Vaciar favoritos
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Section className="p-0">
          <EmptyState
            icon={Heart}
            title="No tenés favoritos todavía"
            description="Tocá el corazón en cualquier producto para guardarlo acá y encontrarlo fácil después."
            action={
              <Button asChild variant="yellow">
                <Link href="/buscar">Explorar productos</Link>
              </Button>
            }
          />
        </Section>
      ) : (
        <ProductGrid products={items} />
      )}
    </PageContainer>
  );
}
