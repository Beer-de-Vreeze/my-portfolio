import { describe, expect, it } from "vitest";
import { markHint } from "./glyph";

describe("markHint", () => {
  it("sets viewfinder corners and the label into the glyph rows without changing their length", () => {
    const lines = Array.from({ length: 6 }, () => ".".repeat(24));
    markHint(lines, 24, "hover");
    expect(lines.every((l) => l.length === 24)).toBe(true);
    expect(lines[1].startsWith(".+--")).toBe(true);
    expect(lines[1].endsWith("--+.")).toBe(true);
    expect(lines[4]).toContain(" hover --+");
  });

  it("leaves tiny grids alone", () => {
    const lines = ["....", "...."];
    markHint(lines, 4, "hover");
    expect(lines).toEqual(["....", "...."]);
  });
});
