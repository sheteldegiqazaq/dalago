"use client";

import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Pencil,
  Phone,
  Scale,
  Store,
  Wallet,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { CategoryIcon, DemoBadge, localizedName } from "@/entities/catalog";
import { OfferStatusBadge, RequestStatusBadge } from "@/entities/procurement";
import { StartInquiryDialog } from "@/modules/inquiries";
import { useSession } from "@/modules/session";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib/format";

import { useCloseRequest } from "../model/mutations/use-request-mutations";
import { useRequest } from "../model/queries/use-requests";
import { LifecycleSteps } from "./LifecycleSteps";
import { OfferForm } from "./OfferForm";
import { OffersComparison } from "./OffersComparison";

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-primary [&_svg]:size-5">{icon}</span>
      <div>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-lg font-semibold">{children}</dd>
      </div>
    </div>
  );
}

export function RequestDetailsPage({ id }: { id: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const session = useSession();
  const request = useRequest(id);
  const close = useCloseRequest(id);
  const errorMessage = useErrorMessage();
  const [confirmClose, setConfirmClose] = useState(false);
  const [editingOffer, setEditingOffer] = useState(false);

  if (request.isPending || session.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingBlock label={t("common.loading")} />
      </div>
    );
  }

  if (!request.data) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title={t("requests.notFound")}
          action={
            <Button asChild>
              <Link href="/requests">{t("nav.requests")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const r = request.data;
  const unit = t(`units.${r.unit}`);
  const isActive = r.status === "OPEN" || r.status === "OFFERS_RECEIVED";
  const myOffer = r.offers.find((offer) => offer.id === r.viewer.myOfferId);

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <Button asChild variant="ghost" className="w-fit">
        <Link href={r.viewer.isOwner ? "/dashboard?tab=requests" : "/requests"}>
          <ArrowLeft aria-hidden />
          {r.viewer.isOwner ? t("requests.mineTitle") : t("nav.requests")}
        </Link>
      </Button>

      <section className="flex flex-col gap-5 rounded-2xl border bg-card p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <RequestStatusBadge status={r.status} />
          {r.category ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground">
              <CategoryIcon icon={r.category.icon} className="size-4" />
              {localizedName(locale, r.category)}
            </span>
          ) : null}
          {r.isDemo ? <DemoBadge label={t("common.demoRecord")} /> : null}
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <h1 className="text-3xl font-semibold md:text-4xl">{r.title}</h1>
          {r.viewer.isOwner && isActive ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/requests/${r.id}/edit`}>
                  <Pencil aria-hidden />
                  {t("common.edit")}
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setConfirmClose(true)}>
                <XCircle aria-hidden />
                {t("requests.close")}
              </Button>
            </div>
          ) : null}
        </div>
        <LifecycleSteps status={r.status} />
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={<Scale />} label={t("requests.quantity")}>
            {formatNumber(locale, r.quantity)} {unit}
          </Fact>
          <Fact icon={<CalendarClock />} label={t("requests.desiredDate")}>
            {formatDate(locale, r.desiredDate)}
          </Fact>
          <Fact icon={<MapPin />} label={t("requests.deliveryCity")}>
            {localizedName(locale, r.deliveryCity)}
            {r.deliveryAddress ? `, ${r.deliveryAddress}` : ""}
          </Fact>
          <Fact icon={<Wallet />} label={t("requests.target")}>
            {r.targetPrice
              ? `${formatMoney(locale, r.targetPrice)} / ${unit}`
              : t("requests.noTarget")}
          </Fact>
        </dl>
        {r.description ? (
          <p className="text-lg whitespace-pre-line">{r.description}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-4 border-t pt-4">
          <span className="flex items-center gap-2">
            <Store className="size-5 text-primary" aria-hidden />
            <span className="text-muted-foreground">
              {t("requests.buyer")}:
            </span>
            <span className="font-semibold">{r.buyer.name}</span>
          </span>
          {r.buyer.phone ? (
            <span className="flex items-center gap-2">
              <Phone className="size-4 text-primary" aria-hidden />
              <a
                className="underline"
                href={`tel:${r.buyer.phone.replace(/\s/g, "")}`}
              >
                {r.buyer.phone}
              </a>
            </span>
          ) : null}
          {!r.viewer.isOwner && session.role === "SUPPLIER" ? (
            <StartInquiryDialog
              toCompanyId={r.buyer.id}
              companyName={r.buyer.name}
              requestId={r.id}
              defaultSubject={r.title}
              label={t("offers.contactBuyer")}
              loginNext={`/requests/${r.id}`}
            />
          ) : null}
        </div>
        {!isActive ? (
          <p className="text-muted-foreground">{t("requests.finalNote")}</p>
        ) : null}
      </section>

      {r.viewer.isOwner ? (
        <section aria-labelledby="offers-title" className="flex flex-col gap-4">
          <h2 id="offers-title" className="text-2xl font-semibold">
            {t("offers.title")} ·{" "}
            {t("requests.offerCount", { count: r.offers.length })}
          </h2>
          <OffersComparison request={r} />
        </section>
      ) : null}

      {myOffer ? (
        <section
          aria-labelledby="my-offer-title"
          className="flex flex-col gap-4 rounded-2xl border bg-card p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="my-offer-title" className="text-2xl font-semibold">
              {t("offers.myOffer")}
            </h2>
            <OfferStatusBadge status={myOffer.status} />
          </div>
          {editingOffer ? (
            <OfferForm
              request={r}
              existing={myOffer}
              onDone={() => setEditingOffer(false)}
            />
          ) : (
            <>
              <p className="text-lg">
                {formatNumber(locale, myOffer.quantity)} {unit} ×{" "}
                {formatMoney(locale, myOffer.pricePerUnit)}
                {myOffer.deliveryCost != null
                  ? ` + ${formatMoney(locale, myOffer.deliveryCost)}`
                  : ""}{" "}
                ={" "}
                <span className="font-display font-semibold text-forest-deep">
                  {formatMoney(locale, myOffer.totalCost)}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("offers.deliveryDate")}:{" "}
                {formatDate(locale, myOffer.estimatedDeliveryDate)}
                {myOffer.terms ? ` · ${myOffer.terms}` : ""}
              </p>
              {isActive && myOffer.status === "PENDING" ? (
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={() => setEditingOffer(true)}
                >
                  <Pencil aria-hidden />
                  {t("offers.editMine")}
                </Button>
              ) : null}
            </>
          )}
          <p className="text-sm text-muted-foreground">
            {t("requests.ownerOnlyOffers")}
          </p>
        </section>
      ) : null}

      {r.viewer.canOffer ? (
        <section
          aria-labelledby="offer-form-title"
          className="flex flex-col gap-4 rounded-2xl border-2 border-primary/30 bg-card p-6"
        >
          <div>
            <h2 id="offer-form-title" className="text-2xl font-semibold">
              {t("offers.formTitle")}
            </h2>
            <p className="text-muted-foreground">{t("offers.formSubtitle")}</p>
          </div>
          <OfferForm request={r} />
        </section>
      ) : null}

      {!session.user && isActive ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
          <p className="text-lg">{t("offers.loginToOffer")}</p>
          <Button asChild size="lg">
            <Link
              href={{
                pathname: "/login",
                query: { next: `/requests/${r.id}` },
              }}
            >
              {t("nav.login")}
            </Link>
          </Button>
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title={t("requests.closeConfirmTitle")}
        description={t("requests.closeConfirmText")}
        confirmLabel={t("requests.close")}
        cancelLabel={t("common.cancel")}
        destructive
        pending={close.isPending}
        onConfirm={() =>
          close.mutate(undefined, {
            onSuccess: () => {
              toast.success(t("requests.closed"));
              setConfirmClose(false);
            },
            onError: (error) => toast.error(errorMessage(error)),
          })
        }
      />
    </div>
  );
}
