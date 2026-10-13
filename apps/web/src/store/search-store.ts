import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchState {
  queries: string[];
  pushQuery: (query: string) => void;
  removeQuery: (query: string) => void;
  clearQueries: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      queries: [],
      pushQuery: (query) =>
        set((state) => {
          const clean = query.trim();
          if (clean.length < 2) return state;
          return { queries: [clean, ...state.queries.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8) };
        }),
      removeQuery: (query) => set((state) => ({ queries: state.queries.filter((item) => item !== query) })),
      clearQueries: () => set({ queries: [] }),
    }),
    { name: "trato-searches" },
  ),
);
