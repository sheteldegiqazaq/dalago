"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Field, fieldAria } from "@/shared/components/field";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Link, useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { safeNextPath } from "../lib/safe-next";
import { DEMO_MODE } from "../model/constants/demo";
import { useLogin } from "../model/mutations/use-auth-mutations";
import { DemoAccess } from "./DemoAccess";

export function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const login = useLogin();
  const errorMessage = useErrorMessage();

  const schema = z.object({
    email: z.email(t("validation.email")),
    password: z.string().min(1, t("validation.required")),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => {
        toast.success(t("auth.loggedIn"));
        router.push(safeNextPath(next));
      },
      onError: (error) =>
        form.setError("root", { message: errorMessage(error) }),
    }),
  );

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <section className="flex flex-col gap-6" aria-labelledby="login-title">
        <div className="flex flex-col gap-2">
          <h1 id="login-title" className="text-3xl font-semibold">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-muted-foreground">{t("auth.loginSubtitle")}</p>
        </div>
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <Field
            id="email"
            label={t("auth.email")}
            error={errors.email?.message}
          >
            <Input
              {...fieldAria("email", errors.email?.message)}
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
          </Field>
          <Field
            id="password"
            label={t("auth.password")}
            error={errors.password?.message}
          >
            <Input
              {...fieldAria("password", errors.password?.message)}
              type="password"
              autoComplete="current-password"
              {...form.register("password")}
            />
          </Field>
          {errors.root?.message ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 font-medium text-destructive"
            >
              {errors.root.message}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending ? t("common.loading") : t("auth.submitLogin")}
          </Button>
          <p className="text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t("nav.register")}
            </Link>
          </p>
        </form>
      </section>
      {DEMO_MODE ? (
        <section
          className="flex flex-col gap-4 rounded-2xl border bg-wheat-soft/60 p-6"
          aria-labelledby="demo-title"
        >
          <h2 id="demo-title" className="text-2xl font-semibold">
            {t("auth.demoTitle")}
          </h2>
          <p className="text-muted-foreground">{t("auth.demoSubtitle")}</p>
          <Separator />
          <DemoAccess next={next} />
        </section>
      ) : null}
    </div>
  );
}
