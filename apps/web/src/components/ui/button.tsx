"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-trato-blue/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.985]",
  {
    variants: {
      variant: {
        primary: "bg-trato-blue text-white shadow-sm hover:bg-trato-blue-strong",
        yellow: "bg-trato-yellow-strong text-trato-navy shadow-sm hover:brightness-95",
        outline: "border border-trato-blue/40 bg-white text-trato-blue hover:bg-trato-blue-soft",
        ghost: "text-trato-blue hover:bg-trato-blue-soft",
        subtle: "bg-black/[0.06] text-trato-ink hover:bg-black/[0.11]",
        danger: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-trato-green text-white hover:bg-green-700",
        link: "text-trato-blue underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { buttonVariants };
