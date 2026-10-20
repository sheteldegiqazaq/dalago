"use client";

import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Info,
  MapPin,
  Package,
  Store,
  Truck,
  Warehouse,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import {
  CategoryVisual,
  localizedDescription,
  localizedName,
  localizedTitle,
  SampleBadge,
} from "@/entities/catalog";
import { ProductStatusBadge } from "@/entities/procurement";
import { StartInquiryDialog } from "@/modules/inquiries";
import { useSession } from "@/modules/session";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDate, formatMoney, formatNumber } from "@/shared/lib/format";

import { useProduct } from "../model/queries/use-product";

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
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
      <span className="mt-0.5 text-primary [&_svg]:size-5">{icon}</span>
      <div className="flex flex-col">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-lg font-semibold">{children}</dd>
      </div>
    </div>
  );
}

export function ProductDetailsPage({ id }: { id: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const { role } = useSession();
  const product = useProduct(id);

  if (product.isPending) {
    return (
      <div className="container-page py-10">
        <LoadingBlock label={t("common.loading")} />
      </div>
    );
  }

  if (!product.data) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title={t("product.notFound")}
          action={
            <Button asChild>
              <Link href="/catalog">{t("nav.catalog")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const p = product.data;
  const title = localizedTitle(locale, p);
  const unit = t(`units.${p.unit}`);
  const requestQuery = {
    title,
    categoryId: p.category.id,
    quantity: String(p.minOrderQty),
    unit: p.unit,
  };

  return (
    <div className="container-page flex flex-col gap-6 py-8">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/catalog">
          <ArrowLeft aria-hidden />
          {t("nav.catalog")}
        </Link>
      </Button>

      {p.isOwner ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-secondary/60 p-4">
          <span className="font-medium">
            {t("product.ownerNote")}
            {p.status === "INACTIVE" ? ` — ${t("product.inactiveNote")}` : ""}
          </span>
          <Button asChild variant="outline">
            <Link href={`/dashboard/products/${p.id}/edit`}>
              {t("product.manage")}
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border">
            <CategoryVisual
              icon={p.category.icon}
              imageUrl={p.imageUrl}
              alt={title}
            />
          </div>
          <section aria-labelledby="desc-title" className="flex flex-col gap-2">
            <h2 id="desc-title" className="text-xl font-semibold">
              {t("product.description")}
            </h2>
            <p className="text-lg whitespace-pre-line">
              {localizedDescription(locale, p)}
            </p>
            {p.tags.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("product.tags")}: {p.tags.join(", ")}
              </p>
            ) : null}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
              {localizedName(locale, p.category)}
            </span>
            {p.isOwner ? <ProductStatusBadge status={p.status} /> : null}
            {p.isSample ? <SampleBadge label={t("common.sampleData")} /> : null}
          </div>
          <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-forest-deep">
              {formatMoney(locale, p.price)}
            </span>
            <span className="text-lg text-muted-foreground">
              {t("common.perUnit", { unit: t(`units.long.${p.unit}`) })}
            </span>
          </p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact icon={<Warehouse />} label={t("product.available")}>
              {p.availableQty > 0
                ? `${formatNumber(locale, p.availableQty)} ${unit}`
                : t("catalog.outOfStock")}
            </Fact>
            <Fact icon={<Package />} label={t("product.minOrder")}>
              {formatNumber(locale, p.minOrderQty)} {unit}
            </Fact>
            <Fact icon={<MapPin />} label={t("product.location")}>
              {localizedName(locale, p.city)}
            </Fact>
            <Fact icon={<Truck />} label={t("product.fulfillment")}>
              {[
                p.deliveryAvailable ? t("product.delivery") : null,
                p.pickupAvailable ? t("product.pickup") : null,
              ]
                .filter(Boolean)
                .join(", ") || t("product.noDelivery")}
            </Fact>
            <Fact icon={<CalendarClock />} label={t("product.updated")}>
              {formatDate(locale, p.updatedAt)}
            </Fact>
          </dl>

          <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <Store className="size-6 text-primary" aria-hidden />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  {t("product.supplier")}
                </span>
                <Link
                  href={`/suppliers/${p.supplier.id}`}
                  className="text-lg font-semibold hover:text-primary hover:underline"
                >
                  {p.supplier.name}
                </Link>
              </div>
            </div>
            <p className="text-muted-foreground">
              {t(`companyTypes.${p.supplier.type}`)} ·{" "}
              {localizedName(locale, p.supplier.city)}
            </p>
            <div className="flex flex-wrap gap-3">
              <StartInquiryDialog
                toCompanyId={p.supplier.id}
                companyName={p.supplier.name}
                productId={p.id}
                defaultSubject={title}
                label={t("product.contactSupplier")}
                variant="default"
                loginNext={`/products/${p.id}`}
              />
              {role !== "SUPPLIER" ? (
                <Button asChild variant="outline" size="lg">
                  <Link
                    href={{ pathname: "/requests/new", query: requestQuery }}
                  >
                    <ClipboardList aria-hidden />
                    {t("product.createRequest")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <p className="flex gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {t("product.availabilityNote")}{" "}
              {p.isSample ? t("product.sampleNote") : ""}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
