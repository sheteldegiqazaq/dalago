"use client";

import { FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";

import { SAMPLE_ACCESS_ENABLED } from "@/modules/session";
import { Link } from "@/shared/configs/i18/navigation";

export function SampleDataBanner() {
  const t = useTranslations();

  if (!SAMPLE_ACCESS_ENABLED) {
    return null;
  }

  return (
    <div className="border-b border-warning/30 bg-warning-soft text-sm text-warning">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
        <FlaskConical className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">{t("common.sampleNotice")}</span>
        <Link
          href="/try"
          className="font-semibold underline underline-offset-4"
        >
          {t("nav.try")}
        </Link>
      </div>
    </div>
  );
}
