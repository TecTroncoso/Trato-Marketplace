import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-16 text-center", className)}>
      <div className="flex size-16 items-center justify-center rounded-full bg-black/[0.05]">
        <Icon className="size-8 text-trato-muted" />
      </div>
      <h3 className="text-lg font-semibold text-trato-ink">{title}</h3>
      {description && <p className="max-w-md text-sm text-trato-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
