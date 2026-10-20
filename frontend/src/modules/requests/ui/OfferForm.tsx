"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { localizedTitle } from "@/entities/catalog";
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
import { useErrorMessage } from "@/shared/hooks";
import { formatMoney, formatNumber, todayIso } from "@/shared/lib/format";
import { useSubmitOffer } from "../model/mutations/use-request-mutations";
import { useMyProductsForOffer } from "../model/queries/use-requests";
import type { OfferDto, RequestDetailsDto } from "../model/types";

const NONE = "none";

type OfferFormProps = {
  request: RequestDetailsDto;
  existing?: OfferDto;
  onDone?: () => void;
};

export function OfferForm({ request, existing, onDone }: OfferFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const submit = useSubmitOffer(request.id, existing?.id ?? null);
  const products = useMyProductsForOffer(true);
  const errorMessage = useErrorMessage();
  const unit = t(`units.${request.unit}`);

  const positive = (message: string) =>
    z
      .string()
      .trim()
      .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, message);

  const schema = z.object({
    quantity: positive(t("validation.positive")).refine(
      (v) => Number(v) <= request.quantity,
      t("validation.qtyExceeds", {
        max: `${formatNumber(locale, request.quantity)} ${unit}`,
      }),
    ),
    pricePerUnit: positive(t("validation.positive")),
    deliveryCost: z
      .string()
      .trim()
      .refine((v) => v === "" || Number(v) >= 0, t("validation.nonNegative")),
    estimatedDeliveryDate: z
      .string()
      .min(1, t("validation.required"))
      .refine((v) => v >= todayIso(), t("validation.dateFuture")),
    terms: z.string().max(1000, t("validation.maxLength", { max: 1000 })),
    productId: z.string(),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: String(existing?.quantity ?? request.quantity),
      pricePerUnit: existing ? String(existing.pricePerUnit) : "",
      deliveryCost:
        existing?.deliveryCost != null ? String(existing.deliveryCost) : "",
      estimatedDeliveryDate:
        existing?.estimatedDeliveryDate ??
        (request.desiredDate >= todayIso() ? request.desiredDate : todayIso(1)),
      terms: existing?.terms ?? "",
      productId: existing?.product?.id ?? NONE,
    },
  });
  const { errors } = form.formState;
  const quantity = Number(form.watch("quantity")) || 0;
  const price = Number(form.watch("pricePerUnit")) || 0;
  const delivery = Number(form.watch("deliveryCost")) || 0;

  const onSubmit = form.handleSubmit((values) =>
    submit.mutate(
      {
        quantity: Number(values.quantity),
        pricePerUnit: Number(values.pricePerUnit),
        deliveryCost:
          values.deliveryCost === "" ? null : Number(values.deliveryCost),
        estimatedDeliveryDate: values.estimatedDeliveryDate,
        terms: values.terms || null,
        productId: values.productId === NONE ? null : values.productId,
      },
      {
        onSuccess: () => {
          toast.success(
            existing ? t("offers.updatedOffer") : t("offers.submitted"),
          );
          onDone?.();
        },
        onError: (error) =>
          form.setError("root", { message: errorMessage(error) }),
      },
    ),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="o-qty"
          label={`${t("offers.quantity")}, ${unit}`}
          error={errors.quantity?.message}
        >
          <Input
            {...fieldAria("o-qty", errors.quantity?.message)}
            type="number"
            inputMode="decimal"
            min={0}
            {...form.register("quantity")}
          />
        </Field>
        <Field
          id="o-price"
          label={`${t("offers.pricePerUnit")}, ₸`}
          error={errors.pricePerUnit?.message}
        >
          <Input
            {...fieldAria("o-price", errors.pricePerUnit?.message)}
            type="number"
            inputMode="decimal"
            min={0}
            {...form.register("pricePerUnit")}
          />
        </Field>
        <Field
          id="o-delivery"
          label={`${t("offers.deliveryCost")}, ₸`}
          optionalLabel={t("common.optional")}
          error={errors.deliveryCost?.message}
        >
          <Input
            {...fieldAria("o-delivery", errors.deliveryCost?.message)}
            type="number"
            inputMode="decimal"
            min={0}
            {...form.register("deliveryCost")}
          />
        </Field>
        <Field
          id="o-date"
          label={t("offers.deliveryDate")}
          error={errors.estimatedDeliveryDate?.message}
        >
          <Input
            {...fieldAria("o-date", errors.estimatedDeliveryDate?.message)}
            type="date"
            min={todayIso()}
            {...form.register("estimatedDeliveryDate")}
          />
        </Field>
      </div>
      <Field
        id="o-product"
        label={t("offers.attachProduct")}
        optionalLabel={t("common.optional")}
      >
        <Controller
          control={form.control}
          name="productId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="o-product" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("offers.noProduct")}</SelectItem>
                {products.data?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {localizedTitle(locale, product)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <Field
        id="o-terms"
        label={t("offers.terms")}
        optionalLabel={t("common.optional")}
        error={errors.terms?.message}
      >
        <Textarea
          {...fieldAria("o-terms", errors.terms?.message)}
          rows={3}
          placeholder={t("offers.termsPlaceholder")}
          {...form.register("terms")}
        />
      </Field>
      <p
        className="rounded-lg bg-wheat-soft px-4 py-3 text-lg"
        aria-live="polite"
      >
        {t("offers.total")}:{" "}
        <span className="font-display font-semibold text-forest-deep">
          {formatMoney(locale, quantity * price + delivery)}
        </span>
      </p>
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
        disabled={submit.isPending}
        className="w-fit"
      >
        {submit.isPending
          ? t("offers.submitting")
          : existing
            ? t("common.save")
            : t("offers.submit")}
      </Button>
    </form>
  );
}
