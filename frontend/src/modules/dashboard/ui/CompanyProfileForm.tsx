"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CitySelect } from "@/modules/reference";
import { useSession } from "@/modules/session";
import { Field, fieldAria } from "@/shared/components/field";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useErrorMessage } from "@/shared/hooks";

import { useUpdateCompany } from "../model/mutations/use-dashboard-mutations";

export function CompanyProfileForm() {
  const t = useTranslations();
  const { user } = useSession();
  const update = useUpdateCompany();
  const errorMessage = useErrorMessage();
  const company = user?.company;

  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(2, t("validation.minLength", { min: 2 })),
    cityId: z.string().min(1, t("validation.required")),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s()-]{5,20}$/, t("validation.phone")),
    address: z.string().max(200, t("validation.maxLength", { max: 200 })),
    description: z.string().max(1000, t("validation.maxLength", { max: 1000 })),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      name: company?.name ?? "",
      cityId: company?.cityId ?? "semey",
      phone: company?.phone ?? "",
      address: company?.address ?? "",
      description: company?.description ?? "",
    },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    update.mutate(
      {
        name: values.name,
        cityId: values.cityId,
        phone: values.phone,
        address: values.address || null,
        description: values.description || null,
      },
      {
        onSuccess: () => toast.success(t("dashboard.profileSaved")),
        onError: (error) =>
          form.setError("root", { message: errorMessage(error) }),
      },
    ),
  );

  return (
    <form
      className="flex max-w-2xl flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
    >
      <p className="text-muted-foreground">
        {t("auth.companyType")}:{" "}
        <span className="font-semibold text-foreground">
          {company ? t(`companyTypes.${company.type}`) : "—"}
        </span>
      </p>
      <Field
        id="c-name"
        label={t("auth.companyName")}
        error={errors.name?.message}
      >
        <Input
          {...fieldAria("c-name", errors.name?.message)}
          {...form.register("name")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="c-city"
          label={t("auth.city")}
          error={errors.cityId?.message}
        >
          <Controller
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <CitySelect
                id="c-city"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field
          id="c-phone"
          label={t("auth.phone")}
          error={errors.phone?.message}
        >
          <Input
            {...fieldAria("c-phone", errors.phone?.message)}
            type="tel"
            {...form.register("phone")}
          />
        </Field>
      </div>
      <Field
        id="c-address"
        label={t("dashboard.address")}
        optionalLabel={t("common.optional")}
        error={errors.address?.message}
      >
        <Input
          {...fieldAria("c-address", errors.address?.message)}
          {...form.register("address")}
        />
      </Field>
      <Field
        id="c-description"
        label={t("auth.description")}
        optionalLabel={t("common.optional")}
        error={errors.description?.message}
      >
        <Textarea
          {...fieldAria("c-description", errors.description?.message)}
          rows={4}
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
      <Button
        type="submit"
        size="lg"
        className="w-fit"
        disabled={update.isPending}
      >
        {update.isPending ? t("common.saving") : t("common.save")}
      </Button>
    </form>
  );
}
