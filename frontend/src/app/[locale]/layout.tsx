import { routing } from "@i18/routing";
import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";

import { AppShell } from "@/modules/app-shell";
import { Toaster } from "@/shared/components/ui";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryProvider } from "@/shared/providers";

import "@/styles/globals.css";

// cyrillic-ext содержит казахские буквы: ә ғ қ ң ө ұ ү һ
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2f5e43",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: { default: t("title"), template: "%s · DalaGo" },
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${lora.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <NuqsAdapter>
              <TooltipProvider delayDuration={200}>
                <Suspense>
                  <AppShell>{children}</AppShell>
                </Suspense>
              </TooltipProvider>
            </NuqsAdapter>
          </QueryProvider>
        </NextIntlClientProvider>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
