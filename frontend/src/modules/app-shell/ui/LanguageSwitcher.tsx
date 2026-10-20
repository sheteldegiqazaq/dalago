"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/shared/configs/i18/navigation";
import { cn } from "@/shared/lib/utils";

import { saveLanguagePreference } from "../model/save-language";

const LOCALES = [
  { code: "kk", label: "ҚАЗ", name: "Қазақша" },
  { code: "ru", label: "РУС", name: "Русский" },
] as const;

/** Выбор языка сохраняется в cookie (next-intl) и в профиле пользователя. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [pending, startTransition] = useTransition();

  const switchTo = (code: "kk" | "ru") => {
    if (code === locale) {
      return;
    }

    saveLanguagePreference(code);

    startTransition(() => {
      router.replace(`${pathname}${search ? `?${search}` : ""}`, {
        locale: code,
      });
    });
  };

  return (
    <fieldset
      className={cn("inline-flex rounded-lg border bg-card p-1", className)}
      aria-busy={pending}
    >
      <legend className="sr-only">{t("language")}</legend>
      {LOCALES.map(({ code, label, name }) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={locale === code}
          aria-label={name}
          onClick={() => switchTo(code)}
          className={cn(
            "min-h-9 min-w-12 rounded-md px-2.5 text-sm font-bold tracking-wide transition-colors",
            locale === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </fieldset>
  );
}
