"use client";

import { ClipboardList, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";

import { ALL, CategorySelect, CitySelect } from "@/modules/reference";
import { useSession } from "@/modules/session";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Link } from "@/shared/configs/i18/navigation";

import { useRequestsBoard } from "../model/queries/use-requests";
import { RequestCard } from "./RequestCard";

const LIMIT = 12;

export function RequestsBoard() {
  const t = useTranslations();
  const { role } = useSession();
  const [filters, setFilters] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      category: parseAsString,
      city: parseAsString,
      page: parseAsInteger.withDefault(1),
    },
    { history: "replace" },
  );
  const [q, setQ] = useState(filters.q);
  const board = useRequestsBoard({
    q: filters.q || undefined,
    category: filters.category ?? undefined,
    city: filters.city ?? undefined,
    page: filters.page,
    limit: LIMIT,
  });
  const total = board.data?.total ?? 0;

  return (
    <div className="container-page flex flex-col gap-8 py-8">
      <PageHeader
        title={t("requests.boardTitle")}
        subtitle={t("requests.boardSubtitle")}
        actions={
          role !== "SUPPLIER" ? (
            <Button asChild size="lg">
              <Link href="/requests/new">
                <ClipboardList aria-hidden />
                {t("requests.create")}
              </Link>
            </Button>
          ) : null
        }
      />
      <p className="text-sm text-muted-foreground">
        {t("requests.statusHelp")}
      </p>
      <form
        className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void setFilters({ q: q.trim(), page: 1 });
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="r-q">{t("common.search")}</Label>
          <Input
            id="r-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="r-category">{t("catalog.category")}</Label>
          <CategorySelect
            id="r-category"
            valueKey="slug"
            allowAll
            value={filters.category ?? ALL}
            onChange={(v) =>
              void setFilters({ category: v === ALL ? null : v, page: 1 })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="r-city">{t("requests.deliveryCity")}</Label>
          <CitySelect
            id="r-city"
            allowAll
            value={filters.city ?? ALL}
            onChange={(v) =>
              void setFilters({ city: v === ALL ? null : v, page: 1 })
            }
          />
        </div>
        <Button type="submit">
          <Search aria-hidden />
          {t("common.search")}
        </Button>
      </form>
      {board.isPending ? <LoadingBlock label={t("common.loading")} /> : null}
      {board.data && total === 0 ? (
        <EmptyState icon={<ClipboardList />} title={t("requests.emptyBoard")} />
      ) : null}
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {board.data?.items.map((request) => (
          <li key={request.id}>
            <RequestCard request={request} />
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
