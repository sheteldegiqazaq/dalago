"use client";

import { MessageSquare } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { DemoBadge, localizedTitle } from "@/entities/catalog";
import { RequireAuth } from "@/modules/session";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDateTime } from "@/shared/lib/format";

import { useInquiries } from "../model/queries/use-inquiries";

function InquiriesList() {
  const t = useTranslations();
  const locale = useLocale();
  const inquiries = useInquiries();

  return (
    <div className="container-page flex max-w-4xl flex-col gap-6 py-8">
      <PageHeader
        title={t("inquiries.title")}
        subtitle={t("inquiries.subtitle")}
      />
      {inquiries.isPending ? (
        <LoadingBlock label={t("common.loading")} />
      ) : null}
      {inquiries.data?.length === 0 ? (
        <EmptyState icon={<MessageSquare />} title={t("inquiries.empty")} />
      ) : null}
      <ul className="flex flex-col gap-3">
        {inquiries.data?.map((inquiry) => (
          <li key={inquiry.id}>
            <Link
              href={`/inquiries/${inquiry.id}`}
              className="flex flex-col gap-2 rounded-xl border bg-card p-5 hover:border-primary"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-lg font-semibold">
                  {inquiry.counterpart.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(locale, inquiry.updatedAt)}
                </span>
              </div>
              <span className="font-medium">{inquiry.subject}</span>
              {inquiry.product ? (
                <span className="text-sm text-muted-foreground">
                  {t("inquiries.about", {
                    title: localizedTitle(locale, inquiry.product),
                  })}
                </span>
              ) : null}
              {inquiry.lastMessage ? (
                <p className="line-clamp-2 text-muted-foreground">
                  {inquiry.lastMessage}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  {t("inquiries.messages", { count: inquiry.messageCount })}
                </span>
                {inquiry.lastFromCounterpart ? (
                  <span className="rounded-md bg-info-soft px-2 text-sm font-semibold text-info">
                    {t("inquiries.newMessage")}
                  </span>
                ) : null}
                {inquiry.isDemo ? (
                  <DemoBadge label={t("common.demoData")} />
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InquiriesPage() {
  return (
    <RequireAuth>
      <InquiriesList />
    </RequireAuth>
  );
}
