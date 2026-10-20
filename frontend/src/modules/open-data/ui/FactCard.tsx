"use client";

import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { formatFact } from "../lib/format-fact";
import { type RegionFact, SOURCES } from "../model/constants/region-facts";

export function FactCard({
  fact,
  showWhy = true,
}: {
  fact: RegionFact;
  showWhy?: boolean;
}) {
  const t = useTranslations("openData");
  const locale = useLocale();
  const lang = locale === "kk" ? "kk" : "ru";
  const source = SOURCES[fact.sourceId];

  return (
    <article className="flex h-full flex-col gap-2 rounded-xl border bg-card p-5">
      <span className="w-fit rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
        {t("officialLabel")}
      </span>
      <h3 className="font-sans text-base font-semibold text-muted-foreground">
        {t(`indicators.${fact.key}.label`)}
      </h3>
      <p className="font-display text-3xl font-semibold text-forest-deep tabular-nums">
        {formatFact(locale, fact)}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("period")}: {fact.period[lang]}
      </p>
      {fact.note ? <p className="text-sm">{fact.note[lang]}</p> : null}
      {showWhy ? (
        <p className="mt-1 text-[0.95rem]">{t(`indicators.${fact.key}.why`)}</p>
      ) : null}
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary underline underline-offset-4"
      >
        {t("source")}: stat.gov.kz
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </article>
  );
}
