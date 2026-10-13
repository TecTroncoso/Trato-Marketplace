"use client";

import { toast } from "sonner";
import type { ProductSummary } from "@trato/shared";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useFavoritesStore } from "@/store/favorites-store";

export function useFavoriteToggle() {
  const toggle = useFavoritesStore((state) => state.toggle);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  return async function toggleFavorite(product: ProductSummary): Promise<boolean> {
    const added = toggle(product);
    if (user && token) {
      try {
        if (added) {
          await apiFetch("/favorites", { method: "POST", token, body: { productId: product.id } });
        } else {
          await apiFetch(`/favorites/${product.id}`, { method: "DELETE", token });
        }
      } catch (error) {
        toast.error((error as Error).message || "No pudimos sincronizar el favorito");
      }
    }
    return added;
  };
}
