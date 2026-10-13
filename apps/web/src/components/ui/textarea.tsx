import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-md border border-transparent bg-white px-3 py-2 text-sm text-trato-ink shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none transition placeholder:text-trato-muted focus-visible:border-trato-blue focus-visible:ring-2 focus-visible:ring-trato-blue/25 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
