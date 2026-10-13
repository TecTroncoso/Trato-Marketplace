import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@trato/shared";

interface RecentState {
  items: ProductSummary[];
  push: (product: ProductSummary) => void;
  clear: () => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      push: (product) =>
        set((state) => ({
          items: [product, ...state.items.filter((item) => item.id !== product.id)].slice(0, 14),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "trato-recent" },
  ),
);
