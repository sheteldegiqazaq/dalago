"use client";

import {
  CheckCircle2,
  ClipboardList,
  Inbox,
  type LucideIcon,
  MessageSquare,
  Package,
  Send,
  XCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/shared/configs/i18/navigation";
import { formatDateTime } from "@/shared/lib/format";
import type { ActivityItemDto } from "../model/types";

const ICONS: Record<string, LucideIcon> = {
  REQUEST_CREATED: ClipboardList,
  OFFER_RECEIVED: Inbox,
  OFFER_SENT: Send,
  OFFER_ACCEPTED: CheckCircle2,
  OFFER_REJECTED: XCircle,
  PRODUCT_UPDATED: Package,
  MESSAGE_RECEIVED: MessageSquare,
};

function hrefFor(item: ActivityItemDto) {
  if (item.requestId) return `/requests/${item.requestId}`;
  if (item.inquiryId) return `/inquiries/${item.inquiryId}`;
  if (item.productId) return `/products/${item.productId}`;
  return "/dashboard";
}

/** Лента строится из реальных записей базы (заявки, предложения, сообщения), без выдуманных событий. */
export function ActivityFeed({ items }: { items: ActivityItemDto[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  if (items.length === 0) {
    return <p className="text-muted-foreground">{t("activityEmpty")}</p>;
  }

  return (
    <ol className="flex flex-col divide-y rounded-xl border bg-card">
      {items.map((item) => {
        const Icon = ICONS[item.type] ?? Package;

        return (
          <li key={`${item.type}-${item.at}-${item.title}`}>
            <Link
              href={hrefFor(item)}
              className="flex items-start gap-3 p-4 hover:bg-muted/60"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">
                  {t(`activity.${item.type}`, {
                    counterpart: item.counterpart ?? "",
                  })}
                </span>
                <span className="text-muted-foreground">{item.title}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(locale, item.at)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
