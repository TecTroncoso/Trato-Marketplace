"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Order } from "@trato/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderCard } from "@/components/account/order-card";
import { PageContainer } from "@/components/ui/page-container";
import { Section } from "@/components/ui/section";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-client";

export default function MyOrdersPage() {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<Order[]>("/orders", { token })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!mounted || loading) {
    return (
      <PageContainer width="narrow">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer width="narrow" padding="lg">
        <Section className="p-0">
          <EmptyState
            icon={ShoppingBag}
            title="Ingresá para ver tus compras"
            description="Iniciá sesión para ver el historial de pedidos y seguir el estado de cada envío."
            action={
              <Button asChild variant="primary">
                <Link href="/ingresar">Ingresar</Link>
              </Button>
            }
          />
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="narrow">
      <h1 className="mb-1 text-xl font-bold text-trato-ink sm:text-2xl">Mis compras</h1>
      <p className="mb-5 text-sm text-trato-muted">Seguimiento de tus pedidos y compras anteriores.</p>

      {orders.length === 0 ? (
        <Section className="p-0">
          <EmptyState
            icon={ShoppingBag}
            title="Todavía no hiciste compras"
            description="Cuando compres en Trato, tus pedidos van a aparecer acá con su seguimiento."
            action={
              <Button asChild variant="yellow">
                <Link href="/buscar">Explorar productos</Link>
              </Button>
            }
          />
        </Section>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              mode="purchase"
              onUpdated={(updated) => setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
