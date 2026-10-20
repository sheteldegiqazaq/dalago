import { describe, expect, it } from "vitest";

import { safeNextPath } from "../safe-next";

describe("safeNextPath", () => {
  it("keeps internal paths", () => {
    expect(safeNextPath("/requests/new?x=1")).toBe("/requests/new?x=1");
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath(null, "/")).toBe("/");
  });
});
