"use client";

import { ClipboardList, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { localizedName } from "@/entities/catalog";
import { useReference } from "@/modules/reference";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Link } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { formatDate, formatMoney } from "@/shared/lib/format";
import { intentToRequestQuery } from "../lib/intent";
import { useAiSearch } from "../model/mutations/use-ai-search";
import { useAiStatus } from "../model/queries/use-ai-status";
import type { AiSearchResponseDto } from "../model/types";
import { AiModeBadge } from "./AiModeBadge";

const EXAMPLES = {
  ru: [
    "Нужно 50 кг говядины для кафе в Семее до пятницы",
    "Картофель до 150 тенге за кг с доставкой в Семей",
  ],
  kk: [
    "Семейге 500 кг картоп жеткізетін өндірушілерді тап",
    "Үржардан бал керек",
  ],
};

type AiSearchPanelProps = {
  initialQuery?: string | null;
  onResult: (result: AiSearchResponseDto) => void;
};

export function AiSearchPanel({ initialQuery, onResult }: AiSearchPanelProps) {
  const t = useTranslations();
  const locale = useLocale();
  const reference = useReference();
  const status = useAiStatus();
  const search = useAiSearch();
  const errorMessage = useErrorMessage();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [result, setResult] = useState<{
    query: string;
    data: AiSearchResponseDto;
  } | null>(null);
  const autoRan = useRef(false);

  const run = (text: string) => {
    const trimmed = text.trim();

    if (trimmed.length < 3) {
      return;
    }

    search.mutate(trimmed, {
      onSuccess: (data) => {
        setResult({ query: trimmed, data });
        onResult(data);
      },
    });
  };

  // Запрос, пришедший с главной страницы (?ai=...), выполняем один раз.
  // biome-ignore lint/correctness/useExhaustiveDependencies: только при первом рендере
  useEffect(() => {
    if (initialQuery && !autoRan.current) {
      autoRan.current = true;
      run(initialQuery);
    }
  }, []);

  const intent = result?.data.intent;
  const category = intent?.categorySlug
    ? reference.categoryBySlug.get(intent.categorySlug)
    : undefined;
  const city = intent?.cityId
    ? reference.cityById.get(intent.cityId)
    : undefined;
  const region = intent?.regionId
    ? reference.regions.find((r) => r.id === intent.regionId)
    : undefined;
  const chips = intent
    ? [
        category
          ? localizedName(locale, category)
          : intent.keywords[0]
            ? t("ai.keywords", { value: intent.keywords[0] })
            : null,
        city
          ? localizedName(locale, city)
          : region
            ? localizedName(locale, region)
            : null,
        intent.quantity
          ? t("ai.quantity", {
              value: `${intent.quantity} ${intent.unit ? t(`units.${intent.unit}`) : ""}`,
            })
          : null,
        intent.maxPrice
          ? t("ai.maxPrice", {
              price: formatMoney(locale, intent.maxPrice).replace(" ₸", ""),
            })
          : null,
        intent.deliveryRequired ? t("ai.delivery") : null,
        intent.neededBy
          ? t("ai.neededBy", { date: formatDate(locale, intent.neededBy) })
          : null,
      ].filter((chip): chip is string => Boolean(chip))
    : [];
  const understoodNothing =
    Boolean(intent) && !intent?.categorySlug && intent?.keywords.length === 0;

  return (
    <section
      aria-labelledby="ai-search-title"
      className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-gradient-to-br from-secondary/70 to-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="ai-search-title"
          className="flex items-center gap-2 font-sans text-xl font-semibold text-forest-deep"
        >
          <Sparkles className="size-5 text-primary" aria-hidden />
          {t("ai.searchTitle")}
        </h2>
        <AiModeBadge mode={status.data?.mode} />
      </div>
      <form
        className="flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          run(query);
        }}
      >
        <label htmlFor="ai-query" className="sr-only">
          {t("ai.searchLabel")}
        </label>
        <Input
          id="ai-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("ai.searchPlaceholder")}
          className="h-12 bg-card text-base"
          maxLength={300}
        />
        <Button
          type="submit"
          size="lg"
          disabled={search.isPending || query.trim().length < 3}
        >
          <Sparkles aria-hidden />
          {search.isPending ? t("ai.searching") : t("ai.searchButton")}
        </Button>
      </form>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t("ai.examples")}:</span>
        {EXAMPLES[locale === "kk" ? "kk" : "ru"].map((example) => (
          <button
            key={example}
            type="button"
            className="rounded-full border bg-card px-3 py-1.5 text-left hover:border-primary hover:text-primary"
            onClick={() => {
              setQuery(example);
              run(example);
            }}
          >
            {example}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {search.isError ? (
          <p role="alert" className="font-medium text-destructive">
            {errorMessage(search.error)}
          </p>
        ) : null}
        {result ? (
          <>
            {result.data.notice === "AI_UNAVAILABLE_FALLBACK" ? (
              <p className="text-sm text-warning">{t("ai.fallbackNotice")}</p>
            ) : null}
            {understoodNothing ? (
              <p className="font-medium">{t("ai.noProduct")}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{t("ai.understood")}</span>
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md bg-card px-2.5 py-1 font-medium text-forest-deep shadow-xs"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
            {result.data.relaxed ? (
              <p className="text-warning">{t("ai.relaxed")}</p>
            ) : null}
            {!understoodNothing && result.data.total === 0 ? (
              <p>{t("ai.noResults")}</p>
            ) : null}
            {!understoodNothing && result.data.total === 0 ? (
              <Button asChild variant="default" className="w-fit">
                <Link
                  href={{
                    pathname: "/requests/new",
                    query: intentToRequestQuery(
                      result.query,
                      result.data,
                      category?.id,
                    ),
                  }}
                >
                  <ClipboardList aria-hidden />
                  {t("ai.createRequest")}
                </Link>
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
