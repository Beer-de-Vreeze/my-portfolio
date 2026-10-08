import { describe, expect, it } from "vitest";
import { RAMP, Spring, glyphFor, luminanceGrid, toRows } from "./glyph";

describe("glyphFor", () => {
  it("maps the ends of the range to the ends of the ramp and clamps outside it", () => {
    expect(glyphFor(0)).toBe(" ");
    expect(glyphFor(1)).toBe("@");
    expect(glyphFor(-3)).toBe(" ");
    expect(glyphFor(7)).toBe("@");
    expect(glyphFor(0.5)).toBe(RAMP[Math.round(0.5 * (RAMP.length - 1))]);
  });
});

describe("luminanceGrid", () => {
  it("averages each cell and treats transparent pixels as empty", () => {
    // 2x1 image: left white opaque, right white transparent.
    const data = new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 0]);
    expect(Array.from(luminanceGrid(data, 2, 1, 2, 1))).toEqual([1, 0]);
    expect(luminanceGrid(data, 2, 1, 1, 1)[0]).toBeCloseTo(0.5);
  });
});

describe("toRows", () => {
  it("builds one string per row", () => {
    expect(toRows([0, 1, 1, 0], 2, 2)).toEqual([" @", "@ "]);
  });
});

describe("Spring", () => {
  it("settles on the target", () => {
    const s = new Spring(0);
    for (let i = 0; i < 600; i++) s.step(10, 1 / 60);
    expect(s.value).toBeCloseTo(10, 2);
  });
});
