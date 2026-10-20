import type { ListingDraftDto } from "@/shared/api/generated";

export type ListingFormValues = {
  title: string;
  titleKk: string;
  description: string;
  descriptionKk: string;
  categoryId: string;
  price: string;
  unit: "KG" | "T" | "L" | "PCS" | "PACK";
  availableQty: string;
  minOrderQty: string;
  cityId: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  imageUrl: string;
  tags: string;
};

/**
 * Черновик ИИ переносится в форму. Пустые в тексте поля остаются пустыми —
 * в том числе минимальный заказ, его поставщик указывает сам.
 */
export function draftToForm(
  draft: ListingDraftDto,
  current: ListingFormValues,
  categoryIdBySlug: (slug: string) => string | undefined,
): ListingFormValues {
  return {
    ...current,
    title: draft.title || current.title,
    titleKk: draft.titleKk ?? current.titleKk,
    description: draft.description || current.description,
    descriptionKk: draft.descriptionKk ?? current.descriptionKk,
    categoryId:
      (draft.categorySlug && categoryIdBySlug(draft.categorySlug)) ||
      current.categoryId,
    price: draft.price != null ? String(draft.price) : current.price,
    unit: draft.unit ?? current.unit,
    availableQty:
      draft.quantity != null ? String(draft.quantity) : current.availableQty,
    cityId: draft.cityId ?? current.cityId,
    deliveryAvailable: draft.deliveryAvailable ?? current.deliveryAvailable,
    pickupAvailable: draft.pickupAvailable ?? current.pickupAvailable,
    tags: draft.tags.length > 0 ? draft.tags.join(", ") : current.tags,
  };
}
