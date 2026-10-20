import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex max-w-3xl flex-col gap-2">
        {eyebrow ? (
          <div className="text-sm font-semibold text-primary">{eyebrow}</div>
        ) : null}
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
