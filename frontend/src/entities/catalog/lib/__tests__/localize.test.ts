import { describe, expect, it } from "vitest";

import { localizedName, localizedTitle } from "../localize";

describe("localize", () => {
  it("picks Kazakh or Russian reference names", () => {
    const city = { nameRu: "Аягоз", nameKk: "Аягөз" };

    expect(localizedName("kk", city)).toBe("Аягөз");
    expect(localizedName("ru", city)).toBe("Аягоз");
    expect(localizedName("kk", null)).toBe("");
  });

  it("falls back to the original title when no Kazakh title exists", () => {
    expect(localizedTitle("kk", { title: "Мёд", titleKk: "Бал" })).toBe("Бал");
    expect(localizedTitle("kk", { title: "Мёд", titleKk: null })).toBe("Мёд");
    expect(localizedTitle("ru", { title: "Мёд", titleKk: "Бал" })).toBe("Мёд");
  });
});
