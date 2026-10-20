import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { SampleDataBanner } from "./SampleDataBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t("skipToContent")}
      </a>
      <SampleDataBanner />
      <SiteHeader />
      <main id="main" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
