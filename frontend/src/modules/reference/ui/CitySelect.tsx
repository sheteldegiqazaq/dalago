"use client";

import { useLocale, useTranslations } from "next-intl";

import { localizedName } from "@/entities/catalog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useReference } from "../model/queries/use-reference";

export const ALL = "all";

type CitySelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  allowAll?: boolean;
  invalid?: boolean;
};

export function CitySelect({
  id,
  value,
  onChange,
  allowAll,
  invalid,
}: CitySelectProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const { regions } = useReference();

  return (
    <Select value={value || (allowAll ? ALL : "")} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        className="w-full"
        aria-invalid={invalid || undefined}
      >
        <SelectValue placeholder={t("loading")} />
      </SelectTrigger>
      <SelectContent>
        {allowAll ? <SelectItem value={ALL}>{t("all")}</SelectItem> : null}
        {regions
          .filter((region) => region.cities.length > 0)
          .map((region) => (
            <SelectGroup key={region.id}>
              <SelectLabel>{localizedName(locale, region)}</SelectLabel>
              {region.cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {localizedName(locale, city)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  );
}
