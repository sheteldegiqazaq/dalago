"use client";

import { FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";

import { DEMO_MODE } from "@/modules/session";
import { Link } from "@/shared/configs/i18/navigation";

export function DemoBanner() {
  const t = useTranslations();

  if (!DEMO_MODE) {
    return null;
  }

  return (
    <div className="border-b border-warning/30 bg-warning-soft text-sm text-warning">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
        <FlaskConical className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">{t("common.demoNotice")}</span>
        <Link
          href="/demo"
          className="font-semibold underline underline-offset-4"
        >
          {t("nav.demo")}
        </Link>
      </div>
    </div>
  );
}
