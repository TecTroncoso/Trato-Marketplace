"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CartLink } from "./cart-link";
import { CategoriesMenu } from "./categories-menu";
import { LocationPicker } from "./location-picker";
import { MobileNav } from "./mobile-nav";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CATEGORY_LINKS = [
  { slug: "celulares", label: "Tecnología" },
  { slug: "computacion", label: "Computación" },
  { slug: "hogar", label: "Hogar" },
  { slug: "moda", label: "Moda" },
  { slug: "deportes", label: "Deportes" },
  { slug: "electrodomesticos", label: "Electrodomésticos" },
  { slug: "electronica", label: "Electrónica" },
  { slug: "consolas", label: "Consolas" },
  { slug: "belleza", label: "Belleza" },
  { slug: "juguetes", label: "Juguetes y bebés" },
  { slug: "herramientas", label: "Herramientas" },
  { slug: "oficina", label: "Oficina" },
  { slug: "musica", label: "Música" },
  { slug: "mascotas", label: "Mascotas" },
];

const VISIBLE_LINKS = CATEGORY_LINKS.slice(0, 6);
const MORE_LINKS = CATEGORY_LINKS.slice(6);

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gradient-to-r from-trato-navy-deep via-trato-navy-mid to-trato-navy-deep shadow-[0_2px_12px_rgba(9,16,42,0.35)]">
        <div className="mx-auto flex max-w-[1360px] items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4">
          <MobileNav />
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-trato-blue text-lg font-black text-white shadow-[0_4px_12px_rgba(37,99,235,0.45)]">
              T
            </span>
            <span className="hidden text-xl font-extrabold tracking-tight text-white sm:block">Trato</span>
          </Link>

          <div className="flex-1">
            <SearchBar />
          </div>

          <UserMenu />
          <CartLink />
        </div>
      </div>

      <div className="border-b border-trato-line bg-white shadow-[0_1px_2px_rgba(16,26,63,0.05)]">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-3 py-2 sm:px-4">
          <CategoriesMenu />

          <nav className="scrollbar-none flex flex-1 items-center gap-4 overflow-x-auto">
            <Link
              href="/buscar?sort=sold_desc"
              className="shrink-0 text-sm font-bold text-trato-ink transition hover:text-trato-blue"
            >
              Ofertas
            </Link>
            {VISIBLE_LINKS.map((category) => (
              <Link
                key={category.slug}
                href={`/categorias/${category.slug}`}
                className="shrink-0 text-sm text-trato-ink/80 transition hover:text-trato-blue"
              >
                {category.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 text-sm text-trato-ink/80 outline-none transition hover:text-trato-blue">
                Más <ChevronDown className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {MORE_LINKS.map((category) => (
                  <DropdownMenuItem key={category.slug} asChild>
                    <Link href={`/categorias/${category.slug}`}>{category.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/buscar" className="font-semibold text-trato-blue">
                    Ver todo el catálogo
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden shrink-0 lg:block">
            <LocationPicker />
          </div>
        </div>
      </div>
    </header>
  );
}
