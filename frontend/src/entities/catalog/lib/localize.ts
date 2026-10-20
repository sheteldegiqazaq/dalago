type Named = { nameRu: string; nameKk: string };
type Titled = { title: string; titleKk?: string | null };
type Described = { description: string; descriptionKk?: string | null };

/** Справочники (категории, города) есть на двух языках. */
export function localizedName(locale: string, item: Named | null | undefined) {
  if (!item) {
    return "";
  }

  return locale === "kk" ? item.nameKk : item.nameRu;
}

/** Название объявления: казахский вариант, если поставщик его указал. */
export function localizedTitle(locale: string, item: Titled) {
  return locale === "kk" && item.titleKk ? item.titleKk : item.title;
}

export function localizedDescription(locale: string, item: Described) {
  return locale === "kk" && item.descriptionKk
    ? item.descriptionKk
    : item.description;
}
