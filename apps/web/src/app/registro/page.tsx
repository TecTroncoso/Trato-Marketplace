import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Creá tu cuenta",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-3 py-10 sm:px-4">
      <AuthForm mode="register" />
    </div>
  );
}
