import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@trato/shared";

interface FavoritesState {
  items: ProductSummary[];
  toggle: (product: ProductSummary) => boolean;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((item) => item.id !== product.id) }));
          return false;
        }
        set((state) => ({ items: [{ ...product }, ...state.items] }));
        return true;
      },
      has: (productId) => get().items.some((item) => item.id === productId),
      remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "trato-favorites" },
  ),
);

export const selectFavoriteIds = (state: FavoritesState): string[] => state.items.map((item) => item.id);
