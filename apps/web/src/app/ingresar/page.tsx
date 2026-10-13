import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Ingresá a tu cuenta",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-3 py-10 sm:px-4">
      <AuthForm mode="login" />
    </div>
  );
}
