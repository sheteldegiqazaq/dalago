"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

const STEPS = ["OPEN", "OFFERS_RECEIVED", "ACCEPTED"] as const;

/** Наглядный жизненный цикл заявки; закрытая заявка показывается отдельно. */
export function LifecycleSteps({ status }: { status: string }) {
  const t = useTranslations("status.request");
  const current =
    status === "CLOSED" ? -1 : STEPS.indexOf(status as (typeof STEPS)[number]);

  if (status === "CLOSED") {
    return (
      <p className="rounded-lg border bg-muted px-4 py-3 font-medium text-muted-foreground">
        {t("CLOSED")}
      </p>
    );
  }

  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {STEPS.map((step, index) => {
        const done = index < current || status === "ACCEPTED";
        const active = index === current;

        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[0.95rem]",
              active &&
                "border-primary bg-secondary font-semibold text-secondary-foreground",
              done && !active && "bg-success-soft text-success",
              !done && !active && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                (done || active) &&
                  "border-transparent bg-primary text-primary-foreground",
              )}
            >
              {done && !active ? (
                <Check className="size-4" aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            {t(step)}
          </li>
        );
      })}
    </ol>
  );
}
