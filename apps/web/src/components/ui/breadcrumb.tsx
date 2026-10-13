import * as React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Ubicación" className={cn("flex flex-wrap items-center gap-1 text-xs text-trato-muted", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-trato-blue">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && "font-semibold text-trato-ink")}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="size-3" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
