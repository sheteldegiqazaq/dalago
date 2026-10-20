"use client";

import { CalendarClock, MapPin, Scale, Store } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CategoryIcon, DemoBadge, localizedName } from "@/entities/catalog";
import { RequestStatusBadge } from "@/entities/procurement";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib/format";
import type { RequestListItemDto } from "../model/types";

export function RequestCard({ request }: { request: RequestListItemDto }) {
  const t = useTranslations();
  const locale = useLocale();
  const unit = t(`units.${request.unit}`);

  return (
    <article className="relative flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <RequestStatusBadge status={request.status} />
        {request.category ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground">
            <CategoryIcon icon={request.category.icon} className="size-4" />
            {localizedName(locale, request.category)}
          </span>
        ) : null}
        {request.isDemo ? <DemoBadge label={t("common.demoData")} /> : null}
      </div>
      <h3 className="font-sans text-lg leading-snug font-semibold text-foreground">
        <Link
          href={`/requests/${request.id}`}
          className="after:absolute after:inset-0 hover:text-primary"
        >
          {request.title}
        </Link>
      </h3>
      <dl className="grid gap-2 text-[0.95rem] sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-primary" aria-hidden />
          <dt className="sr-only">{t("requests.quantity")}</dt>
          <dd className="font-semibold">
            {formatNumber(locale, request.quantity)} {unit}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" aria-hidden />
          <dt className="sr-only">{t("requests.deadline")}</dt>
          <dd>{formatDate(locale, request.desiredDate)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" aria-hidden />
          <dt className="sr-only">{t("requests.deliveryTo")}</dt>
          <dd>{localizedName(locale, request.deliveryCity)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Store className="size-4 text-primary" aria-hidden />
          <dt className="sr-only">{t("requests.buyer")}</dt>
          <dd className="truncate">{request.buyer.name}</dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
        <span className="text-muted-foreground">
          {t("requests.target")}:{" "}
          <span className="font-semibold text-foreground">
            {request.targetPrice
              ? `${formatMoney(locale, request.targetPrice)} / ${unit}`
              : t("requests.noTarget")}
          </span>
        </span>
        <span className="font-semibold">
          {t("requests.offerCount", { count: request.offerCount })}
        </span>
      </div>
    </article>
  );
}
