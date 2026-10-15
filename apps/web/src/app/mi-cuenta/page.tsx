"use client";

import Link from "next/link";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountTabs } from "@/components/account/account-tabs";
import { PageContainer } from "@/components/ui/page-container";
import { Section } from "@/components/ui/section";
import { useAuthStore } from "@/store/auth-store";
import { useMounted } from "@/hooks/use-client";

export default function AccountPage() {
  const mounted = useMounted();
  const user = useAuthStore((state) => state.user);

  if (!mounted) {
    return (
      <PageContainer>
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer padding="lg">
        <Section className="p-0">
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
        </Section>
      </PageContainer>
    );
  }

  return <AccountTabs />;
}
