"use client";

import { LockKeyhole } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";

import { SAMPLE_ACCESS_ENABLED } from "../model/constants/sample-access";
import { useSession } from "../model/queries/use-session";
import { SampleAccess } from "./SampleAccess";

type RequireAuthProps = {
  allow?: "BUYER" | "SUPPLIER";
  children: ReactNode;
};

/**
 * Защита страниц на клиенте — для удобства. Настоящая проверка прав
 * всегда выполняется на бэкенде (JWT + роль + владелец ресурса).
 */
export function RequireAuth({ allow: role, children }: RequireAuthProps) {
  const t = useTranslations();
  const session = useSession();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  // usePathname из next/navigation содержит префикс языка — убираем его для ?next=
  const next = `${pathname.replace(/^\/(kk|ru)(?=\/|$)/, "") || "/"}${search ? `?${search}` : ""}`;

  if (session.isLoading) {
    return (
      <div className="container-page py-10">
        <LoadingBlock label={t("common.loading")} />
      </div>
    );
  }

  if (!session.user) {
    return (
      <div className="container-page flex max-w-3xl flex-col gap-6 py-12">
        <EmptyState
          icon={<LockKeyhole />}
          title={t("common.loginRequired")}
          text={t("common.loginRequiredText")}
          action={
            <Button asChild size="lg">
              <Link href={{ pathname: "/login", query: { next } }}>
                {t("nav.login")}
              </Link>
            </Button>
          }
        />
        {SAMPLE_ACCESS_ENABLED ? <SampleAccess next={next} /> : null}
      </div>
    );
  }

  if (role && session.role !== role) {
    return (
      <div className="container-page flex max-w-3xl flex-col gap-6 py-12">
        <EmptyState
          icon={<LockKeyhole />}
          title={t("common.forbiddenRole")}
          text={t("common.forbiddenRoleText", { role: t(`roles.${role}`) })}
        />
        {SAMPLE_ACCESS_ENABLED ? <SampleAccess next={next} compact /> : null}
      </div>
    );
  }

  return <>{children}</>;
}
