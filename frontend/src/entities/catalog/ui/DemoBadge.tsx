import { FlaskConical } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export function DemoBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-dashed border-warning/60 bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning",
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
