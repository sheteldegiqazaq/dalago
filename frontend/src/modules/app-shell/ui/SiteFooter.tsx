import { useTranslations } from "next-intl";

import { Link } from "@/shared/configs/i18/navigation";

import { MAIN_NAV } from "../model/nav";
import { Logo } from "./Logo";

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="mt-16 border-t bg-forest-deep text-primary-foreground">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="w-fit rounded-lg bg-background px-3 py-2">
            <Logo label={t("brand.name")} />
          </div>
          <p className="max-w-sm text-primary-foreground/80">
            {t("footer.about")}
          </p>
          <p lang="kk" className="font-display text-lg text-wheat">
            {t("brand.taglineKk")}
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-base font-semibold text-primary-foreground">
            {t("footer.product")}
          </h2>
          <ul className="flex flex-col gap-2">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:underline"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-base font-semibold text-primary-foreground">
            {t("footer.info")}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/terms"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:underline"
              >
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:underline"
              >
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link
                href="/open-data"
                className="text-primary-foreground/80 hover:text-primary-foreground hover:underline"
              >
                {t("footer.dataSources")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-base font-semibold text-primary-foreground">
            {t("footer.contact")}
          </h2>
          <p className="text-primary-foreground/80">
            {t("footer.contactValue")}
          </p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-primary-foreground/70 md:flex-row md:justify-between">
          <span>{t("footer.rights")}</span>
          <span>{t("footer.statSource")}</span>
        </div>
      </div>
    </footer>
  );
}
