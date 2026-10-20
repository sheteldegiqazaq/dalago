import { formatNumber } from "@/shared/lib/format";

import type { RegionFact } from "../model/constants/region-facts";

const UNIT_LABELS = {
  thousandPeople: { ru: "тыс. человек", kk: "мың адам" },
  percent: { ru: "%", kk: "%" },
  mlnTenge: { ru: "млн ₸", kk: "млн ₸" },
  units: { ru: "единиц", kk: "бірлік" },
} as const;

export function formatFact(
  locale: string,
  fact: Pick<RegionFact, "value" | "unit">,
) {
  const lang = locale === "kk" ? "kk" : "ru";
  const value = formatNumber(locale, fact.value);

  return fact.unit === "percent"
    ? `${value}%`
    : `${value} ${UNIT_LABELS[fact.unit][lang]}`;
}
