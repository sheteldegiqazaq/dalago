"use client";

import { ArrowLeft, Phone, RefreshCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { localizedTitle } from "@/entities/catalog";
import { RequireAuth } from "@/modules/session";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Link } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

import { useReply } from "../model/mutations/use-inquiry-mutations";
import { useInquiry } from "../model/queries/use-inquiries";

function Thread({ id }: { id: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const inquiry = useInquiry(id);
  const reply = useReply(id);
  const errorMessage = useErrorMessage();
  const [message, setMessage] = useState("");

  if (inquiry.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  if (!inquiry.data) {
    return <EmptyState title={t("inquiries.notFound")} />;
  }

  const data = inquiry.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b pb-5">
        <h1 className="text-2xl font-semibold md:text-3xl">{data.subject}</h1>
        <p className="text-lg">{data.counterpart.name}</p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Phone className="size-4" aria-hidden />
          {t("common.phone")}:{" "}
          <a
            href={`tel:${data.counterpart.phone.replace(/\s/g, "")}`}
            className="underline"
          >
            {data.counterpart.phone}
          </a>
        </p>
        {data.product ? (
          <Link
            href={`/products/${data.product.id}`}
            className="w-fit text-primary underline underline-offset-4"
          >
            {t("inquiries.about", {
              title: localizedTitle(locale, data.product),
            })}
          </Link>
        ) : null}
        {data.request ? (
          <Link
            href={`/requests/${data.request.id}`}
            className="w-fit text-primary underline underline-offset-4"
          >
            {t("inquiries.aboutRequest", { title: data.request.title })}
          </Link>
        ) : null}
      </div>
      <ol className="flex flex-col gap-3" aria-live="polite">
        {data.messages.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-3",
              item.mine
                ? "self-end bg-primary text-primary-foreground"
                : "self-start border bg-card",
            )}
          >
            <span
              className={cn(
                "text-sm font-semibold",
                item.mine
                  ? "text-primary-foreground/85"
                  : "text-muted-foreground",
              )}
            >
              {item.mine ? t("inquiries.you") : item.authorName} ·{" "}
              {formatDateTime(locale, item.createdAt)}
            </span>
            <p className="whitespace-pre-line">{item.body}</p>
          </li>
        ))}
      </ol>
      <form
        className="flex flex-col gap-3 rounded-xl border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!message.trim()) return;
          reply.mutate(message.trim(), { onSuccess: () => setMessage("") });
        }}
      >
        <Label htmlFor="reply">{t("inquiries.reply")}</Label>
        <Textarea
          id="reply"
          rows={3}
          maxLength={2000}
          value={message}
          placeholder={t("inquiries.replyPlaceholder")}
          onChange={(event) => setMessage(event.target.value)}
        />
        {reply.isError ? (
          <p role="alert" className="text-destructive">
            {errorMessage(reply.error)}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={reply.isPending || !message.trim()}>
            {reply.isPending ? t("common.sending") : t("common.send")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => inquiry.refetch()}
          >
            <RefreshCw aria-hidden />
            {t("inquiries.refresh")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function InquiryThreadPage({ id }: { id: string }) {
  const t = useTranslations();

  return (
    <RequireAuth>
      <div className="container-page flex max-w-3xl flex-col gap-4 py-8">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/inquiries">
            <ArrowLeft aria-hidden />
            {t("inquiries.title")}
          </Link>
        </Button>
        <Thread id={id} />
      </div>
    </RequireAuth>
  );
}
