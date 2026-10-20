"use client";

import { LayoutDashboard, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { logout, SAMPLE_ACCESS_ENABLED, useSession } from "@/modules/session";
import { Button } from "@/shared/components/ui/button";
import { Link, usePathname, useRouter } from "@/shared/configs/i18/navigation";
import { cn } from "@/shared/lib/utils";

import { MAIN_NAV } from "../model/nav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: закрываем меню при переходе
  useEffect(() => setOpen(false), [pathname]);

  const onLogout = () => {
    logout();
    toast.success(t("auth.loggedOut"));
    router.push("/");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const authArea = user ? (
    <>
      <Button asChild variant="ghost">
        <Link href="/inquiries" aria-label={t("nav.messages")}>
          <MessageSquare aria-hidden />
          <span className="sr-only 2xl:not-sr-only">{t("nav.messages")}</span>
        </Link>
      </Button>
      <Button asChild>
        <Link href="/dashboard">
          <LayoutDashboard aria-hidden />
          {t("nav.dashboard")}
        </Link>
      </Button>
      <Button variant="outline" onClick={onLogout} aria-label={t("nav.logout")}>
        <LogOut aria-hidden />
        <span className="sr-only 2xl:not-sr-only">{t("nav.logout")}</span>
      </Button>
    </>
  ) : (
    <>
      <Button asChild variant="ghost">
        <Link href="/login">{t("nav.login")}</Link>
      </Button>
      {SAMPLE_ACCESS_ENABLED ? (
        <Button asChild>
          <Link href="/try">{t("nav.try")}</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href="/register">{t("nav.register")}</Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="container-page flex h-18 items-center gap-3 py-3">
        <Logo label={t("brand.name")} />
        <nav
          aria-label={t("nav.mainNavigation")}
          className="ml-2 hidden xl:block"
        >
          <ul className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li
                key={item.href}
                className={item.wideOnly ? "hidden 2xl:block" : undefined}
              >
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2.5 py-2 text-[0.95rem] font-medium whitespace-nowrap transition-colors hover:bg-muted",
                    isActive(item.href)
                      ? "bg-secondary text-secondary-foreground"
                      : "text-foreground/80",
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 xl:flex">{authArea}</div>
          <Button
            variant="outline"
            size="icon"
            className="2xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("nav.closeMenu") : t("nav.menu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </div>
      {open ? (
        <div id="mobile-menu" className="border-t bg-background 2xl:hidden">
          <nav
            aria-label={t("nav.mainNavigation")}
            className="container-page flex flex-col gap-1 py-4"
          >
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-3 text-lg font-medium hover:bg-muted",
                  isActive(item.href) && "bg-secondary",
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-4 xl:hidden">
              {authArea}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
