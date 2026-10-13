"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LOCATIONS, useLocationStore } from "@/store/location-store";
import { useMounted } from "@/hooks/use-client";

export function LocationPicker() {
  const mounted = useMounted();
  const city = useLocationStore((state) => state.city);
  const setCity = useLocationStore((state) => state.setCity);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-left outline-none transition hover:bg-black/[0.04]">
        <MapPin className="size-4 shrink-0 text-trato-blue" />
        <span className="leading-tight">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-trato-muted">Enviá a</span>
          <span className="block text-xs font-semibold text-trato-ink">{mounted ? city : LOCATIONS[0]}</span>
        </span>
        <ChevronDown className="size-3.5 text-trato-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Elegí tu ubicación</DropdownMenuLabel>
        {LOCATIONS.map((location) => (
          <DropdownMenuItem key={location} onSelect={() => setCity(location)} className="justify-between">
            <span className="truncate">{location}</span>
            {mounted && location === city && <Check className="size-3.5 text-trato-blue" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
