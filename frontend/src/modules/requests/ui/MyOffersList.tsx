"use client";

import { useLocale, useTranslations } from "next-intl";

import { localizedName } from "@/entities/catalog";
import { OfferStatusBadge, RequestStatusBadge } from "@/entities/procurement";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib/format";

import { useMyOffers } from "../model/queries/use-requests";

export function MyOffersList() {
  const t = useTranslations();
  const locale = useLocale();
  const offers = useMyOffers();

  if (offers.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  if (!offers.data?.length) {
    return <EmptyState title={t("offers.mineEmpty")} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {offers.data.map((offer) => {
        const unit = t(`units.${offer.request.unit}`);

        return (
          <li key={offer.id}>
            <Link
              href={`/requests/${offer.request.id}`}
              className="grid gap-3 rounded-xl border bg-card p-5 hover:border-primary md:grid-cols-[2fr_1fr_1fr] md:items-center"
            >
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">
                  {offer.request.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {offer.request.buyer.name} ·{" "}
                  {localizedName(locale, offer.request.deliveryCity)} ·{" "}
                  {formatDate(locale, offer.request.desiredDate)}
                </span>
              </div>
              <span>
                {formatNumber(locale, offer.quantity)} {unit} ×{" "}
                {formatMoney(locale, offer.pricePerUnit)}
                <br />
                <span className="font-semibold">
                  {formatMoney(locale, offer.totalCost)}
                </span>
              </span>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <OfferStatusBadge status={offer.status} />
                <RequestStatusBadge status={offer.request.status} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
