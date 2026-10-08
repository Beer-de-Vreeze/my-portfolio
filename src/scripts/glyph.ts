// Shared glyph-density math: tone becomes a character from a luminance ramp.

export const RAMP = " .:-=+*#%@";

export function glyphFor(lum: number, ramp = RAMP): string {
  const clamped = Math.min(1, Math.max(0, lum));
  return ramp[Math.round(clamped * (ramp.length - 1))];
}

/** Average luminance (0..1) of each cell in a cols x rows grid laid over RGBA pixels. */
export function luminanceGrid(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cols: number,
  rows: number,
): Float32Array {
  const out = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor((r * height) / rows);
    const y1 = Math.max(y0 + 1, Math.floor(((r + 1) * height) / rows));
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor((c * width) / cols);
      const x1 = Math.max(x0 + 1, Math.floor(((c + 1) * width) / cols));
      let sum = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          // Rec. 709 luma, weighted by alpha so transparent pixels read as empty.
          sum += ((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255) * (data[i + 3] / 255);
        }
      }
      out[r * cols + c] = sum / ((x1 - x0) * (y1 - y0));
    }
  }
  return out;
}

export function toRows(lum: ArrayLike<number>, cols: number, rows: number, ramp = RAMP): string[] {
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) line += glyphFor(lum[r * cols + c], ramp);
    lines.push(line);
  }
  return lines;
}

/** Damped spring, so motion carries mass instead of tweening linearly. */
export class Spring {
  value: number;
  velocity = 0;
  constructor(
    initial: number,
    private stiffness = 40,
    private damping = 11,
  ) {
    this.value = initial;
  }
  step(target: number, dt: number): number {
    const accel = this.stiffness * (target - this.value) - this.damping * this.velocity;
    this.velocity += accel * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}

/** Viewfinder corners and a small label set into the glyphs themselves: a quiet sign the picture is behind them. */
export function markHint(lines: string[], cols: number, label: string) {
  const rows = lines.length;
  if (rows < 4 || cols < label.length + 8) return;
  const put = (r: number, c: number, text: string) => {
    lines[r] = lines[r].slice(0, c) + text + lines[r].slice(c + text.length);
  };
  const last = rows - 2;
  put(1, 1, "+--");
  put(1, cols - 4, "--+");
  put(last, 1, "+--");
  const tag = ` ${label} --+`;
  put(last, cols - 1 - tag.length, tag);
}
