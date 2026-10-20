import { describe, expect, it } from "vitest";

import { draftToForm, type ListingFormValues } from "../draft-to-form";

const empty: ListingFormValues = {
  title: "",
  titleKk: "",
  description: "",
  descriptionKk: "",
  categoryId: "",
  price: "",
  unit: "KG",
  availableQty: "",
  minOrderQty: "",
  cityId: "semey",
  deliveryAvailable: false,
  pickupAvailable: true,
  imageUrl: "",
  tags: "",
};

describe("draftToForm", () => {
  it("fills only the fields present in the AI draft", () => {
    const values = draftToForm(
      {
        title: "Ячмень",
        titleKk: "Арпа",
        description: "Продам 2 тонны ячменя",
        descriptionKk: null,
        categorySlug: "grain",
        quantity: 2,
        unit: "T",
        price: null,
        cityId: null,
        deliveryAvailable: null,
        pickupAvailable: null,
        tags: ["ячмень", "арпа"],
      },
      empty,
      (slug) => (slug === "grain" ? "cat-grain" : undefined),
    );

    expect(values).toMatchObject({
      title: "Ячмень",
      titleKk: "Арпа",
      categoryId: "cat-grain",
      availableQty: "2",
      unit: "T",
      price: "",
      minOrderQty: "",
      cityId: "semey",
      tags: "ячмень, арпа",
    });
  });
});
