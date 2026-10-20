import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type StatTileProps = {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  className?: string;
};

export function StatTile({
  label,
  value,
  icon,
  hint,
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border bg-card p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon ? (
          <span className="text-primary [&_svg]:size-4">{icon}</span>
        ) : null}
        {label}
      </div>
      <div className="font-display text-3xl font-semibold text-forest-deep tabular-nums">
        {value}
      </div>
      {hint ? (
        <div className="text-sm text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
