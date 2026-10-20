"use client";

import { useLocale, useTranslations } from "next-intl";

import { CategoryIcon, localizedName } from "@/entities/catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useReference } from "../model/queries/use-reference";
import { ALL } from "./CitySelect";

type CategorySelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** slug — для фильтров каталога, id — для форм */
  valueKey?: "slug" | "id";
  allowAll?: boolean;
  invalid?: boolean;
};

export function CategorySelect({
  id,
  value,
  onChange,
  valueKey = "id",
  allowAll,
  invalid,
}: CategorySelectProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const { categories } = useReference();

  return (
    <Select value={value || (allowAll ? ALL : "")} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className="w-full"
        aria-invalid={invalid || undefined}
      >
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {allowAll ? <SelectItem value={ALL}>{t("all")}</SelectItem> : null}
        {categories.map((category) => (
          <SelectItem key={category.id} value={category[valueKey]}>
            <CategoryIcon
              icon={category.icon}
              className="size-4 text-primary"
            />
            {localizedName(locale, category)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
