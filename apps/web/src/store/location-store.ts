import { create } from "zustand";
import { persist } from "zustand/middleware";

export const LOCATIONS = [
  "Buenos Aires, CABA",
  "Vicente López, Buenos Aires",
  "La Plata, Buenos Aires",
  "Rosario, Santa Fe",
  "Córdoba Capital",
  "Mendoza Capital",
  "Mar del Plata, Buenos Aires",
] as const;

interface LocationState {
  city: string;
  setCity: (city: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      city: LOCATIONS[0],
      setCity: (city) => set({ city }),
    }),
    { name: "trato-location" },
  ),
);
