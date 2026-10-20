"use client";

import { useTranslations } from "next-intl";

import { useSession } from "../model/queries/use-session";
import { SampleAccess } from "./SampleAccess";

export function TryPage() {
  const t = useTranslations("auth");
  const { user } = useSession();

  return (
    <div className="container-page max-w-4xl py-12">
      <div className="mb-8 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold md:text-4xl">
          {t("sampleTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("sampleSubtitle")}</p>
        {user ? (
          <p className="rounded-md bg-secondary px-4 py-3 font-medium text-secondary-foreground">
            {t("currentAccount", { name: user.company?.name ?? user.name })}.{" "}
            {t("switchAccount")}:
          </p>
        ) : null}
      </div>
      <SampleAccess />
    </div>
  );
}
