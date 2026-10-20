import { describe, expect, it } from "vitest";

import type { SearchIntentDto } from "@/shared/api/generated";

import { intentToFilters, intentToRequestQuery } from "../intent";

const intent: SearchIntentDto = {
  keywords: ["говяд", "сиыр"],
  categorySlug: "meat",
  cityId: "semey",
  regionId: null,
  minPrice: null,
  maxPrice: 3500,
  quantity: 50,
  unit: "KG",
  deliveryRequired: false,
  neededBy: "2026-10-23",
};

describe("intentToFilters", () => {
  it("maps every understood constraint to a catalog filter", () => {
    expect(intentToFilters(intent, false)).toEqual({
      q: "",
      kw: "говяд сиыр",
      category: "meat",
      city: "semey",
      region: null,
      minPrice: null,
      maxPrice: 3500,
      quantity: 50,
      unit: "KG",
      delivery: false,
      sort: "relevance",
    });
  });

  it("drops price, quantity and city when the backend relaxed the search", () => {
    const filters = intentToFilters(
      { ...intent, deliveryRequired: true },
      true,
    );

    expect(filters).toMatchObject({
      city: null,
      maxPrice: null,
      quantity: null,
      delivery: false,
    });
    expect(filters.category).toBe("meat");
  });
});

describe("intentToRequestQuery", () => {
  it("prefills the request form from the query", () => {
    expect(intentToRequestQuery("50 кг говядины", { intent }, "cat-1")).toEqual(
      {
        title: "50 кг говядины",
        categoryId: "cat-1",
        quantity: "50",
        unit: "KG",
        city: "semey",
        targetPrice: "3500",
        date: "2026-10-23",
      },
    );
  });
});
