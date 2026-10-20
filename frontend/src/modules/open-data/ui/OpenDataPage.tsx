"use client";

import { Database, ExternalLink, FlaskConical } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { PageHeader } from "@/shared/components/page-header";
import { StatTile } from "@/shared/components/stat-tile";
import { formatDate } from "@/shared/lib/format";

import {
  ACCESSED_AT,
  DATASET_DIRECTORY,
  REGION_FACTS,
  SOURCES,
} from "../model/constants/region-facts";
import { useMarketplaceStats } from "../model/queries/use-marketplace-stats";
import { FactCard } from "./FactCard";
import { PopulationSplitBar } from "./PopulationSplitBar";

export function OpenDataPage() {
  const t = useTranslations();
  const locale = useLocale();
  const lang = locale === "kk" ? "kk" : "ru";
  const stats = useMarketplaceStats();

  return (
    <div className="container-page flex flex-col gap-10 py-8">
      <PageHeader
        title={t("openData.title")}
        subtitle={t("openData.subtitle")}
      />

      <section aria-labelledby="official-title" className="flex flex-col gap-5">
        <h2
          id="official-title"
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <Database className="size-6 text-primary" aria-hidden />
          {t("openData.officialLabel")}
        </h2>
        <div className="rounded-xl border bg-card p-5">
          <PopulationSplitBar />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGION_FACTS.map((fact) => (
            <li key={fact.key}>
              <FactCard fact={fact} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sources-title" className="flex flex-col gap-4">
        <h2 id="sources-title" className="text-2xl font-semibold">
          {t("openData.sourcesTitle")}
        </h2>
        <p className="text-muted-foreground">{t("openData.sourcesText")}</p>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] text-left">
            <thead className="border-b bg-muted/60 text-sm">
              <tr>
                <th scope="col" className="p-3 font-semibold">
                  {t("openData.source")}
                </th>
                <th scope="col" className="p-3 font-semibold">
                  {t("openData.published")}
                </th>
                <th scope="col" className="p-3 font-semibold">
                  {t("openData.integrationStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              {DATASET_DIRECTORY.map((dataset) => {
                const published = Object.values(SOURCES).find(
                  (s) => s.url === dataset.url,
                )?.published[lang];

                return (
                  <tr key={dataset.url} className="border-b last:border-0">
                    <td className="p-3">
                      <a
                        href={dataset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
                      >
                        {dataset.name[lang]}
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {published ?? "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          dataset.status === "manual"
                            ? "rounded-md bg-secondary px-2 py-0.5 text-sm font-semibold text-secondary-foreground"
                            : "rounded-md border border-dashed px-2 py-0.5 text-sm font-semibold text-muted-foreground"
                        }
                      >
                        {dataset.status === "manual"
                          ? t("openData.manual")
                          : t("openData.planned")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("openData.accessed")}: {formatDate(locale, ACCESSED_AT)}
        </p>
      </section>

      <section
        aria-labelledby="platform-title"
        className="flex flex-col gap-4 rounded-2xl border border-dashed border-warning/60 bg-warning-soft/40 p-6"
      >
        <h2
          id="platform-title"
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <FlaskConical className="size-6 text-warning" aria-hidden />
          {t("openData.platformTitle")}
        </h2>
        <p className="font-semibold text-warning">{t("openData.demoLabel")}</p>
        <p className="text-muted-foreground">{t("openData.platformText")}</p>
        {stats.data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label={t("landing.statsSuppliers")}
              value={stats.data.suppliers}
            />
            <StatTile
              label={t("landing.statsProducts")}
              value={stats.data.activeProducts}
            />
            <StatTile
              label={t("landing.statsRequests")}
              value={stats.data.activeRequests}
            />
            <StatTile
              label={t("landing.statsCities")}
              value={stats.data.citiesWithSuppliers}
            />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="method-title" className="flex flex-col gap-3">
        <h2 id="method-title" className="text-2xl font-semibold">
          {t("openData.methodTitle")}
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          {(["1", "2", "3"] as const).map((key) => (
            <li key={key}>{t(`openData.method.${key}`)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
