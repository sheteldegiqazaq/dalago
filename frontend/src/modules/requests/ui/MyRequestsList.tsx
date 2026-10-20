"use client";

import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/shared/components/empty-state";
import { LoadingBlock } from "@/shared/components/loading-block";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/configs/i18/navigation";

import { useMyRequests } from "../model/queries/use-requests";
import { RequestCard } from "./RequestCard";

export function MyRequestsList() {
  const t = useTranslations();
  const requests = useMyRequests();

  if (requests.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  if (!requests.data?.length) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title={t("requests.mineEmpty")}
        action={
          <Button asChild>
            <Link href="/requests/new">{t("requests.create")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {requests.data.map((request) => (
        <li key={request.id}>
          <RequestCard request={request} />
        </li>
      ))}
    </ul>
  );
}
