import {
  AlertTriangle,
  CheckCircle2,
  Map as MapIcon,
  Target,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/shared/components/page-header";

const MODEL = ["1", "2", "3", "4"] as const;
const PILOT = ["1", "2", "3", "4", "5"] as const;
const KPI = ["1", "2", "3", "4", "5", "6", "7"] as const;
const ROADMAP = ["1", "2", "3", "4"] as const;
const LIMITS = ["1", "2", "3", "4"] as const;

export function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="container-page flex flex-col gap-12 py-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid gap-6 md:grid-cols-2">
        <section
          className="flex flex-col gap-3 rounded-2xl border bg-card p-6"
          aria-labelledby="problem"
        >
          <h2 id="problem" className="text-2xl font-semibold">
            {t("problemTitle")}
          </h2>
          <p className="text-lg">{t("problemText")}</p>
        </section>
        <section
          className="flex flex-col gap-3 rounded-2xl border bg-card p-6"
          aria-labelledby="solution"
        >
          <h2 id="solution" className="text-2xl font-semibold">
            {t("solutionTitle")}
          </h2>
          <p className="text-lg">{t("solutionText")}</p>
        </section>
      </div>

      <section aria-labelledby="model" className="flex flex-col gap-4">
        <h2
          id="model"
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <Wallet className="size-6 text-primary" aria-hidden />
          {t("modelTitle")}
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {MODEL.map((key) => (
            <li
              key={key}
              className="flex flex-col gap-2 rounded-xl border bg-card p-5"
            >
              <h3 className="font-sans text-lg font-semibold text-foreground">
                {t(`model.${key}.title`)}
              </h3>
              <p className="text-muted-foreground">{t(`model.${key}.text`)}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground">{t("modelNote")}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="pilot"
          className="flex flex-col gap-4 rounded-2xl border bg-card p-6"
        >
          <h2
            id="pilot"
            className="flex items-center gap-2 text-2xl font-semibold"
          >
            <MapIcon className="size-6 text-primary" aria-hidden />
            {t("pilotTitle")}
          </h2>
          <ol className="flex flex-col gap-3">
            {PILOT.map((key) => (
              <li key={key} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {key}
                </span>
                <span className="pt-1">{t(`pilot.${key}`)}</span>
              </li>
            ))}
          </ol>
        </section>
        <section
          aria-labelledby="kpi"
          className="flex flex-col gap-4 rounded-2xl border bg-card p-6"
        >
          <h2
            id="kpi"
            className="flex items-center gap-2 text-2xl font-semibold"
          >
            <Target className="size-6 text-primary" aria-hidden />
            {t("kpiTitle")}
          </h2>
          <p className="font-semibold text-warning">{t("kpiNote")}</p>
          <ul className="flex flex-col gap-2">
            {KPI.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" aria-hidden />
                {t(`kpi.${key}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="roadmap" className="flex flex-col gap-4">
        <h2 id="roadmap" className="text-2xl font-semibold">
          {t("roadmapTitle")}
        </h2>
        <ol className="grid gap-4 md:grid-cols-4">
          {ROADMAP.map((key, index) => (
            <li
              key={key}
              className={
                index === 0
                  ? "rounded-xl border-2 border-primary bg-secondary/60 p-5"
                  : "rounded-xl border bg-card p-5"
              }
            >
              <h3 className="font-sans text-lg font-semibold text-foreground">
                {t(`roadmap.${key}.title`)}
              </h3>
              <p className="text-muted-foreground">
                {t(`roadmap.${key}.text`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="limits"
        className="flex flex-col gap-3 rounded-2xl border border-dashed border-warning/60 bg-warning-soft/40 p-6"
      >
        <h2
          id="limits"
          className="flex items-center gap-2 text-2xl font-semibold"
        >
          <AlertTriangle className="size-6 text-warning" aria-hidden />
          {t("limitsTitle")}
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-6">
          {LIMITS.map((key) => (
            <li key={key}>{t(`limits.${key}`)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
