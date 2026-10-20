"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { UNITS } from "@/entities/catalog";
import { ProductCard } from "@/entities/product";
import { CategorySelect, CitySelect, useReference } from "@/modules/reference";
import { RequireAuth, useSession } from "@/modules/session";
import { Field, fieldAria } from "@/shared/components/field";
import { LoadingBlock } from "@/shared/components/loading-block";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { Link, useRouter } from "@/shared/configs/i18/navigation";
import { useErrorMessage } from "@/shared/hooks";
import { draftToForm, type ListingFormValues } from "../lib/draft-to-form";
import type { ListingDraftResponseDto } from "../model/types";
import { useEditableProduct, useSaveProduct } from "../model/use-listing-data";
import { AiListingAssistant } from "./AiListingAssistant";

function Editor({ id }: { id?: string }) {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useSession();
  const reference = useReference();
  const existing = useEditableProduct(id);
  const save = useSaveProduct(id);
  const errorMessage = useErrorMessage();
  const [draftMode, setDraftMode] = useState<"claude" | "rules" | null>(null);

  const isNumber = (v: string) => v.trim() !== "" && Number.isFinite(Number(v));
  const schema = z
    .object({
      title: z
        .string()
        .trim()
        .min(3, t("validation.minLength", { min: 3 }))
        .max(120, t("validation.maxLength", { max: 120 })),
      titleKk: z.string().max(120, t("validation.maxLength", { max: 120 })),
      description: z
        .string()
        .trim()
        .min(10, t("validation.minLength", { min: 10 }))
        .max(2000, t("validation.maxLength", { max: 2000 })),
      descriptionKk: z
        .string()
        .max(2000, t("validation.maxLength", { max: 2000 })),
      categoryId: z.string().min(1, t("validation.required")),
      price: z
        .string()
        .refine((v) => isNumber(v) && Number(v) > 0, t("validation.positive")),
      unit: z.enum(UNITS),
      availableQty: z
        .string()
        .refine(
          (v) => isNumber(v) && Number(v) >= 0,
          t("validation.nonNegative"),
        ),
      minOrderQty: z
        .string()
        .refine((v) => isNumber(v) && Number(v) > 0, t("validation.positive")),
      cityId: z.string().min(1, t("validation.required")),
      deliveryAvailable: z.boolean(),
      pickupAvailable: z.boolean(),
      imageUrl: z
        .string()
        .refine(
          (v) => v === "" || /^https?:\/\/\S+$/.test(v),
          t("validation.url"),
        ),
      tags: z.string().max(400),
    })
    .refine(
      (v) =>
        Number(v.availableQty) === 0 ||
        Number(v.minOrderQty) <= Number(v.availableQty),
      {
        message: t("validation.minOrderGtStock"),
        path: ["minOrderQty"],
      },
    )
    .refine((v) => v.deliveryAvailable || v.pickupAvailable, {
      message: t("validation.fulfillment"),
      path: ["pickupAvailable"],
    });

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      titleKk: "",
      description: "",
      descriptionKk: "",
      categoryId: "",
      price: "",
      unit: "KG",
      availableQty: "",
      minOrderQty: "",
      cityId: user?.company?.cityId ?? "semey",
      deliveryAvailable: false,
      pickupAvailable: true,
      imageUrl: "",
      tags: "",
    },
  });
  const { errors } = form.formState;

  useEffect(() => {
    const p = existing.data;

    if (p) {
      form.reset({
        title: p.title,
        titleKk: p.titleKk ?? "",
        description: p.description,
        descriptionKk: p.descriptionKk ?? "",
        categoryId: p.category.id,
        price: String(p.price),
        unit: p.unit,
        availableQty: String(p.availableQty),
        minOrderQty: String(p.minOrderQty),
        cityId: p.city.id,
        deliveryAvailable: p.deliveryAvailable,
        pickupAvailable: p.pickupAvailable,
        imageUrl: p.imageUrl ?? "",
        tags: p.tags.join(", "),
      });
    }
  }, [existing.data, form]);

  if (id && existing.isPending) {
    return <LoadingBlock label={t("common.loading")} />;
  }

  const applyDraft = (result: ListingDraftResponseDto) => {
    form.reset(
      draftToForm(
        result.draft,
        form.getValues(),
        (slug) => reference.categoryBySlug.get(slug)?.id,
      ),
    );
    setDraftMode(result.mode);
  };

  const values = form.watch();
  const category = reference.categoryById.get(values.categoryId);
  const city = reference.cityById.get(values.cityId);

  const onSubmit = form.handleSubmit((v) =>
    save.mutate(
      {
        title: v.title,
        titleKk: v.titleKk || null,
        description: v.description,
        descriptionKk: v.descriptionKk || null,
        categoryId: v.categoryId,
        price: Number(v.price),
        unit: v.unit,
        availableQty: Number(v.availableQty),
        minOrderQty: Number(v.minOrderQty),
        cityId: v.cityId,
        deliveryAvailable: v.deliveryAvailable,
        pickupAvailable: v.pickupAvailable,
        imageUrl: v.imageUrl || null,
        tags: v.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      {
        onSuccess: (product) => {
          toast.success(id ? t("listing.saved") : t("listing.published"));
          router.push(`/products/${product.id}`);
        },
        onError: (error) =>
          form.setError("root", { message: errorMessage(error) }),
      },
    ),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="flex flex-col gap-8">
        {id ? null : <AiListingAssistant onDraft={applyDraft} />}
        <form
          className="flex flex-col gap-6"
          onSubmit={onSubmit}
          noValidate
          aria-labelledby="manual-title"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="manual-title" className="text-2xl font-semibold">
              {t("listing.manualTitle")}
            </h2>
            {draftMode ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-primary/50 bg-secondary px-2.5 py-1 text-sm font-semibold text-secondary-foreground">
                <Bot className="size-4" aria-hidden />
                {draftMode === "claude"
                  ? t("ai.draftLabel")
                  : t("ai.draftRulesLabel")}
              </span>
            ) : null}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="title"
              label={t("listing.titleRu")}
              error={errors.title?.message}
            >
              <Input
                {...fieldAria("title", errors.title?.message)}
                lang="ru"
                {...form.register("title")}
              />
            </Field>
            <Field
              id="titleKk"
              label={t("listing.titleKk")}
              optionalLabel={t("common.optional")}
              error={errors.titleKk?.message}
            >
              <Input
                {...fieldAria("titleKk", errors.titleKk?.message)}
                lang="kk"
                {...form.register("titleKk")}
              />
            </Field>
            <Field
              id="description"
              label={t("listing.descriptionRu")}
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...fieldAria("description", errors.description?.message)}
                lang="ru"
                rows={4}
                {...form.register("description")}
              />
            </Field>
            <Field
              id="descriptionKk"
              label={t("listing.descriptionKk")}
              optionalLabel={t("common.optional")}
              error={errors.descriptionKk?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...fieldAria("descriptionKk", errors.descriptionKk?.message)}
                lang="kk"
                rows={3}
                {...form.register("descriptionKk")}
              />
            </Field>
            <Field
              id="categoryId"
              label={t("listing.category")}
              error={errors.categoryId?.message}
            >
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <CategorySelect
                    id="categoryId"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.categoryId)}
                  />
                )}
              />
            </Field>
            <Field
              id="cityId"
              label={t("listing.city")}
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
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Field
                id="price"
                label={t("listing.price")}
                error={errors.price?.message}
              >
                <Input
                  {...fieldAria("price", errors.price?.message)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  {...form.register("price")}
                />
              </Field>
              <Field id="unit" label={t("listing.unit")}>
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
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="availableQty"
                label={t("listing.availableQty")}
                error={errors.availableQty?.message}
              >
                <Input
                  {...fieldAria("availableQty", errors.availableQty?.message)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  {...form.register("availableQty")}
                />
              </Field>
              <Field
                id="minOrderQty"
                label={t("listing.minOrderQty")}
                error={errors.minOrderQty?.message}
              >
                <Input
                  {...fieldAria("minOrderQty", errors.minOrderQty?.message)}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  {...form.register("minOrderQty")}
                />
              </Field>
            </div>
          </div>
          <fieldset className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Controller
                  control={form.control}
                  name="deliveryAvailable"
                  render={({ field }) => (
                    <Switch
                      id="deliveryAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="deliveryAvailable">
                  {t("listing.deliveryAvailable")}
                </Label>
              </div>
              <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Controller
                  control={form.control}
                  name="pickupAvailable"
                  render={({ field }) => (
                    <Switch
                      id="pickupAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-describedby={
                        errors.pickupAvailable
                          ? "pickupAvailable-error"
                          : undefined
                      }
                    />
                  )}
                />
                <Label htmlFor="pickupAvailable">
                  {t("listing.pickupAvailable")}
                </Label>
              </div>
            </div>
            {errors.pickupAvailable?.message ? (
              <p
                id="pickupAvailable-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.pickupAvailable.message}
              </p>
            ) : null}
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="imageUrl"
              label={t("listing.imageUrl")}
              hint={t("listing.imageUrlHint")}
              error={errors.imageUrl?.message}
            >
              <Input
                {...fieldAria("imageUrl", errors.imageUrl?.message, true)}
                type="url"
                placeholder="https://"
                {...form.register("imageUrl")}
              />
            </Field>
            <Field
              id="tags"
              label={t("listing.tags")}
              hint={t("listing.tagsHint")}
            >
              <Input
                {...fieldAria("tags", undefined, true)}
                {...form.register("tags")}
              />
            </Field>
          </div>
          {errors.root?.message ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 font-medium text-destructive"
            >
              {errors.root.message}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending
                ? t("listing.publishing")
                : id
                  ? t("common.save")
                  : t("listing.publish")}
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
      </div>
      <aside
        className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start"
        aria-label={t("listing.preview")}
      >
        <p className="font-semibold text-muted-foreground">
          {t("listing.preview")}
        </p>
        <ProductCard
          product={{
            id: id ?? "preview",
            title: values.title || "—",
            titleKk: values.titleKk || null,
            price: Number(values.price) || 0,
            unit: values.unit,
            availableQty: Number(values.availableQty) || 0,
            minOrderQty: Number(values.minOrderQty) || 0,
            deliveryAvailable: values.deliveryAvailable,
            pickupAvailable: values.pickupAvailable,
            imageUrl: /^https?:\/\/\S+$/.test(values.imageUrl)
              ? values.imageUrl
              : null,
            isDemo: false,
            city: city ?? { nameRu: "—", nameKk: "—" },
            category: category ?? { icon: "package", nameRu: "—", nameKk: "—" },
            supplier: {
              id: user?.company?.id ?? "",
              name: user?.company?.name ?? "",
            },
          }}
        />
      </aside>
    </div>
  );
}

export function ListingEditorPage({ id }: { id?: string }) {
  const t = useTranslations();

  return (
    <RequireAuth allow="SUPPLIER">
      <div className="container-page flex flex-col gap-6 py-8">
        <Button asChild variant="ghost" className="w-fit">
          <Link href="/dashboard?tab=products">
            <ArrowLeft aria-hidden />
            {t("dashboard.tabs.products")}
          </Link>
        </Button>
        <PageHeader
          title={id ? t("listing.editTitle") : t("listing.newTitle")}
        />
        <Editor id={id} />
      </div>
    </RequireAuth>
  );
}
