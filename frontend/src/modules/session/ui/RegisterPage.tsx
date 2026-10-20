"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Tractor } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  BUYER_COMPANY_TYPES,
  SUPPLIER_COMPANY_TYPES,
} from "@/entities/catalog";
import { CitySelect } from "@/modules/reference";
import { Field, fieldAria } from "@/shared/components/field";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Link, useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";

import { useRegister } from "../model/mutations/use-auth-mutations";

const PHONE = /^[+\d][\d\s()-]{5,20}$/;

export function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const register = useRegister();
  const errorMessage = useErrorMessage();

  const schema = z.object({
    role: z.enum(["BUYER", "SUPPLIER"]),
    name: z
      .string()
      .trim()
      .min(2, t("validation.minLength", { min: 2 })),
    email: z.email(t("validation.email")),
    password: z.string().min(8, t("validation.minLength", { min: 8 })),
    companyName: z
      .string()
      .trim()
      .min(2, t("validation.minLength", { min: 2 })),
    companyType: z.string().min(1, t("validation.required")),
    cityId: z.string().min(1, t("validation.required")),
    phone: z.string().trim().regex(PHONE, t("validation.phone")),
    description: z
      .string()
      .max(1000, t("validation.maxLength", { max: 1000 }))
      .optional(),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "BUYER",
      name: "",
      email: "",
      password: "",
      companyName: "",
      companyType: "CAFE",
      cityId: "semey",
      phone: "",
      description: "",
    },
  });
  const { errors } = form.formState;
  const role = form.watch("role");
  const companyTypes =
    role === "SUPPLIER" ? SUPPLIER_COMPANY_TYPES : BUYER_COMPANY_TYPES;

  const onSubmit = form.handleSubmit((values) =>
    register.mutate(
      {
        email: values.email,
        password: values.password,
        name: values.name,
        role: values.role,
        preferredLanguage: locale === "kk" ? "kk" : "ru",
        company: {
          name: values.companyName,
          type: values.companyType as (typeof SUPPLIER_COMPANY_TYPES)[number],
          cityId: values.cityId,
          phone: values.phone,
          description: values.description || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("auth.registered"));
          router.push("/dashboard");
        },
        onError: (error) =>
          form.setError("root", { message: errorMessage(error) }),
      },
    ),
  );

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">{t("auth.registerTitle")}</h1>
        <p className="text-muted-foreground">{t("auth.registerSubtitle")}</p>
      </div>
      <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-[0.95rem] font-semibold">
            {t("auth.role")}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  value: "BUYER",
                  icon: Store,
                  hint: t("roles.buyerHint"),
                  type: "CAFE",
                },
                {
                  value: "SUPPLIER",
                  icon: Tractor,
                  hint: t("roles.supplierHint"),
                  type: "FARM",
                },
              ] as const
            ).map(({ value, icon: Icon, hint, type }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-card p-4 has-focus-visible:outline-3 has-focus-visible:outline-ring",
                  role === value
                    ? "border-primary bg-secondary/60"
                    : "border-border",
                )}
              >
                <input
                  type="radio"
                  value={value}
                  className="sr-only"
                  checked={role === value}
                  onChange={() => {
                    form.setValue("role", value);
                    form.setValue("companyType", type);
                  }}
                />
                <Icon className="mt-0.5 size-6 text-primary" aria-hidden />
                <span className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {t(`roles.${value}`)}
                  </span>
                  <span className="text-sm text-muted-foreground">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="name" label={t("auth.name")} error={errors.name?.message}>
            <Input
              {...fieldAria("name", errors.name?.message)}
              autoComplete="name"
              {...form.register("name")}
            />
          </Field>
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
            hint={t("auth.passwordHint")}
            error={errors.password?.message}
          >
            <Input
              {...fieldAria("password", errors.password?.message, true)}
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </Field>
          <Field
            id="phone"
            label={t("auth.phone")}
            error={errors.phone?.message}
          >
            <Input
              {...fieldAria("phone", errors.phone?.message)}
              type="tel"
              autoComplete="tel"
              placeholder="+7 700 123 45 67"
              {...form.register("phone")}
            />
          </Field>
          <Field
            id="companyName"
            label={t("auth.companyName")}
            error={errors.companyName?.message}
          >
            <Input
              {...fieldAria("companyName", errors.companyName?.message)}
              autoComplete="organization"
              {...form.register("companyName")}
            />
          </Field>
          <Field
            id="companyType"
            label={t("auth.companyType")}
            error={errors.companyType?.message}
          >
            <Controller
              control={form.control}
              name="companyType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    {...fieldAria("companyType", errors.companyType?.message)}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`companyTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field
            id="cityId"
            label={t("auth.city")}
            error={errors.cityId?.message}
          >
            <Controller
              control={form.control}
              name="cityId"
              render={({ field }) => (
                <CitySelect
                  id="cityId"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>
        </div>
        <Field
          id="description"
          label={t("auth.description")}
          optionalLabel={t("common.optional")}
          error={errors.description?.message}
        >
          <Textarea
            {...fieldAria("description", errors.description?.message)}
            rows={3}
            {...form.register("description")}
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
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={register.isPending}>
            {register.isPending
              ? t("common.loading")
              : t("auth.submitRegister")}
          </Button>
          <p className="text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              {t("nav.login")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
