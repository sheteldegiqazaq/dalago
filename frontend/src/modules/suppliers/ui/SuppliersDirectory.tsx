"use client";

import { Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";

import { SUPPLIER_COMPANY_TYPES } from "@/entities/catalog";
import { ALL, CategorySelect, CitySelect } from "@/modules/reference";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Link } from "@/shared/configs/i18/navigation";
import { useSuppliers } from "../model/queries/use-suppliers";
import type { CompaniesControllerSuppliersType } from "../model/types";
import { SupplierCard } from "./SupplierCard";

const LIMIT = 12;

export function SuppliersDirectory() {
  const t = useTranslations();
  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      city: parseAsString,
      category: parseAsString,
      type: parseAsString,
      page: parseAsInteger.withDefault(1),
    },
    { history: "replace" },
  );
  const [q, setQ] = useState(filters.q);
  const suppliers = useSuppliers({
    q: filters.q || undefined,
    city: filters.city ?? undefined,
    category: filters.category ?? undefined,
    type:
      (filters.type as CompaniesControllerSuppliersType | null) ?? undefined,
    page: filters.page,
    limit: LIMIT,
  });
  const total = suppliers.data?.total ?? 0;

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <PageHeader
        title={t("suppliers.title")}
        subtitle={t("suppliers.subtitle")}
        actions={
          <Button asChild variant="outline">
            <Link href="/map">{t("nav.map")}</Link>
          </Button>
        }
      />
      <form
        className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void setFilters({ q: q.trim(), page: 1 });
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-q">{t("suppliers.searchLabel")}</Label>
          <Input
            id="s-q"
            type="search"
            value={q}
            placeholder={t("suppliers.searchPlaceholder")}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-city">{t("catalog.city")}</Label>
          <CitySelect
            id="s-city"
            allowAll
            value={filters.city ?? ALL}
            onChange={(v) =>
              void setFilters({ city: v === ALL ? null : v, page: 1 })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-category">{t("catalog.category")}</Label>
          <CategorySelect
            id="s-category"
            valueKey="slug"
            allowAll
            value={filters.category ?? ALL}
            onChange={(v) =>
              void setFilters({ category: v === ALL ? null : v, page: 1 })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="s-type">{t("suppliers.type")}</Label>
          <Select
            value={filters.type ?? ALL}
            onValueChange={(v) =>
              void setFilters({ type: v === ALL ? null : v, page: 1 })
            }
          >
            <SelectTrigger id="s-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("common.all")}</SelectItem>
              {SUPPLIER_COMPANY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`companyTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">
          <Search aria-hidden />
          {t("common.search")}
        </Button>
      </form>

      <p className="font-semibold" aria-live="polite">
        {suppliers.isPending
          ? t("common.loading")
          : t("suppliers.found", { count: total })}
      </p>
      {suppliers.isPending ? (
        <LoadingBlock label={t("common.loading")} />
      ) : null}
      {suppliers.data && total === 0 ? (
        <EmptyState
          icon={<Users />}
          title={t("suppliers.emptyTitle")}
          text={t("suppliers.emptyText")}
        />
      ) : null}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.data?.items.map((supplier) => (
          <li key={supplier.id}>
            <SupplierCard supplier={supplier} />
          </li>
        ))}
      </ul>
      <Pagination
        page={filters.page}
        total={total}
        limit={LIMIT}
        labels={{
          previous: t("common.previous"),
          next: t("common.next"),
          status: t("common.page", {
            page: filters.page,
            pages: Math.max(1, Math.ceil(total / LIMIT)),
          }),
        }}
        onChange={(page) => void setFilters({ page })}
      />
    </div>
  );
}
