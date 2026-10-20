"use client";

import { useLocale, useTranslations } from "next-intl";

import { formatNumber } from "@/shared/lib/format";

import { POPULATION_SPLIT } from "../model/constants/region-facts";

// Палитра проверена валидатором dataviz (CVD ΔE 19.4); пшеничный ниже 3:1 к фону,
// поэтому у сегментов всегда видимые подписи и легенда.
const URBAN = "#1f7a4d";
const RURAL = "#d4a85a";

/** Одна сегментированная полоса: город и село, с подписями и легендой (цвет не единственный носитель смысла). */
export function PopulationSplitBar() {
  const locale = useLocale();
  const t = useTranslations("openData.split");
  const labels = {
    urban: t("urban"),
    rural: t("rural"),
    caption: t("caption"),
    thousand: t("thousand"),
  };
  const segments = [
    {
      key: "urban",
      label: labels.urban,
      share: POPULATION_SPLIT.urban,
      count: POPULATION_SPLIT.urbanThousand,
      color: URBAN,
    },
    {
      key: "rural",
      label: labels.rural,
      share: POPULATION_SPLIT.rural,
      count: POPULATION_SPLIT.ruralThousand,
      color: RURAL,
    },
  ];

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="font-semibold">{labels.caption}</figcaption>
      <div
        className="flex h-10 w-full gap-0.5 overflow-hidden rounded"
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${formatNumber(locale, s.share)}%`)
          .join(", ")}
      >
        {segments.map((segment, index) => (
          <div
            key={segment.key}
            title={`${segment.label}: ${formatNumber(locale, segment.share)}% (${formatNumber(locale, segment.count)} ${labels.thousand})`}
            className={index === 0 ? "rounded-l" : "rounded-r"}
            style={{ width: `${segment.share}%`, background: segment.color }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span
              className="size-3.5 rounded-sm"
              style={{ background: segment.color }}
              aria-hidden
            />
            <span className="text-foreground">
              {segment.label}:{" "}
              <span className="font-semibold tabular-nums">
                {formatNumber(locale, segment.share)}%
              </span>{" "}
              <span className="text-muted-foreground">
                ({formatNumber(locale, segment.count)} {labels.thousand})
              </span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
