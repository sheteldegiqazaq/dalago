"use client";

import { Award, CalendarClock, Check, MapPin, Phone, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { localizedName, localizedTitle } from "@/entities/catalog";
import { OfferStatusBadge } from "@/entities/procurement";
import { StartInquiryDialog } from "@/modules/inquiries";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/components/ui/button";
import { useErrorMessage } from "@/shared/hooks";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { useDecideOffer } from "../model/mutations/use-request-mutations";
import type { OfferDto, RequestDetailsDto } from "../model/types";

type Decision = { offer: OfferDto; decision: "accept" | "reject" } | null;

/** Сравнение предложений для автора заявки: цена, объём, доставка, срок, итог. */
export function OffersComparison({ request }: { request: RequestDetailsDto }) {
  const t = useTranslations();
  const locale = useLocale();
  const decide = useDecideOffer(request.id);
  const errorMessage = useErrorMessage();
  const [pending, setPending] = useState<Decision>(null);
  const isActive =
    request.status === "OPEN" || request.status === "OFFERS_RECEIVED";
  const unit = t(`units.${request.unit}`);
  const pendingOffers = request.offers.filter((o) => o.status === "PENDING");
  const bestPrice =
    pendingOffers.length > 1
      ? Math.min(...pendingOffers.map((o) => o.pricePerUnit))
      : null;

  if (request.offers.length === 0) {
    return <EmptyState title={t("offers.empty")} />;
  }

  const confirm = () => {
    if (!pending) return;

    decide.mutate(
      { offerId: pending.offer.id, decision: pending.decision },
      {
        onSuccess: () => {
          toast.success(
            pending.decision === "accept"
              ? t("offers.accepted")
              : t("offers.rejected"),
          );
          setPending(null);
        },
        onError: (error) => {
          toast.error(errorMessage(error));
          setPending(null);
        },
      },
    );
  };

  return (
    <>
      <p className="text-muted-foreground">{t("offers.compareHint")}</p>
      <ul className="flex flex-col gap-4">
        {request.offers.map((offer) => (
          <li
            key={offer.id}
            className={cn(
              "grid gap-4 rounded-xl border bg-card p-5 lg:grid-cols-[minmax(16rem,1.6fr)_repeat(4,minmax(0,1fr))] lg:items-start",
              offer.status === "ACCEPTED" &&
                "border-success ring-2 ring-success/30",
              offer.status === "REJECTED" && "opacity-70",
            )}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold">
                  {offer.supplier.name}
                </span>
                {bestPrice === offer.pricePerUnit &&
                offer.status === "PENDING" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-wheat-soft px-2 py-0.5 text-sm font-semibold text-accent-foreground">
                    <Award className="size-4" aria-hidden />
                    {t("offers.bestPrice")}
                  </span>
                ) : null}
              </div>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" aria-hidden />
                {localizedName(locale, offer.supplier.city)}
                <Phone className="ml-2 size-4" aria-hidden />
                <a
                  className="underline"
                  href={`tel:${offer.supplier.phone.replace(/\s/g, "")}`}
                >
                  {offer.supplier.phone}
                </a>
              </span>
              {offer.product ? (
                <span className="text-sm">
                  {localizedTitle(locale, offer.product)}
                </span>
              ) : null}
              <OfferStatusBadge status={offer.status} />
            </div>
            <dl className="contents">
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("offers.pricePerUnit")}
                </dt>
                <dd className="text-lg font-semibold">
                  {formatMoney(locale, offer.pricePerUnit)} / {unit}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("offers.quantity")}
                </dt>
                <dd className="font-semibold">
                  {formatNumber(locale, offer.quantity)} {unit}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">
                  {t("offers.deliveryCost")}
                </dt>
                <dd className="font-semibold">
                  {offer.deliveryCost != null
                    ? formatMoney(locale, offer.deliveryCost)
                    : t("offers.deliveryFree")}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarClock className="size-3.5" aria-hidden />
                  {t("offers.deliveryDate")}
                </dt>
                <dd className="font-semibold">
                  {formatDate(locale, offer.estimatedDeliveryDate)}
                </dd>
              </div>
            </dl>
            {offer.terms ? (
              <p className="text-[0.95rem] text-muted-foreground lg:col-span-full">
                {t("offers.terms")}: {offer.terms}
              </p>
            ) : null}
            <div className="flex flex-col gap-3 border-t pt-4 lg:col-span-full lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              <span className="font-display text-xl font-semibold text-forest-deep">
                {t("offers.total")}: {formatMoney(locale, offer.totalCost)}
              </span>
              {isActive && offer.status === "PENDING" ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setPending({ offer, decision: "accept" })}
                  >
                    <Check aria-hidden />
                    {t("offers.accept")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPending({ offer, decision: "reject" })}
                  >
                    <X aria-hidden />
                    {t("offers.reject")}
                  </Button>
                </div>
              ) : null}
              <StartInquiryDialog
                toCompanyId={offer.supplier.id}
                companyName={offer.supplier.name}
                requestId={request.id}
                defaultSubject={request.title}
                label={t("offers.contactSupplier")}
                loginNext={`/requests/${request.id}`}
              />
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.decision === "accept"
            ? t("offers.acceptConfirmTitle")
            : t("offers.rejectConfirmTitle")
        }
        description={
          pending
            ? `${pending.decision === "accept" ? `${t("offers.acceptConfirmText")} ` : ""}${pending.offer.supplier.name}: ${formatMoney(locale, pending.offer.totalCost)}`
            : undefined
        }
        confirmLabel={
          pending?.decision === "accept"
            ? t("offers.accept")
            : t("offers.reject")
        }
        cancelLabel={t("common.cancel")}
        destructive={pending?.decision === "reject"}
        pending={decide.isPending}
        onConfirm={confirm}
      />
    </>
  );
}
