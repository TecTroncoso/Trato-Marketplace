import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-black/[0.06] text-trato-muted",
        discount: "bg-trato-green text-white",
        shipping: "bg-trato-green-soft text-trato-green",
        hot: "bg-red-500 text-white",
        gold: "bg-trato-gold/25 text-yellow-800",
        blue: "bg-trato-blue-soft text-trato-blue",
        outline: "border border-trato-line bg-white text-trato-muted",
        new: "bg-trato-blue text-white",
        used: "bg-black/[0.08] text-trato-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
