"use client";

import { MapPin, Package, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { localizedName } from "@/entities/catalog";
import { useReference } from "@/modules/reference";
import { useCityStats } from "@/modules/suppliers";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";
import { cn } from "@/shared/lib/utils";

// Рамка схемы в градусах (запад–восток, юг–север) с небольшим запасом вокруг области Абай.
const BOUNDS = { minLon: 77.9, maxLon: 83.4, minLat: 46.3, maxLat: 51.3 };
const WIDTH = 640;
const HEIGHT = 520;
const V_LINES = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (i * WIDTH) / 10);
const H_LINES = [1, 2, 3, 4, 5, 6, 7].map((i) => (i * HEIGHT) / 8);

function project(lat: number, lon: number) {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * WIDTH;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT;

  return { x, y };
}

export function RegionalMapPage() {
  const t = useTranslations();
  const locale = useLocale();
  const reference = useReference();
  const stats = useCityStats();
  const [selected, setSelected] = useState<string>("semey");

  const cities = useMemo(() => {
    const byCity = new Map((stats.data ?? []).map((s) => [s.cityId, s]));

    return reference.cities
      .filter((city) => city.latitude != null && city.longitude != null)
      .map((city) => ({
        ...city,
        ...project(city.latitude as number, city.longitude as number),
        suppliers: byCity.get(city.id)?.suppliers ?? 0,
        products: byCity.get(city.id)?.products ?? 0,
      }));
  }, [reference.cities, stats.data]);

  const current = cities.find((city) => city.id === selected);

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <PageHeader title={t("map.title")} subtitle={t("map.subtitle")} />
      {reference.isLoading || stats.isPending ? (
        <LoadingBlock label={t("common.loading")} />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <figure className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full">
            <title>{t("map.title")}</title>
            <rect
              width={WIDTH}
              height={HEIGHT}
              rx="16"
              fill="var(--wheat-soft)"
            />
            {V_LINES.map((x) => (
              <line
                key={`v${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2={HEIGHT}
                stroke="var(--border)"
                strokeWidth="1"
              />
            ))}
            {H_LINES.map((y) => (
              <line
                key={`h${y}`}
                x1="0"
                y1={y}
                x2={WIDTH}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
              />
            ))}
            {cities.map((city) => {
              const active = city.id === selected;
              const radius = 8 + Math.min(city.suppliers, 5) * 3;

              return (
                // biome-ignore lint/a11y/useSemanticElements: SVG-группа как кнопка; дублируется списком кнопок справа
                <g
                  key={city.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  aria-label={`${localizedName(locale, city)}: ${t("map.suppliers", { count: city.suppliers })}`}
                  className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[var(--ring)]"
                  onClick={() => setSelected(city.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(city.id);
                    }
                  }}
                >
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={radius + 6}
                    fill="transparent"
                    stroke={active ? "var(--forest-deep)" : "transparent"}
                    strokeWidth="3"
                  />
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={radius}
                    fill={city.suppliers > 0 ? "var(--primary)" : "var(--card)"}
                    stroke="var(--primary)"
                    strokeWidth="2"
                  />
                  <text
                    x={city.x + radius + 12}
                    y={city.y + 5}
                    fontSize="15"
                    fontWeight={active ? 700 : 500}
                    fill="var(--foreground)"
                  >
                    {localizedName(locale, city)}
                  </text>
                </g>
              );
            })}
          </svg>
          <figcaption className="text-sm text-muted-foreground">
            {t("map.schematicNote")}
          </figcaption>
        </figure>

        <div className="flex flex-col gap-5">
          {current ? (
            <section
              aria-live="polite"
              className="flex flex-col gap-3 rounded-2xl border-2 border-primary/30 bg-card p-5"
            >
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                <MapPin className="size-6 text-primary" aria-hidden />
                {localizedName(locale, current)}
              </h2>
              <p className="flex items-center gap-2 text-lg">
                <Users className="size-5 text-primary" aria-hidden />
                {t("map.suppliers", { count: current.suppliers })}
              </p>
              <p className="flex items-center gap-2 text-lg">
                <Package className="size-5 text-primary" aria-hidden />
                {t("map.products", { count: current.products })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link
                    href={{
                      pathname: "/suppliers",
                      query: { city: current.id },
                    }}
                  >
                    {t("map.openSuppliers")}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link
                    href={{ pathname: "/catalog", query: { city: current.id } }}
                  >
                    {t("map.openCatalog")}
                  </Link>
                </Button>
              </div>
            </section>
          ) : (
            <p>{t("map.selectCity")}</p>
          )}
          <section aria-labelledby="city-list" className="flex flex-col gap-2">
            <h2 id="city-list" className="text-lg font-semibold">
              {t("map.listTitle")}
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {cities.map((city) => (
                <li key={city.id}>
                  <button
                    type="button"
                    aria-pressed={city.id === selected}
                    onClick={() => setSelected(city.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left",
                      city.id === selected
                        ? "border-primary bg-secondary font-semibold"
                        : "bg-card hover:border-primary",
                    )}
                  >
                    <span>{localizedName(locale, city)}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {city.suppliers}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section
            aria-labelledby="regions-list"
            className="flex flex-col gap-2"
          >
            <h2 id="regions-list" className="text-lg font-semibold">
              {t("map.regionsTitle")}
            </h2>
            <ul className="flex flex-col gap-2">
              {reference.regions.map((region) => (
                <li
                  key={region.id}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5"
                >
                  <span>{localizedName(locale, region)}</span>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-sm font-semibold",
                      region.isActive
                        ? "bg-success-soft text-success"
                        : "border border-dashed text-muted-foreground",
                    )}
                  >
                    {region.isActive
                      ? t("map.regionActive")
                      : t("map.regionSoon")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
