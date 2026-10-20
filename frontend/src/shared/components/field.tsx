import type { ReactNode } from "react";

import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optionalLabel?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Подпись, подсказка и ошибка поля. Дочерний input должен получить
 * id, aria-invalid и aria-describedby через fieldAria().
 */
export function Field({
  id,
  label,
  hint,
  error,
  optionalLabel,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {optionalLabel ? (
          <span className="font-normal text-muted-foreground">
            ({optionalLabel})
          </span>
        ) : null}
      </Label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldAria(id: string, error?: string, hint?: boolean) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
  } as const;
}
