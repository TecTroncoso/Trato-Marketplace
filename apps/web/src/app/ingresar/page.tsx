import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { PageContainer } from "@/components/ui/page-container";

export const metadata: Metadata = {
  title: "Ingresá a tu cuenta",
};

export default function LoginPage() {
  return (
    <PageContainer width="form" padding="lg">
      <AuthForm mode="login" />
      </PageContainer>
  );
}
