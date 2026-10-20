"use client";

import { ClipboardList, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ProductCard } from "@/entities/product";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Link } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";

import { intentToFilters } from "../lib/intent";
import { useProducts } from "../model/queries/use-products";
import {
  type CatalogFilterValues,
  SORTS,
  useCatalogFilters,
} from "../model/use-catalog-filters";
import { AiSearchPanel } from "./AiSearchPanel";
import { CatalogFilters } from "./CatalogFilters";

const LIMIT = 12;
const SORT_LABELS = {
  relevance: "sortRelevance",
  price_asc: "sortPriceAsc",
  price_desc: "sortPriceDesc",
  newest: "sortNewest",
} as const;

export function CatalogPage() {
  const t = useTranslations();
  const errorMessage = useErrorMessage();
  const [filters, setFilters] = useCatalogFilters();
  const [initialAi] = useState(filters.ai);
  const [showFilters, setShowFilters] = useState(false);

  const products = useProducts({
    q: [filters.q, filters.kw].filter(Boolean).join(" ") || undefined,
    category: filters.category ?? undefined,
    city: filters.city ?? undefined,
    region: filters.region ?? undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    quantity: filters.quantity ?? undefined,
    unit: filters.quantity ? (filters.unit ?? undefined) : undefined,
    delivery: filters.delivery || undefined,
    sort: filters.sort,
    page: filters.page,
    limit: LIMIT,
  });

  const update = (patch: Partial<CatalogFilterValues>) =>
    void setFilters({ ...patch, page: patch.page ?? 1, ai: null });

  const reset = () =>
    void setFilters({
      q: "",
      kw: null,
      category: null,
      city: null,
      region: null,
      minPrice: null,
      maxPrice: null,
      quantity: null,
      unit: null,
      delivery: false,
      sort: "relevance",
      page: 1,
      ai: null,
    });

  const total = products.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <PageHeader title={t("catalog.title")} subtitle={t("catalog.subtitle")} />
      <AiSearchPanel
        initialQuery={initialAi}
        onResult={(result) =>
          update(intentToFilters(result.intent, result.relaxed))
        }
      />

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="lg:hidden"
            aria-expanded={showFilters}
            aria-controls="catalog-filters"
            onClick={() => setShowFilters((value) => !value)}
          >
            <SlidersHorizontal aria-hidden />
            {t("catalog.openFilters")}
          </Button>
          <div
            id="catalog-filters"
            className={showFilters ? "block" : "hidden lg:block"}
          >
            <h2 className="mb-4 hidden font-sans text-lg font-semibold lg:block">
              {t("catalog.filters")}
            </h2>
            <CatalogFilters
              values={filters}
              onChange={update}
              onReset={reset}
            />
          </div>
        </aside>

        <section
          className="flex flex-col gap-5"
          aria-labelledby="results-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="results-title"
              className="font-sans text-lg font-semibold"
              aria-live="polite"
            >
              {products.isPending
                ? t("common.loading")
                : t("catalog.found", { count: total })}
            </h2>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("catalog.sort")}
              </label>
              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  update({ sort: value as (typeof SORTS)[number] })
                }
              >
                <SelectTrigger id="sort" className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((sort) => (
                    <SelectItem key={sort} value={sort}>
                      {t(`catalog.${SORT_LABELS[sort]}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {filters.kw ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
                {t("catalog.aiKeywords", {
                  value: filters.kw.split(" ").join(", "),
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update({ kw: null })}
              >
                <X aria-hidden />
                {t("catalog.removeAiKeywords")}
              </Button>
            </div>
          ) : null}

          {products.isPending ? (
            <LoadingBlock rows={3} label={t("common.loading")} />
          ) : null}
          {products.isError ? (
            <EmptyState
              title={t("common.error")}
              text={errorMessage(products.error)}
              action={
                <Button onClick={() => products.refetch()}>
                  {t("common.retry")}
                </Button>
              }
            />
          ) : null}
          {products.data && total === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title={t("catalog.emptyTitle")}
              text={t("catalog.emptyText")}
              action={
                <>
                  <Button asChild>
                    <Link href="/requests/new">
                      <ClipboardList aria-hidden />
                      {t("catalog.emptyCreateRequest")}
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    {t("catalog.clearFilters")}
                  </Button>
                </>
              }
            />
          ) : null}
          {products.data && total > 0 ? (
            <ul
              className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${products.isPlaceholderData ? "opacity-60" : ""}`}
            >
              {products.data.items.map((product) => (
                <li key={product.id} className="flex">
                  <div className="flex w-full flex-col">
                    <ProductCard product={product} />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <Pagination
            page={filters.page}
            total={total}
            limit={LIMIT}
            labels={{
              previous: t("common.previous"),
              next: t("common.next"),
              status: t("common.page", { page: filters.page, pages }),
            }}
            onChange={(page) => {
              void setFilters({ page });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>
      </div>
    </div>
  );
}
