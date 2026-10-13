import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-transparent bg-white px-3 py-2 text-sm text-trato-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition placeholder:text-trato-muted focus-visible:border-trato-blue focus-visible:ring-2 focus-visible:ring-trato-blue/25 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
