import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@trato/shared";

interface CartState {
  items: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === line.productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === line.productId
                  ? { ...item, quantity: Math.min(item.stock || 99, item.quantity + quantity) }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...line, quantity: Math.min(line.stock || 99, quantity) }] };
        }),
      increment: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.stock || 99, item.quantity + 1) }
              : item,
          ),
        })),
      decrement: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item,
          ),
        })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(item.stock || 99, Math.max(1, quantity)) }
              : item,
          ),
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "trato-cart" },
  ),
);

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.price * item.quantity, 0);
