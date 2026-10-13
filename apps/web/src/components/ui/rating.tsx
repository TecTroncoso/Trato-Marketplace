"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, count, size = 14, className }: { value: number; count?: number; size?: number; className?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rounded >= star;
          const half = !filled && rounded >= star - 0.5;
          return (
            <span key={star} className="relative inline-flex" style={{ width: size, height: size }}>
              <Star className="absolute inset-0 text-black/20" style={{ width: size, height: size }} />
              {(filled || half) && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: half ? size / 2 : size, height: size }}>
                  <Star className="text-trato-gold" fill="currentColor" style={{ width: size, height: size }} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-trato-muted">
          {count > 0 ? `(${count})` : "Sin opiniones"}
        </span>
      )}
    </div>
  );
}

export function RatingInput({
  value,
  onChange,
  size = 30,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}) {
  const [hover, setHover] = React.useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} estrellas`}
        >
          <Star
            className={cn(star <= active ? "text-trato-gold" : "text-black/20")}
            fill={star <= active ? "currentColor" : "none"}
            style={{ width: size, height: size }}
          />
        </button>
      ))}
    </div>
  );
}
