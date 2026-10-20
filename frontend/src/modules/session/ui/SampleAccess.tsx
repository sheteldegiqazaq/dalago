"use client";

import { Store, Tractor } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { safeNextPath } from "../lib/safe-next";
import { useSampleSession } from "../model/mutations/use-auth-mutations";

type SampleAccessProps = {
  next?: string | null;
  compact?: boolean;
};

/** Вход в общий аккаунт-пример одним нажатием — чтобы попробовать площадку без регистрации. */
export function SampleAccess({ next, compact }: SampleAccessProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const sampleSession = useSampleSession();
  const errorMessage = useErrorMessage();

  const enter = (role: "BUYER" | "SUPPLIER") =>
    sampleSession.mutate(
      { role },
      {
        onSuccess: () => {
          toast.success(t("loggedIn"));
          router.push(safeNextPath(next));
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    );

  const accounts = [
    {
      key: "buyer",
      role: "BUYER",
      icon: Store,
      title: t("sampleBuyer"),
      text: t("sampleBuyerText"),
    },
    {
      key: "supplier",
      role: "SUPPLIER",
      icon: Tractor,
      title: t("sampleSupplier"),
      text: t("sampleSupplierText"),
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className={compact ? "grid gap-3" : "grid gap-4 md:grid-cols-2"}>
        {accounts.map(({ key, role, icon: Icon, title, text }) => (
          <div
            key={key}
            className="flex flex-col gap-3 rounded-xl border bg-card p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-6" aria-hidden />
              </span>
              <span className="text-lg font-semibold">{title}</span>
            </div>
            {compact ? null : <p className="text-muted-foreground">{text}</p>}
            <Button
              size="lg"
              variant={key === "buyer" ? "default" : "outline"}
              onClick={() => enter(role)}
              disabled={sampleSession.isPending}
              aria-describedby={`sample-${key}-hint`}
            >
              {sampleSession.isPending && sampleSession.variables?.role === role
                ? "…"
                : title}
            </Button>
            <span id={`sample-${key}-hint`} className="sr-only">
              {text}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{t("sampleDisclaimer")}</p>
    </div>
  );
}
