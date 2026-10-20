"use client";

import { Store, Tractor } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { safeNextPath } from "../lib/safe-next";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../model/constants/demo";
import { useLogin } from "../model/mutations/use-auth-mutations";

type DemoAccessProps = {
  next?: string | null;
  compact?: boolean;
};

/** Вход в демо-аккаунт одним нажатием — для показа жюри и тестирования. */
export function DemoAccess({ next, compact }: DemoAccessProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const login = useLogin();
  const errorMessage = useErrorMessage();

  const enter = (email: string) =>
    login.mutate(
      { email, password: DEMO_PASSWORD },
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
      email: DEMO_ACCOUNTS.buyer,
      icon: Store,
      title: t("demoBuyer"),
      text: t("demoBuyerText"),
    },
    {
      key: "supplier",
      email: DEMO_ACCOUNTS.supplier,
      icon: Tractor,
      title: t("demoSupplier"),
      text: t("demoSupplierText"),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className={compact ? "grid gap-3" : "grid gap-4 md:grid-cols-2"}>
        {accounts.map(({ key, email, icon: Icon, title, text }) => (
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
              onClick={() => enter(email)}
              disabled={login.isPending}
              aria-describedby={`demo-${key}-hint`}
            >
              {login.isPending && login.variables?.email === email
                ? "…"
                : title}
            </Button>
            <span id={`demo-${key}-hint`} className="sr-only">
              {text}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {t("demoPassword", { password: DEMO_PASSWORD })}. {t("demoDisclaimer")}
      </p>
    </div>
  );
}
