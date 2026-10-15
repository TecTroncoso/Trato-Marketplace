import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { PageContainer } from "@/components/ui/page-container";

export const metadata: Metadata = {
  title: "Creá tu cuenta",
};

export default function RegisterPage() {
  return (
    <PageContainer width="form" padding="lg">
      <AuthForm mode="register" />
      </PageContainer>
  );
}
