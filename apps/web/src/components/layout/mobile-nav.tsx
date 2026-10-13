"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, ShoppingBag, Store, User as UserIcon } from "lucide-react";
import type { Category } from "@trato/shared";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/mis-compras", label: "Mis compras", icon: ShoppingBag },
  { href: "/mis-favoritos", label: "Mis favoritos", icon: Heart },
  { href: "/vender", label: "Vender", icon: Store },
];

export function MobileNav() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    apiFetch<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Abrir menú"
        className="flex size-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 lg:hidden"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto px-4 pb-8 pt-14">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

        <div className="mb-5 flex flex-col gap-1">
          {!user && (
            <Link href="/ingresar" className="mb-2 rounded-lg bg-trato-blue px-4 py-2.5 text-center text-sm font-bold text-white">
              Ingresá a tu cuenta
            </Link>
          )}
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-trato-ink transition hover:bg-black/[0.04]"
            >
              <link.icon className="size-4 text-trato-muted" />
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/mi-cuenta"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-trato-ink transition hover:bg-black/[0.04]"
            >
              <UserIcon className="size-4 text-trato-muted" />
              Mi cuenta
            </Link>
          )}
        </div>

        <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-trato-muted">Categorías</h3>
        <ul className="flex flex-col">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => setOpenGroup((current) => (current === category.id ? null : category.id))}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-trato-ink transition hover:bg-black/[0.04]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{category.icon}</span>
                  {category.name}
                </span>
                <ChevronDown className={cn("size-4 text-trato-muted transition", openGroup === category.id && "rotate-180")} />
              </button>
              {openGroup === category.id && category.children && (
                <ul className="mb-1 ml-4 border-l border-trato-line pl-3">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/categorias/${child.slug}`}
                        className="block rounded-md px-3 py-2 text-sm text-trato-muted transition hover:bg-black/[0.04] hover:text-trato-blue"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={`/categorias/${category.slug}`}
                      className="block rounded-md px-3 py-2 text-sm font-semibold text-trato-blue transition hover:bg-black/[0.04]"
                    >
                      Ver todo {category.name}
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
