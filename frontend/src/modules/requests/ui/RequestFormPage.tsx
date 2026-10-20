"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { UNITS } from "@/entities/catalog";
import { ALL, CategorySelect, CitySelect } from "@/modules/reference";
import { RequireAuth, useSession } from "@/modules/session";
import { Field, fieldAria } from "@/shared/components/field";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
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
import { useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { todayIso } from "@/shared/lib/format";

import {
  useCreateRequest,
  useUpdateRequest,
} from "../model/mutations/use-request-mutations";
import { useRequest } from "../model/queries/use-requests";

const optionalNumber = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (Number.isFinite(Number(v)) && Number(v) > 0),
      message,
    );

function RequestForm({ id }: { id?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useSession();
  const existing = useRequest(id ?? "", Boolean(id));
  const create = useCreateRequest();
  const update = useUpdateRequest(id ?? "");
  const errorMessage = useErrorMessage();
  const mutation = id ? update : create;

  const schema = z.object({
    title: z
      .string()
      .trim()
      .min(3, t("validation.minLength", { min: 3 }))
      .max(120, t("validation.maxLength", { max: 120 })),
    categoryId: z.string(),
    quantity: z
      .string()
      .trim()
      .refine(
        (v) => Number.isFinite(Number(v)) && Number(v) > 0,
        t("validation.positive"),
      ),
    unit: z.enum(UNITS),
    targetPrice: optionalNumber(t("validation.positive")),
    deliveryCityId: z.string().min(1, t("validation.required")),
    deliveryAddress: z
      .string()
      .max(200, t("validation.maxLength", { max: 200 })),
    desiredDate: z
      .string()
      .min(1, t("validation.required"))
      .refine((v) => v >= todayIso(), t("validation.dateFuture")),
    description: z.string().max(2000, t("validation.maxLength", { max: 2000 })),
  });
  type Values = z.infer<typeof schema>;

  const unitParam = params.get("unit");
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: params.get("title") ?? "",
      categoryId: params.get("categoryId") ?? "",
      quantity: params.get("quantity") ?? "",
      unit: UNITS.includes(unitParam as (typeof UNITS)[number])
        ? (unitParam as (typeof UNITS)[number])
        : "KG",
      targetPrice: params.get("targetPrice") ?? "",
      deliveryCityId: params.get("city") ?? user?.company?.cityId ?? "semey",
      deliveryAddress: "",
      desiredDate: params.get("date") ?? todayIso(7),
      description: "",
    },
  });
  const { errors } = form.formState;

  useEffect(() => {
    const r = existing.data;

    if (id && r) {
      form.reset({
        title: r.title,
        categoryId: r.category?.id ?? "",
        quantity: String(r.quantity),
        unit: r.unit,
        targetPrice: r.targetPrice ? String(r.targetPrice) : "",
        deliveryCityId: r.deliveryCity.id,
        deliveryAddress: r.deliveryAddress ?? "",
        desiredDate: r.desiredDate,
        description: r.description ?? "",
      });
    }
  }, [id, existing.data, form]);

  if (id && existing.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate(
      {
        title: values.title,
        categoryId: values.categoryId || null,
        quantity: Number(values.quantity),
        unit: values.unit,
        targetPrice: values.targetPrice ? Number(values.targetPrice) : null,
        deliveryCityId: values.deliveryCityId,
        deliveryAddress: values.deliveryAddress || null,
        desiredDate: values.desiredDate,
        description: values.description || null,
      },
      {
        onSuccess: (request) => {
          toast.success(id ? t("requests.updated") : t("requests.created"));
          router.push(`/requests/${request.id}`);
        },
        onError: (error) =>
          form.setError("root", { message: errorMessage(error) }),
      },
    ),
  );

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <Field
        id="title"
        label={t("requests.productTitle")}
        error={errors.title?.message}
      >
        <Input
          {...fieldAria("title", errors.title?.message)}
          placeholder={t("requests.productTitlePlaceholder")}
          {...form.register("title")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="categoryId"
          label={t("requests.category")}
          optionalLabel={t("common.optional")}
        >
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <CategorySelect
                id="categoryId"
                allowAll
                value={field.value || ALL}
                onChange={(v) => field.onChange(v === ALL ? "" : v)}
              />
            )}
          />
        </Field>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field
            id="quantity"
            label={t("requests.quantity")}
            error={errors.quantity?.message}
          >
            <Input
              {...fieldAria("quantity", errors.quantity?.message)}
              type="number"
              inputMode="decimal"
              min={0}
              {...form.register("quantity")}
            />
          </Field>
          <Field id="unit" label={t("requests.unit")}>
            <Controller
              control={form.control}
              name="unit"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="unit" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {t(`units.${unit}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
        <Field
          id="targetPrice"
          label={t("requests.targetPrice")}
          optionalLabel={t("common.optional")}
          error={errors.targetPrice?.message}
        >
          <Input
            {...fieldAria("targetPrice", errors.targetPrice?.message)}
            type="number"
            inputMode="decimal"
            min={0}
            {...form.register("targetPrice")}
          />
        </Field>
        <Field
          id="desiredDate"
          label={t("requests.desiredDate")}
          error={errors.desiredDate?.message}
        >
          <Input
            {...fieldAria("desiredDate", errors.desiredDate?.message)}
            type="date"
            min={todayIso()}
            {...form.register("desiredDate")}
          />
        </Field>
        <Field
          id="deliveryCityId"
          label={t("requests.deliveryCity")}
          error={errors.deliveryCityId?.message}
        >
          <Controller
            control={form.control}
            name="deliveryCityId"
            render={({ field }) => (
              <CitySelect
                id="deliveryCityId"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
        <Field
          id="deliveryAddress"
          label={t("requests.deliveryAddress")}
          optionalLabel={t("common.optional")}
          error={errors.deliveryAddress?.message}
        >
          <Input
            {...fieldAria("deliveryAddress", errors.deliveryAddress?.message)}
            autoComplete="street-address"
            {...form.register("deliveryAddress")}
          />
        </Field>
      </div>
      <Field
        id="description"
        label={t("requests.description")}
        optionalLabel={t("common.optional")}
        error={errors.description?.message}
      >
        <Textarea
          {...fieldAria("description", errors.description?.message)}
          rows={4}
          placeholder={t("requests.descriptionPlaceholder")}
          {...form.register("description")}
        />
      </Field>
      <p className="rounded-lg bg-muted p-4 text-muted-foreground">
        {t("requests.contactNote")}
      </p>
      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 font-medium text-destructive"
        >
          {errors.root.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending
            ? id
              ? t("common.saving")
              : t("requests.creating")
            : id
              ? t("common.save")
              : t("requests.create")}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => router.back()}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}

export function RequestFormPage({ id }: { id?: string }) {
  const t = useTranslations("requests");

  return (
    <RequireAuth allow="BUYER">
      <div className="container-page flex max-w-3xl flex-col gap-8 py-8">
        <PageHeader
          title={id ? t("editTitle") : t("newTitle")}
          subtitle={id ? undefined : t("newSubtitle")}
        />
        <RequestForm id={id} />
      </div>
    </RequireAuth>
  );
}
