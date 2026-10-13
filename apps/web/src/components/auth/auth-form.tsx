"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Mail, Phone, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [next, setNext] = useState("/");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("next");
    if (target && target.startsWith("/")) setNext(target);
  }, []);

  async function syncFavorites() {
    const token = useAuthStore.getState().token;
    const ids = useFavoritesStore.getState().items.map((item) => item.id);
    if (!token || !ids.length) return;
    try {
      await apiFetch("/favorites/sync", { method: "POST", token, body: { productIds: ids } });
    } catch {
      void 0;
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (mode === "register" && name.trim().length < 3) {
      setError("Ingresá tu nombre completo");
      return;
    }
    if (!email.includes("@")) {
      setError("Ingresá un email válido");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      if (mode === "login") {
        const user = await login(email.trim(), password);
        await syncFavorites();
        toast.success(`¡Hola de nuevo, ${user.name.split(" ")[0]}!`);
      } else {
        const user = await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
        await syncFavorites();
        toast.success(`¡Bienvenido a Trato, ${user.name.split(" ")[0]}!`);
      }
      router.push(next);
      router.refresh();
    } catch (submitError) {
      setError((submitError as Error).message);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <h1 className="text-xl font-bold text-trato-ink">{mode === "login" ? "Ingresá a tu cuenta" : "Creá tu cuenta"}</h1>
      <p className="mt-1 text-sm text-trato-muted">
        {mode === "login"
          ? "Accedé para comprar, vender y seguir tus pedidos."
          : "Es gratis y te toma un minuto. Empezá a comprar y vender en Trato."}
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {mode === "register" && (
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-trato-muted" />
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Juan Pérez" className="pl-9" autoComplete="name" />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-trato-muted" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              className="pl-9"
              autoComplete="email"
            />
          </div>
        </div>

        {mode === "register" && (
          <div>
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-trato-muted" />
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="11 5555-5555" className="pl-9" autoComplete="tel" />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-trato-muted" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
              className="pl-9"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" variant="primary" disabled={loading}>
          {loading ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-trato-muted">
          {mode === "login" ? (
            <>
              ¿No tenés cuenta?{" "}
              <Link href="/registro" className="font-semibold text-trato-blue hover:underline">
                Registrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <Link href="/ingresar" className="font-semibold text-trato-blue hover:underline">
                Ingresá
              </Link>
            </>
          )}
        </p>
      </div>

      {mode === "login" && (
        <div className={cn("mt-6 rounded-lg bg-trato-blue-soft p-4 text-xs text-trato-ink")}>
          <p className="font-bold text-trato-blue">Cuenta de demostración</p>
          <p className="mt-1">
            Email: <span className="font-semibold">demo@trato.com</span> · Contraseña: <span className="font-semibold">Demo1234</span>
          </p>
        </div>
      )}
    </form>
  );
}
