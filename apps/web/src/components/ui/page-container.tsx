import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pageContainerVariants = cva("mx-auto w-full px-3 sm:px-4", {
  variants: {
    width: {
      narrow: "max-w-[900px]",
      standard: "max-w-[1000px]",
      wide: "max-w-[1220px]",
      screen: "max-w-[1360px]",
      form: "max-w-md",
    },
    padding: {
      none: "",
      sm: "py-4",
      md: "py-6",
      lg: "py-10",
    },
  },
  defaultVariants: { width: "standard", padding: "md" },
});

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {}

export function PageContainer({ width, padding, className, ...props }: PageContainerProps) {
  return <div className={cn(pageContainerVariants({ width, padding }), className)} {...props} />;
}
