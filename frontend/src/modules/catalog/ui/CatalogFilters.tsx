"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";

import { UNITS } from "@/entities/catalog";
import { ALL, CategorySelect, CitySelect } from "@/modules/reference";
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

import type { CatalogFilterValues } from "../model/use-catalog-filters";

type CatalogFiltersProps = {
  values: CatalogFilterValues;
  onChange: (patch: Partial<CatalogFilterValues>) => void;
  onReset: () => void;
};

const toNumber = (value: string) =>
  value.trim() === "" ? null : Number(value);

/** Выпадающие списки применяются сразу, числовые поля — по кнопке «Применить» (удобнее, чем авто-поиск при каждом символе). */
export function CatalogFilters({
  values,
  onChange,
  onReset,
}: CatalogFiltersProps) {
  const t = useTranslations();
  const [draft, setDraft] = useState({
    q: values.q,
    minPrice: values.minPrice?.toString() ?? "",
    maxPrice: values.maxPrice?.toString() ?? "",
    quantity: values.quantity?.toString() ?? "",
  });

  useEffect(() => {
    setDraft({
      q: values.q,
      minPrice: values.minPrice?.toString() ?? "",
      maxPrice: values.maxPrice?.toString() ?? "",
      quantity: values.quantity?.toString() ?? "",
    });
  }, [values.q, values.minPrice, values.maxPrice, values.quantity]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onChange({
      q: draft.q.trim(),
      minPrice: toNumber(draft.minPrice),
      maxPrice: toNumber(draft.maxPrice),
      quantity: toNumber(draft.quantity),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-5"
      aria-label={t("catalog.filters")}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="f-q">{t("catalog.searchLabel")}</Label>
        <Input
          id="f-q"
          type="search"
          value={draft.q}
          placeholder={t("catalog.searchPlaceholder")}
          onChange={(event) => setDraft({ ...draft, q: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="f-category">{t("catalog.category")}</Label>
        <CategorySelect
          id="f-category"
          valueKey="slug"
          allowAll
          value={values.category ?? ALL}
          onChange={(value) =>
            onChange({ category: value === ALL ? null : value })
          }
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="f-city">{t("catalog.city")}</Label>
        <CitySelect
          id="f-city"
          allowAll
          value={values.city ?? ALL}
          onChange={(value) => onChange({ city: value === ALL ? null : value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-min">{t("catalog.priceFrom")}</Label>
          <Input
            id="f-min"
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.minPrice}
            onChange={(event) =>
              setDraft({ ...draft, minPrice: event.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="f-max">{t("catalog.priceTo")}</Label>
          <Input
            id="f-max"
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.maxPrice}
            onChange={(event) =>
              setDraft({ ...draft, maxPrice: event.target.value })
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="f-qty">{t("catalog.quantity")}</Label>
        <div className="grid grid-cols-[1fr_6.5rem] gap-2">
          <Input
            id="f-qty"
            type="number"
            inputMode="decimal"
            min={0}
            value={draft.quantity}
            aria-describedby="f-qty-hint"
            onChange={(event) =>
              setDraft({ ...draft, quantity: event.target.value })
            }
          />
          <Select
            value={values.unit ?? ALL}
            onValueChange={(value) =>
              onChange({
                unit: value === ALL ? null : (value as (typeof UNITS)[number]),
              })
            }
          >
            <SelectTrigger aria-label={t("catalog.unit")} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>—</SelectItem>
              {UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {t(`units.${unit}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p id="f-qty-hint" className="text-sm text-muted-foreground">
          {t("catalog.quantityHint")}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <Label htmlFor="f-delivery">{t("catalog.deliveryOnly")}</Label>
        <Switch
          id="f-delivery"
          checked={values.delivery}
          onCheckedChange={(checked) => onChange({ delivery: checked })}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {t("catalog.applyFilters")}
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          {t("common.reset")}
        </Button>
      </div>
    </form>
  );
}
