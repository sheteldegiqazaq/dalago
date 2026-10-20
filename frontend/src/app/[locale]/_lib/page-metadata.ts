import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

/** Заголовок вкладки на языке интерфейса: «Каталог · DalaGo». */
export function pageMetadata(key: string) {
  return async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale });

    return {
      title: key === "meta.title" ? { absolute: t("meta.title") } : t(key),
    };
  };
}
