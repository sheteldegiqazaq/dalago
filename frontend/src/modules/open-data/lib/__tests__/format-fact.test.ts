import { describe, expect, it } from "vitest";

import { formatFact } from "../format-fact";

const normalize = (value: string) => value.replace(/\s/g, " ");

describe("formatFact", () => {
  it("formats values with units in both languages", () => {
    expect(
      normalize(formatFact("ru", { value: 590.7, unit: "thousandPeople" })),
    ).toBe("590,7 тыс. человек");
    expect(
      normalize(formatFact("kk", { value: 590.7, unit: "thousandPeople" })),
    ).toBe("590,7 мың адам");
    expect(formatFact("ru", { value: 36.7, unit: "percent" })).toBe("36,7%");
  });
});
