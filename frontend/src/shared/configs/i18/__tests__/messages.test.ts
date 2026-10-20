import { describe, expect, it } from "vitest";

import kk from "../../../../../messages/kk.json";
import ru from "../../../../../messages/ru.json";

function keys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translations", () => {
  it("Kazakh and Russian dictionaries have exactly the same keys", () => {
    const kkKeys = keys(kk).sort();
    const ruKeys = keys(ru).sort();

    expect(kkKeys.filter((key) => !ruKeys.includes(key))).toEqual([]);
    expect(ruKeys.filter((key) => !kkKeys.includes(key))).toEqual([]);
  });

  it("has no empty strings", () => {
    const empty = (dict: unknown) =>
      keys(dict).filter((key) => {
        const value = key
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown>)[part],
            dict,
          );
        return typeof value === "string" && value.trim() === "";
      });

    expect(empty(kk)).toEqual([]);
    expect(empty(ru)).toEqual([]);
  });
});
