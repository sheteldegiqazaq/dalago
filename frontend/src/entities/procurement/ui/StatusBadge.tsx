"use client";

import {
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Clock,
  EyeOff,
  Inbox,
  type LucideIcon,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

type Tone = "info" | "success" | "warning" | "muted" | "danger";

const TONES: Record<Tone, string> = {
  info: "bg-info-soft text-info border-info/30",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  muted: "bg-muted text-muted-foreground border-border",
  danger: "bg-red-50 text-destructive border-destructive/30",
};

const REQUEST: Record<string, { icon: LucideIcon; tone: Tone }> = {
  OPEN: { icon: CircleDashed, tone: "info" },
  OFFERS_RECEIVED: { icon: Inbox, tone: "warning" },
  ACCEPTED: { icon: CheckCircle2, tone: "success" },
  CLOSED: { icon: XCircle, tone: "muted" },
};

const OFFER: Record<string, { icon: LucideIcon; tone: Tone }> = {
  PENDING: { icon: Clock, tone: "warning" },
  ACCEPTED: { icon: CheckCircle2, tone: "success" },
  REJECTED: { icon: XCircle, tone: "muted" },
};

const PRODUCT: Record<string, { icon: LucideIcon; tone: Tone }> = {
  ACTIVE: { icon: CircleDot, tone: "success" },
  INACTIVE: { icon: EyeOff, tone: "muted" },
};

function Badge({
  icon: Icon,
  tone,
  label,
}: {
  icon: LucideIcon;
  tone: Tone;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-semibold whitespace-nowrap",
        TONES[tone],
      )}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </span>
  );
}

/** Статус всегда показан текстом и иконкой, а не только цветом. */
export function RequestStatusBadge({ status }: { status: string }) {
  const t = useTranslations("status.request");
  const config = REQUEST[status] ?? REQUEST.OPEN;

  return <Badge {...config} label={t(status)} />;
}

export function OfferStatusBadge({ status }: { status: string }) {
  const t = useTranslations("status.offer");
  const config = OFFER[status] ?? OFFER.PENDING;

  return <Badge {...config} label={t(status)} />;
}

export function ProductStatusBadge({ status }: { status: string }) {
  const t = useTranslations("status.product");
  const config = PRODUCT[status] ?? PRODUCT.ACTIVE;

  return <Badge {...config} label={t(status)} />;
}
