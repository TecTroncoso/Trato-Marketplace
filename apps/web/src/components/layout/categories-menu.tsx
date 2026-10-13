"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LayoutGrid } from "lucide-react";
import type { Category } from "@trato/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api";

export function CategoriesMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  function handleOpenChange(open: boolean) {
    if (!open || loaded) return;
    setLoaded(true);
    apiFetch<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger className="flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold text-trato-ink outline-none transition hover:bg-black/[0.05]">
        <LayoutGrid className="size-4" />
        <span className="hidden sm:block">Todas las categorías</span>
        <ChevronDown className="size-3.5 text-trato-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[660px] max-w-[92vw] p-3">
        {categories.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-trato-muted">Cargando categorías…</p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-2 gap-x-4 gap-y-4 overflow-y-auto sm:grid-cols-3">
            {categories.map((root) => (
              <div key={root.id}>
                <DropdownMenuLabel className="px-2">
                  <span className="mr-1.5">{root.icon}</span>
                  {root.name}
                </DropdownMenuLabel>
                {(root.children ?? []).slice(0, 6).map((child) => (
                  <DropdownMenuItem key={child.id} asChild>
                    <Link href={`/categorias/${child.slug}`}>{child.name}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href={`/categorias/${root.slug}`} className="font-semibold text-trato-blue">
                    Ver todo
                  </Link>
                </DropdownMenuItem>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
