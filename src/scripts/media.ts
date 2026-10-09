import { luminanceGrid, markHint, toRows } from "./glyph";

const FONT_FAMILY = '"Martian Mono Variable", ui-monospace, monospace';
const HINT = matchMedia("(hover: hover)").matches ? "hover" : "tap";
const isDark = () => matchMedia("(prefers-color-scheme: dark)").matches;

// Photos invert on paper so dark pixels carry the ink; the video keeps its tones so its dark background stays empty.
type PaintOptions = { fontSize: number; position: [number, number]; ink: string; invert: boolean; hint?: string };

const scratch = document.createElement("canvas");
const scratchCtx = scratch.getContext("2d", { willReadFrequently: true })!;

/** Paints `source` (cropped like object-fit: cover) into `canvas` as glyphs. Returns false if nothing to draw. */
function paintGlyphs(canvas: HTMLCanvasElement, source: CanvasImageSource, srcW: number, srcH: number, opts: PaintOptions) {
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height || !srcW || !srcH) return false;

  const dpr = Math.min(devicePixelRatio || 1, 2);
  const pw = Math.round(box.width * dpr);
  const ph = Math.round(box.height * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = `500 ${opts.fontSize}px ${FONT_FAMILY}`;
  const cw = ctx.measureText("M").width;
  const ch = opts.fontSize * 1.25;
  const cols = Math.ceil(box.width / cw);
  const rows = Math.ceil(box.height / ch);

  const scale = Math.max(box.width / srcW, box.height / srcH);
  const sw = box.width / scale;
  const sh = box.height / scale;
  const sx = (srcW - sw) * opts.position[0];
  const sy = (srcH - sh) * opts.position[1];

  scratch.width = cols * 2;
  scratch.height = rows * 2;
  scratchCtx.drawImage(source, sx, sy, sw, sh, 0, 0, scratch.width, scratch.height);
  const lum = luminanceGrid(scratchCtx.getImageData(0, 0, scratch.width, scratch.height).data, scratch.width, scratch.height, cols, rows);

  // Stretch contrast so dim frames and photos still use the whole ramp.
  let lo = 1, hi = 0;
  for (const v of lum) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const span = Math.max(0.05, hi - lo);
  const invert = opts.invert && !isDark();
  for (let i = 0; i < lum.length; i++) {
    const v = Math.max(0, Math.min(1, (lum[i] - lo) / span));
    lum[i] = invert ? 1 - v : v;
  }

  const lines = toRows(lum, cols, rows);
  if (opts.hint) markHint(lines, cols, opts.hint);
  ctx.clearRect(0, 0, box.width, box.height);
  ctx.fillStyle = opts.ink;
  ctx.textBaseline = "top";
  lines.forEach((line, r) => ctx.fillText(line, 0, r * ch));
  return true;
}

function objectPosition(el: Element): [number, number] {
  const [x, y] = getComputedStyle(el).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
  return [Number.isNaN(x) ? 0.5 : x, Number.isNaN(y) ? 0.5 : y];
}

/** Image figures: glyphs lead; hover (or a tap on touch screens) reveals the photo. */
function setupFigure(fig: HTMLElement) {
  const img = fig.querySelector("img")!;
  const canvas = fig.querySelector("canvas")!;
  const render = () => {
    const ok = paintGlyphs(canvas, img, img.naturalWidth, img.naturalHeight, {
      fontSize: Number(fig.dataset.glyphSize || 7),
      position: objectPosition(img),
      ink: getComputedStyle(fig).getPropertyValue("--ink").trim(),
      invert: true,
      hint: HINT,
    });
    if (ok) fig.dataset.glyph = "ready";
  };
  if (img.complete) render();
  else img.addEventListener("load", render, { once: true });
  // Touch screens have no hover: a tap swaps glyphs and photo. Enter or Space does the same from the keyboard.
  const frame = fig.querySelector<HTMLElement>(".frame")!;
  const flip = () => frame.setAttribute("aria-pressed", String(fig.classList.toggle("is-photo")));
  frame.addEventListener("click", flip);
  frame.addEventListener("keydown", (e) => {
    if (frame.getAttribute("role") !== "button" || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    flip();
  });
  return render;
}

/** Video figures: glyphs while stopped or paused; the real video while it plays. */
function setupVideo(fig: HTMLElement) {
  const video = fig.querySelector("video")!;
  const canvas = fig.querySelector("canvas")!;
  const screen = fig.querySelector<HTMLElement>(".screen")!;
  const q = <T extends HTMLElement>(sel: string) => fig.querySelector<T>(sel)!;
  const toggle = q<HTMLButtonElement>("[data-v-toggle]");
  const bigPlay = q<HTMLButtonElement>("[data-video-play]");
  const seek = q<HTMLInputElement>("[data-v-seek]");
  const time = q<HTMLElement>("[data-v-time]");
  const mute = q<HTMLButtonElement>("[data-v-mute]");
  const cc = q<HTMLButtonElement>("[data-v-cc]");
  const full = q<HTMLButtonElement>("[data-v-full]");
  const track = video.textTracks[0];
  const poster = new Image();
  poster.src = video.poster;

  const render = () => {
    const opts: PaintOptions = {
      fontSize: Number(fig.dataset.glyphSize || 6),
      position: [0.5, 0.5],
      ink: getComputedStyle(fig).getPropertyValue("--ink").trim(),
      invert: false,
      hint: HINT,
    };
    const ok = video.readyState >= 2 && video.currentTime > 0
      ? paintGlyphs(canvas, video, video.videoWidth, video.videoHeight, opts)
      : paintGlyphs(canvas, poster, poster.naturalWidth, poster.naturalHeight, opts);
    if (ok) fig.dataset.glyph = "ready";
  };

  const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const syncTime = () => {
    const d = video.duration || 0;
    seek.max = String(d);
    seek.value = String(video.currentTime);
    seek.style.setProperty("--p", d ? `${(video.currentTime / d) * 100}%` : "0%");
    seek.setAttribute("aria-valuetext", `${clock(video.currentTime)} of ${clock(d)}`);
    time.textContent = `${clock(video.currentTime)} / ${clock(d)}`;
  };

  const setPlaying = (playing: boolean) => {
    fig.classList.toggle("is-playing", playing);
    toggle.textContent = playing ? "Pause" : "Play";
    bigPlay.textContent = video.currentTime > 0 && !video.ended ? "Resume" : "Play demo";
    if (!playing) render();
  };

  // play() rejects when the browser blocks playback; the controls simply stay on "Play".
  const play = () => void video.play().catch(() => {});
  const playPause = () => (video.paused ? play() : video.pause());
  bigPlay.addEventListener("click", play);
  toggle.addEventListener("click", playPause);
  canvas.addEventListener("click", play);
  video.addEventListener("click", playPause);
  video.addEventListener("play", () => setPlaying(true));
  video.addEventListener("pause", () => setPlaying(false));
  video.addEventListener("ended", () => setPlaying(false));
  video.addEventListener("timeupdate", syncTime);
  video.addEventListener("loadedmetadata", syncTime);
  video.addEventListener("seeked", () => video.paused && render());

  seek.addEventListener("input", () => {
    video.currentTime = Number(seek.value);
    syncTime();
  });

  mute.addEventListener("click", () => {
    video.muted = !video.muted;
    mute.textContent = video.muted ? "Muted" : "Mute";
  });

  // The video has captions burned in; the track is there for screen readers and as an opt-in.
  cc.addEventListener("click", () => {
    if (!track) return;
    const on = track.mode !== "showing";
    track.mode = on ? "showing" : "disabled";
    cc.textContent = on ? "CC on" : "CC off";
  });

  full.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else screen.requestFullscreen?.();
  });
  document.addEventListener("fullscreenchange", () => {
    full.setAttribute("aria-pressed", String(document.fullscreenElement === screen));
  });

  syncTime();
  if (poster.complete) render();
  else poster.addEventListener("load", render, { once: true });
  return () => {
    if (video.paused) render();
  };
}

export function startGlyphMedia(root: ParentNode = document) {
  const renders = [
    ...Array.from(root.querySelectorAll<HTMLElement>("[data-glyph-figure]")).map(setupFigure),
    ...Array.from(root.querySelectorAll<HTMLElement>("[data-glyph-video]")).map(setupVideo),
  ];
  const renderAll = () => renders.forEach((r) => r());

  let timer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = window.setTimeout(renderAll, 150);
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", renderAll);
  document.fonts.ready.then(renderAll);
}
