"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { getApiErrorCode } from "@/shared/lib/client/api-error";

/** Переводит ошибку API в текст на текущем языке по стабильному коду. */
export function useErrorMessage() {
  const t = useTranslations("errors");

  return useCallback(
    (error: unknown) => {
      const code = getApiErrorCode(error);
      return t.has(code) ? t(code) : t("UNKNOWN");
    },
    [t],
  );
}
