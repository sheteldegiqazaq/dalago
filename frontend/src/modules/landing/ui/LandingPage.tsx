"use client";

import {
  ArrowRight,
  ClipboardList,
  MessagesSquare,
  PackagePlus,
  Search,
  Sparkles,
  Store,
  Tractor,
  Trophy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

import { CategoryIcon, localizedName } from "@/entities/catalog";
import {
  FactCard,
  PopulationSplitBar,
  REGION_FACTS,
  useMarketplaceStats,
} from "@/modules/open-data";
import { useReference } from "@/modules/reference";
import { SAMPLE_ACCESS_ENABLED } from "@/modules/session";
import { SupplierCard, useSuppliers } from "@/modules/suppliers";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Link, useRouter } from "@/shared/configs/i18/navigation";

const STEPS = ["1", "2", "3"] as const;
const BUYER_ICONS = [Search, ClipboardList, Trophy];
const SUPPLIER_ICONS = [PackagePlus, MessagesSquare, Store];
const HIGHLIGHT_FACTS = ["population", "agri", "sme"];

export function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const reference = useReference();
  const stats = useMarketplaceStats();
  const suppliers = useSuppliers({ limit: 6 });
  const [query, setQuery] = useState("");

  const search = (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    // Длинная фраза — это задача для ИИ-поиска, короткая — обычный поиск по названию.
    const params =
      text.split(/\s+/).length >= 4
        ? { ai: text }
        : text
          ? { q: text }
          : undefined;
    router.push({ pathname: "/catalog", query: params });
  };

  return (
    <div className="flex flex-col">
      <section className="field-pattern border-b bg-gradient-to-b from-wheat-soft/70 to-background">
        <div className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <p className="w-fit rounded-full border border-primary/30 bg-card px-3 py-1 text-sm font-semibold text-primary">
              {t("landing.eyebrow")}
            </p>
            <h1 className="text-4xl leading-tight font-semibold md:text-5xl">
              {t("landing.title")}
            </h1>
            <p className="max-w-2xl text-lg text-foreground/80 md:text-xl">
              {t("landing.subtitle")}
            </p>
            <form
              onSubmit={search}
              className="flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm sm:flex-row"
              aria-label={t("landing.searchLabel")}
            >
              <label htmlFor="hero-search" className="sr-only">
                {t("landing.searchLabel")}
              </label>
              <Input
                id="hero-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("landing.searchPlaceholder")}
                className="h-12 border-0 text-lg shadow-none focus-visible:ring-0"
              />
              <Button type="submit" size="lg">
                <Search aria-hidden />
                {t("common.search")}
              </Button>
            </form>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden />
              {t("landing.aiHint")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/suppliers">
                  <Store aria-hidden />
                  {t("landing.findSuppliers")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-card">
                <Link href={SAMPLE_ACCESS_ENABLED ? "/try" : "/register"}>
                  <Tractor aria-hidden />
                  {t("landing.sellProducts")}
                </Link>
              </Button>
            </div>
          </div>

          <aside
            className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm"
            aria-labelledby="live-title"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="live-title"
                className="font-sans text-lg font-semibold text-forest-deep"
              >
                {t("landing.liveNow")}
              </h2>
              <span className="rounded-md border border-dashed border-warning/60 bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                {t("landing.statsLabel")}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {(
                [
                  ["suppliers", "statsSuppliers"],
                  ["activeProducts", "statsProducts"],
                  ["activeRequests", "statsRequests"],
                  ["citiesWithSuppliers", "statsCities"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="rounded-xl bg-muted/70 p-4">
                  <dd className="font-display text-3xl font-semibold text-forest-deep tabular-nums">
                    {stats.data ? stats.data[key] : "—"}
                  </dd>
                  <dt className="text-sm text-muted-foreground">
                    {t(`landing.${label}`)}
                  </dt>
                </div>
              ))}
            </dl>
            <p
              lang="kk"
              className="border-t pt-4 font-display text-lg text-primary"
            >
              {t("brand.taglineKk")}
            </p>
          </aside>
        </div>
      </section>

      <section
        className="container-page flex flex-col gap-5 py-12"
        aria-labelledby="categories-title"
      >
        <div className="flex items-end justify-between gap-3">
          <h2 id="categories-title" className="text-3xl font-semibold">
            {t("landing.categoriesTitle")}
          </h2>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            {t("landing.categoriesAll")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {reference.categories.map((category) => (
            <li key={category.id}>
              <Link
                href={{
                  pathname: "/catalog",
                  query: { category: category.slug },
                }}
                className="flex min-h-20 items-center gap-3 rounded-xl border bg-card p-4 font-semibold transition-colors hover:border-primary hover:bg-secondary/50"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <CategoryIcon icon={category.icon} className="size-6" />
                </span>
                {localizedName(locale, category)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y bg-card" aria-labelledby="how-title">
        <div className="container-page grid gap-10 py-12 md:grid-cols-2">
          <h2 id="how-title" className="sr-only">
            {t("landing.buyersTitle")} / {t("landing.suppliersTitle")}
          </h2>
          {(
            [
              ["buyers", BUYER_ICONS],
              ["suppliers", SUPPLIER_ICONS],
            ] as const
          ).map(([group, icons]) => (
            <div key={group} className="flex flex-col gap-5">
              <h3 className="text-2xl font-semibold">
                {t(`landing.${group}Title`)}
              </h3>
              <ol className="flex flex-col gap-4">
                {STEPS.map((step, index) => {
                  const Icon = icons[index];

                  return (
                    <li key={step} className="flex gap-4">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Icon className="size-6" aria-hidden />
                      </span>
                      <div>
                        <p className="text-lg font-semibold">
                          {step}. {t(`landing.${group}Steps.${step}.title`)}
                        </p>
                        <p className="text-muted-foreground">
                          {t(`landing.${group}Steps.${step}.text`)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section
        className="container-page flex flex-col gap-6 py-12"
        aria-labelledby="ai-title"
      >
        <div className="flex flex-col gap-2">
          <h2 id="ai-title" className="text-3xl font-semibold">
            {t("landing.aiTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("landing.aiSubtitle")}
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {(["Listing", "Search"] as const).map((kind) => (
            <article
              key={kind}
              className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-br from-secondary/60 to-card p-6"
            >
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                <Sparkles className="size-5 text-primary" aria-hidden />
                {t(`landing.ai${kind}Title`)}
              </h3>
              <blockquote className="rounded-lg border-l-4 border-wheat bg-card px-4 py-3 text-lg">
                {t(`landing.ai${kind}Example`)}
              </blockquote>
              <p className="text-muted-foreground">
                {t(`landing.ai${kind}Text`)}
              </p>
            </article>
          ))}
        </div>
        <Button asChild size="lg" className="w-fit">
          <Link
            href={{
              pathname: "/catalog",
              query: { ai: t("landing.aiSearchExample").replace(/[«»]/g, "") },
            }}
          >
            <Sparkles aria-hidden />
            {t("landing.aiTry")}
          </Link>
        </Button>
      </section>

      <section className="border-y bg-card" aria-labelledby="producers-title">
        <div className="container-page flex flex-col gap-5 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="producers-title" className="text-3xl font-semibold">
                {t("landing.producersTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("landing.producersSubtitle")}
              </p>
            </div>
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              {t("landing.producersAll")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.data?.items.map((supplier) => (
              <li key={supplier.id}>
                <SupplierCard supplier={supplier} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="container-page flex flex-col gap-6 py-12"
        aria-labelledby="data-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="data-title" className="text-3xl font-semibold">
              {t("landing.dataTitle")}
            </h2>
            <p className="text-muted-foreground">{t("landing.dataSubtitle")}</p>
          </div>
          <Link
            href="/open-data"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            {t("landing.dataMore")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {REGION_FACTS.filter((fact) =>
            HIGHLIGHT_FACTS.includes(fact.key),
          ).map((fact) => (
            <li key={fact.key}>
              <FactCard fact={fact} />
            </li>
          ))}
        </ul>
        <div className="rounded-xl border bg-card p-5">
          <PopulationSplitBar />
        </div>
      </section>

      <section
        className="bg-forest-deep text-primary-foreground"
        aria-labelledby="vision-title"
      >
        <div className="container-page flex flex-col gap-6 py-12">
          <h2
            id="vision-title"
            className="text-3xl font-semibold text-primary-foreground"
          >
            {t("landing.visionTitle")}
          </h2>
          <p className="max-w-3xl text-lg text-primary-foreground/85">
            {t("landing.visionText")}
          </p>
          <ol className="grid gap-3 md:grid-cols-4">
            {(["1", "2", "3", "4"] as const).map((step, index) => (
              <li
                key={step}
                className={
                  index === 0
                    ? "rounded-xl border-2 border-wheat bg-primary-foreground/10 p-4"
                    : "rounded-xl border border-primary-foreground/25 p-4"
                }
              >
                <span className="text-sm text-wheat">{step}</span>
                <p className="text-lg font-semibold">
                  {t(`landing.visionSteps.${step}`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="cta-title">
        <div className="flex flex-col items-start gap-4 rounded-2xl border-2 border-primary/30 bg-secondary/60 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="cta-title" className="text-2xl font-semibold">
              {t("landing.ctaTitle")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.ctaText")}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href={SAMPLE_ACCESS_ENABLED ? "/try" : "/register"}>
              {t("landing.ctaButton")}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
