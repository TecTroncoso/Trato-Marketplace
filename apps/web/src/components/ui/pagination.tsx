import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  hrefFor,
  className,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const windowSize = 2;
  const pages: number[] = [];
  for (let current = 1; current <= totalPages; current += 1) {
    if (current === 1 || current === totalPages || Math.abs(current - page) <= windowSize) {
      pages.push(current);
    }
  }

  return (
    <nav className={cn("flex items-center justify-center gap-1.5 py-8", className)} aria-label="Paginación">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "flex size-9 items-center justify-center rounded-md bg-white text-trato-blue shadow-[var(--shadow-card)] transition hover:bg-trato-blue-soft",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>
      {pages.map((item, index) => {
        const previous = pages[index - 1];
        const gap = previous !== undefined && item - previous > 1;
        return (
          <span key={item} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-trato-muted">…</span>}
            <Link
              href={hrefFor(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex size-9 items-center justify-center rounded-md bg-white text-sm font-semibold shadow-[var(--shadow-card)] transition",
                item === page ? "bg-trato-blue text-white" : "text-trato-blue hover:bg-trato-blue-soft",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "flex size-9 items-center justify-center rounded-md bg-white text-trato-blue shadow-[var(--shadow-card)] transition hover:bg-trato-blue-soft",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
