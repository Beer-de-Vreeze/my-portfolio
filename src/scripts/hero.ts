import { RAMP, Spring, luminanceGrid } from "./glyph";

const FONT_FAMILY = '"Martian Mono Variable", ui-monospace, monospace';
const FPS = 30;

type Pulse = { x: number; y: number; born: number };

export function startHeroField(canvas: HTMLCanvasElement, nameLinesFor: (width: number) => string[]) {
  const hero = canvas.parentElement as HTMLElement;
  const base = hero.querySelector<HTMLElement>("[data-hero-base]");
  const top = hero.querySelector<HTMLElement>("[data-hero-top]");
  const ctx = canvas.getContext("2d")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  let W = 0, H = 0, cols = 0, rows = 0, cw = 0, ch = 0, fontSize = 12;
  let mask: ArrayLike<number> = new Float32Array(0);
  let firstRow = 0;
  let lastRow = 0;
  let ink = "#e8b04a";
  const lightX = new Spring(0.7, 18, 7);
  const lightY = new Spring(0.3, 18, 7);
  let target: { x: number; y: number } | null = null;
  const pulses: Pulse[] = [];
  let visible = true;
  let raf = 0;
  let last = 0;

  function layout() {
    const rect = hero.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fontSize = Math.max(8, Math.min(14, W / 105));
    ctx.font = `400 ${fontSize}px ${FONT_FAMILY}`;
    cw = ctx.measureText("M").width;
    ch = fontSize * 1.32;
    cols = Math.ceil(W / cw);
    rows = Math.ceil(H / ch);
    ink = getComputedStyle(hero).getPropertyValue("--ink").trim() || ink;
    buildMask();
  }

  // Rasterise the name into the area between the top bar and the base panel, then sample it per cell.
  function buildMask() {
    const scale = 0.5;
    const mw = Math.max(1, Math.round(W * scale));
    const mh = Math.max(1, Math.round(H * scale));
    const off = document.createElement("canvas");
    off.width = mw;
    off.height = mh;
    const m = off.getContext("2d", { willReadFrequently: true })!;

    const heroTop = hero.getBoundingClientRect().top;
    const areaTop = (top ? top.getBoundingClientRect().bottom - heroTop : 0) * scale;
    const areaBottom = (base ? base.getBoundingClientRect().top - heroTop : H) * scale;
    const areaH = Math.max(0, areaBottom - areaTop);
    firstRow = Math.ceil(areaTop / scale / ch);
    lastRow = Math.min(rows, Math.ceil(areaBottom / scale / ch));
    // Align the name with the page gutter, the same inset as the top bar.
    const padX = (top ? top.getBoundingClientRect().left - hero.getBoundingClientRect().left : W * 0.035) * scale;
    const CAP = 0.72; // Martian Mono cap height in em; the name is all caps
    const lineGap = 0.98;

    const nameLines = nameLinesFor(W);
    m.fillStyle = "#fff";
    m.textBaseline = "alphabetic";
    m.font = `800 semi-expanded 100px ${FONT_FAMILY}`;
    const widest = Math.max(...nameLines.map((l) => m.measureText(l).width));
    const capsBlock = lineGap * (nameLines.length - 1) + CAP;
    const size = Math.min((100 * (mw - padX * 2)) / widest, (areaH * 0.9) / capsBlock);
    m.font = `800 semi-expanded ${size}px ${FONT_FAMILY}`;
    const y0 = areaTop + (areaH - size * capsBlock) / 2 + size * CAP;
    nameLines.forEach((line, i) => m.fillText(line, padX, y0 + i * size * lineGap));

    mask = luminanceGrid(m.getImageData(0, 0, mw, mh).data, mw, mh, cols, rows);
  }

  function frame(now: number) {
    const t = now / 1000;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / FPS;
    last = now;

    // Idle drift when no pointer is steering the light.
    const goal = target ?? { x: 0.5 + 0.38 * Math.sin(t * 0.21), y: 0.4 + 0.22 * Math.sin(t * 0.33 + 1) };
    const lx = lightX.step(goal.x, dt);
    const ly = lightY.step(goal.y, dt);

    while (pulses.length && t - pulses[0].born > 2.2) pulses.shift();

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink;
    ctx.font = `400 ${fontSize}px ${FONT_FAMILY}`;
    ctx.textBaseline = "top";
    const aspect = H / W;
    const n = RAMP.length - 1;

    for (let r = firstRow; r < lastRow; r++) {
      let line = "";
      const ny = r / rows;
      for (let c = 0; c < cols; c++) {
        const nx = c / cols;
        const dx = nx - lx;
        const dy = (ny - ly) * aspect;
        const d = Math.sqrt(dx * dx + dy * dy);
        const light = Math.exp(-(d * d) / 0.06);
        const m = mask[r * cols + c];

        // Light and pulse rings only deepen the name; cells without ink stay empty.
        let v = m * (0.5 + 0.5 * light);
        for (const p of pulses) {
          const age = t - p.born;
          const px = nx - p.x;
          const py = (ny - p.y) * aspect;
          const ring = Math.sqrt(px * px + py * py) - age * 0.55;
          v += 0.7 * m * Math.exp(-(ring * ring) / 0.0012) * (1 - age / 2.2);
        }
        line += RAMP[Math.round(Math.min(1, v) * n)];
      }
      ctx.fillText(line, 0, r * ch);
    }
  }

  function loop(now: number) {
    raf = 0;
    if (!visible || document.hidden || reduced.matches) return;
    if (now - last >= 1000 / FPS - 1) frame(now);
    raf = requestAnimationFrame(loop);
  }

  function kick() {
    if (!raf && visible && !document.hidden && !reduced.matches) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }

  function redraw() {
    layout();
    frame(performance.now());
    kick();
  }

  hero.addEventListener("pointermove", (e) => {
    const rect = hero.getBoundingClientRect();
    target = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  });
  hero.addEventListener("pointerleave", () => (target = null));

  window.addEventListener("glyph:pulse", () => {
    pulses.push({ x: lightX.value, y: lightY.value, born: performance.now() / 1000 });
    if (reduced.matches) return;
    kick();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    kick();
  }).observe(hero);
  document.addEventListener("visibilitychange", kick);
  reduced.addEventListener("change", redraw);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);

  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(redraw, 120);
  }).observe(hero);

  redraw();
}
