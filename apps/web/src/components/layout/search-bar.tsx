"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useDebouncedValue, useOnClickOutside } from "@/hooks/use-client";
import { useSearchStore } from "@/store/search-store";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debounced = useDebouncedValue(value, 250);
  const recent = useSearchStore((state) => state.queries);
  const pushQuery = useSearchStore((state) => state.pushQuery);
  const removeQuery = useSearchStore((state) => state.removeQuery);
  const clearQueries = useSearchStore((state) => state.clearQueries);
  const ref = useOnClickOutside<HTMLFormElement>(() => setOpen(false));

  useEffect(() => {
    let cancelled = false;
    const query = debounced.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    apiFetch<{ suggestions: string[] }>(`/search/suggestions?q=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!cancelled) setSuggestions(response.suggestions);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  function submit(query: string) {
    const clean = query.trim();
    if (clean.length < 2) return;
    pushQuery(clean);
    setValue(clean);
    setOpen(false);
    router.push(`/buscar?q=${encodeURIComponent(clean)}`);
  }

  const showPanel = open && (suggestions.length > 0 || recent.length > 0);

  return (
    <form
      ref={ref}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submit(value);
      }}
      className={cn("relative w-full", className)}
    >
      <div className="flex items-center overflow-hidden rounded-full bg-white p-1 shadow-[0_2px_10px_rgba(9,16,42,0.18)]">
        <input
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar productos, marcas y más…"
          aria-label="Buscar productos"
          className="h-9 w-full rounded-l-full bg-transparent px-4 text-sm text-trato-ink outline-none placeholder:text-trato-muted [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-trato-blue text-white transition hover:bg-trato-blue-strong"
        >
          <Search className="size-4" />
        </button>
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-xl border border-trato-line bg-white py-2 shadow-[var(--shadow-float)] animate-fade-in">
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => submit(suggestion)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-trato-ink transition hover:bg-trato-blue-soft"
                  >
                    <Search className="size-4 text-trato-muted" />
                    <span className="line-clamp-1">{suggestion}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {recent.length > 0 && (
            <div className={cn("py-1", suggestions.length > 0 && "border-t border-trato-line")}>
              <div className="flex items-center justify-between px-4 py-1">
                <span className="text-xs font-bold uppercase tracking-wide text-trato-muted">Búsquedas recientes</span>
                <button type="button" onClick={clearQueries} className="text-xs font-semibold text-trato-blue hover:underline">
                  Borrar
                </button>
              </div>
              <ul>
                {recent.map((query) => (
                  <li key={query} className="group flex items-center">
                    <button
                      type="button"
                      onClick={() => submit(query)}
                      className="flex flex-1 items-center gap-3 px-4 py-2 text-left text-sm text-trato-ink transition hover:bg-trato-blue-soft"
                    >
                      <Clock className="size-4 text-trato-muted" />
                      <span className="line-clamp-1">{query}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar ${query}`}
                      onClick={() => removeQuery(query)}
                      className="mr-3 rounded-full p-1 text-trato-muted opacity-0 transition group-hover:opacity-100 hover:bg-black/5"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
