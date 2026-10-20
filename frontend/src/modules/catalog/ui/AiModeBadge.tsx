"use client";

import { Cpu, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

/** Честная пометка: работает ли модель Claude или резервные правила. */
export function AiModeBadge({
  mode,
}: {
  mode: "claude" | "rules" | undefined;
}) {
  const t = useTranslations("ai");

  if (!mode) {
    return null;
  }

  if (mode === "claude") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
        <Sparkles className="size-4" aria-hidden />
        {t("modeClaude")}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-warning/60 bg-warning-soft px-2.5 py-1 text-sm font-semibold text-warning"
        >
          <Cpu className="size-4" aria-hidden />
          {t("modeRules")}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        {t("modeRulesHint")}
      </TooltipContent>
    </Tooltip>
  );
}
