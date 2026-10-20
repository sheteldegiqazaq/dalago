import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  text,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? <div className="text-primary [&_svg]:size-10">{icon}</div> : null}
      <h3 className="text-xl font-semibold">{title}</h3>
      {text ? <p className="max-w-xl text-muted-foreground">{text}</p> : null}
      {action ? (
        <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div>
      ) : null}
    </div>
  );
}
