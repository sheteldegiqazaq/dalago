"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AiModeBadge } from "@/modules/catalog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useErrorMessage } from "@/shared/hooks";
import type { ListingDraftResponseDto } from "../model/types";

import { useListingDraft } from "../model/use-listing-data";

export function AiListingAssistant({
  onDraft,
}: {
  onDraft: (result: ListingDraftResponseDto) => void;
}) {
  const t = useTranslations("ai");
  const draft = useListingDraft();
  const errorMessage = useErrorMessage();
  const [text, setText] = useState("");
  const [result, setResult] = useState<ListingDraftResponseDto | null>(null);

  const submit = () =>
    draft.mutate(text.trim(), {
      onSuccess: (data) => {
        setResult(data);
        onDraft(data);
      },
    });

  return (
    <section
      aria-labelledby="ai-listing-title"
      className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-gradient-to-br from-secondary/70 to-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="ai-listing-title"
          className="flex items-center gap-2 font-sans text-xl font-semibold text-forest-deep"
        >
          <Sparkles className="size-5 text-primary" aria-hidden />
          {t("listingTitle")}
        </h2>
        {result ? <AiModeBadge mode={result.mode} /> : null}
      </div>
      <p className="text-muted-foreground">{t("listingSubtitle")}</p>
      <Label htmlFor="ai-listing-text">{t("listingLabel")}</Label>
      <Textarea
        id="ai-listing-text"
        rows={3}
        maxLength={1000}
        value={text}
        placeholder={t("listingPlaceholder")}
        className="bg-card"
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        onClick={submit}
        disabled={draft.isPending || text.trim().length < 5}
        className="w-fit"
        size="lg"
      >
        <Sparkles aria-hidden />
        {draft.isPending ? t("listingWorking") : t("listingButton")}
      </Button>
      <div aria-live="polite" className="flex flex-col gap-2">
        {draft.isError ? (
          <p role="alert" className="font-medium text-destructive">
            {errorMessage(draft.error)}
          </p>
        ) : null}
        {result ? (
          <>
            <p className="font-semibold text-success">{t("listingDone")}</p>
            {result.notice === "AI_UNAVAILABLE_FALLBACK" ? (
              <p className="text-warning">{t("fallbackNotice")}</p>
            ) : null}
            {result.missingFields.length > 0 ? (
              <p className="text-warning">
                {t("listingMissing", {
                  fields: result.missingFields
                    .map((field) =>
                      t.has(`fields.${field}`) ? t(`fields.${field}`) : field,
                    )
                    .join(", "),
                })}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
