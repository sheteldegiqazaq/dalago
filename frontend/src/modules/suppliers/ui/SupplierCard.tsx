"use client";

import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CategoryIcon, DemoBadge, localizedName } from "@/entities/catalog";
import { Link } from "@/shared/configs/i18/navigation";
import type { SupplierDto } from "../model/types";

export function SupplierCard({ supplier }: { supplier: SupplierDto }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <article className="relative flex h-full flex-col gap-3 rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-sans text-lg leading-snug font-semibold text-foreground">
            <Link
              href={`/suppliers/${supplier.id}`}
              className="after:absolute after:inset-0 hover:text-primary"
            >
              {supplier.name}
            </Link>
          </h3>
          <span className="text-sm text-muted-foreground">
            {t(`companyTypes.${supplier.type}`)}
          </span>
        </div>
        {supplier.isDemo ? <DemoBadge label={t("common.demoData")} /> : null}
      </div>
      <p className="flex items-center gap-1.5 text-muted-foreground">
        <MapPin className="size-4" aria-hidden />
        {localizedName(locale, supplier.city)}
      </p>
      {supplier.description ? (
        <p className="line-clamp-2 text-[0.95rem]">{supplier.description}</p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {supplier.categories.map((category) => (
          <span
            key={category.id}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm font-medium text-secondary-foreground"
          >
            <CategoryIcon icon={category.icon} className="size-4" />
            {localizedName(locale, category)}
          </span>
        ))}
        <span className="text-sm text-muted-foreground">
          {t("landing.productsCount", { count: supplier.productCount })}
        </span>
      </div>
    </article>
  );
}
