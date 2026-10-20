"use client";

import { MapPin, Package, Truck, Warehouse } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  CategoryVisual,
  localizedName,
  localizedTitle,
  SampleBadge,
} from "@/entities/catalog";
import { Link } from "@/shared/configs/i18/navigation";
import { formatMoney, formatNumber } from "@/shared/lib/format";

import type { ProductCardData } from "../model/product.type";

export function ProductCard({ product }: { product: ProductCardData }) {
  const locale = useLocale();
  const t = useTranslations();
  const title = localizedTitle(locale, product);
  const unit = t(`units.${product.unit}`);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md focus-within:shadow-md">
      <div className="relative aspect-[16/9] overflow-hidden border-b">
        <CategoryVisual
          icon={product.category.icon}
          imageUrl={product.imageUrl}
          alt={title}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-md bg-card/95 px-2 py-0.5 text-xs font-semibold text-foreground shadow-sm">
            {localizedName(locale, product.category)}
          </span>
        </div>
        {product.isSample ? (
          <SampleBadge
            label={t("common.sampleData")}
            className="absolute top-3 right-3 bg-card/95"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-sans text-lg leading-snug font-semibold text-foreground">
            <Link
              href={`/products/${product.id}`}
              className="rounded-sm after:absolute after:inset-0 hover:text-primary"
            >
              {title}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            {product.supplier.name}
          </p>
        </div>
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold text-forest-deep tabular-nums">
            {formatMoney(locale, product.price)}
          </span>
          <span className="text-muted-foreground">/ {unit}</span>
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Package className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("catalog.minOrder")}</dt>
            <dd>
              {t("catalog.minOrder")}:{" "}
              {formatNumber(locale, product.minOrderQty)} {unit}
            </dd>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Warehouse className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("catalog.available")}</dt>
            <dd>
              {product.availableQty > 0
                ? `${formatNumber(locale, product.availableQty)} ${unit}`
                : t("catalog.outOfStock")}
            </dd>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("product.location")}</dt>
            <dd>{localizedName(locale, product.city)}</dd>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="size-4 shrink-0" aria-hidden />
            <dt className="sr-only">{t("product.fulfillment")}</dt>
            <dd>
              {product.deliveryAvailable
                ? t("catalog.delivery")
                : t("catalog.pickup")}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
