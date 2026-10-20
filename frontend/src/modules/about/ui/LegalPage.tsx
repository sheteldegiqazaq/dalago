import { useTranslations } from "next-intl";

import { PageHeader } from "@/shared/components/page-header";

export function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const t = useTranslations("legal");

  return (
    <div className="container-page flex max-w-3xl flex-col gap-6 py-8">
      <PageHeader title={t(`${kind}Title`)} />
      <ol className="flex list-decimal flex-col gap-3 pl-6 text-lg">
        {(["1", "2", "3", "4"] as const).map((key) => (
          <li key={key}>{t(`${kind}.${key}`)}</li>
        ))}
      </ol>
    </div>
  );
}
