"use client";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Phone,
  ShieldQuestion,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { CategoryIcon, DemoBadge, localizedName } from "@/entities/catalog";
import { ProductCard } from "@/entities/product";
import { useProducts } from "@/modules/catalog";
import { StartInquiryDialog } from "@/modules/inquiries";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDate } from "@/shared/lib/format";

import { useSupplier } from "../model/queries/use-suppliers";

export function SupplierProfilePage({ id }: { id: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const supplier = useSupplier(id);
  const products = useProducts({ supplierId: id, sort: "newest", limit: 24 });

  if (supplier.isPending) {
    return (
      <div className="container-page py-10">
        <LoadingBlock label={t("common.loading")} />
      </div>
    );
  }

  if (!supplier.data) {
    return (
      <div className="container-page py-10">
        <EmptyState title={t("suppliers.notFound")} />
      </div>
    );
  }

  const s = supplier.data;

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/suppliers">
          <ArrowLeft aria-hidden />
          {t("nav.suppliers")}
        </Link>
      </Button>
      <section className="grid gap-6 rounded-2xl border bg-card p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
              {t(`companyTypes.${s.type}`)}
            </span>
            {s.isDemo ? <DemoBadge label={t("common.demoRecord")} /> : null}
          </div>
          <h1 className="text-3xl font-semibold md:text-4xl">{s.name}</h1>
          {s.description ? (
            <p className="max-w-2xl text-lg">{s.description}</p>
          ) : null}
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {localizedName(locale, s.city)}
              {s.address ? `, ${s.address}` : ""}
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="size-4" aria-hidden />
              <a
                href={`tel:${s.phone.replace(/\s/g, "")}`}
                className="underline"
              >
                {s.phone}
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              {t("common.since", { date: formatDate(locale, s.createdAt) })}
            </li>
          </ul>
          <div className="flex flex-wrap gap-2">
            {s.categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
              >
                <CategoryIcon
                  icon={category.icon}
                  className="size-4 text-primary"
                />
                {localizedName(locale, category)}
              </span>
            ))}
          </div>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <ShieldQuestion className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t("suppliers.verification")}
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <StartInquiryDialog
            toCompanyId={s.id}
            companyName={s.name}
            defaultSubject={s.name}
            label={t("suppliers.contact")}
            variant="default"
            loginNext={`/suppliers/${s.id}`}
          />
        </div>
      </section>

      <section
        aria-labelledby="supplier-products"
        className="flex flex-col gap-4"
      >
        <h2 id="supplier-products" className="text-2xl font-semibold">
          {t("suppliers.products")}
        </h2>
        {products.isPending ? (
          <LoadingBlock label={t("common.loading")} />
        ) : null}
        {products.data?.total === 0 ? (
          <EmptyState title={t("suppliers.noProducts")} />
        ) : null}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.data?.items.map((product) => (
            <li key={product.id} className="flex">
              <div className="flex w-full flex-col">
                <ProductCard product={product} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
