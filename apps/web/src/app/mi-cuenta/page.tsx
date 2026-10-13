"use client";

import Link from "next/link";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountTabs } from "@/components/account/account-tabs";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-client";

export default function AccountPage() {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-[1000px] px-3 py-6 sm:px-4">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[1000px] px-3 py-10 sm:px-4">
        <div className="rounded-xl bg-white shadow-[var(--shadow-card)]">
          <EmptyState
            icon={UserX}
            title="Ingresá para ver tu cuenta"
            description="Desde tu cuenta podés gestionar tu perfil, direcciones, publicaciones y ventas."
            action={
              <Button asChild variant="primary">
                <Link href="/ingresar">Ingresar</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return <AccountTabs />;
}
