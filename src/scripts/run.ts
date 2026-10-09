import type { Run } from "../data/content";

const pad = (s: string, n: number) => (s.length >= n ? s + " " : s + " ".repeat(n - s.length));

export function runLines(run: Run): string[] {
  const width = Math.max(...run.steps.map((s) => s.tool.length)) + 2;
  return [`> ${run.prompt}`, ...run.steps.map((s) => `  ${pad(s.tool, width)}${s.detail}`), `${run.status ?? "ok"} ${run.result}`];
}

/** Types demo runs into the log, one line at a time, and pulses the hero field per tool call. */
export function startRuns(root: HTMLElement, runs: Run[], loop = true) {
  const log = root.querySelector<HTMLElement>("[data-run-log]")!;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-run-tab]"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let timer = 0;
  let auto = loop;

  function select(i: number) {
    index = i;
    tabs.forEach((t, j) => t.setAttribute("aria-pressed", String(j === i)));
  }

  function play(i: number) {
    clearTimeout(timer);
    select(i);
    const lines = runLines(runs[i]);
    if (reduced.matches) {
      log.textContent = lines.join("\n");
      return;
    }
    log.textContent = "";
    let line = 0;
    let char = 0;
    const tick = () => {
      if (line >= lines.length) {
        // Auto-play goes through each run once, then rests.
        if (auto && index + 1 < runs.length) timer = window.setTimeout(() => play(index + 1), 4200);
        return;
      }
      const text = lines[line];
      char = Math.min(text.length, char + (line === 0 ? 1 : 3));
      const done = lines.slice(0, line).join("\n");
      log.textContent = (done ? done + "\n" : "") + text.slice(0, char);
      if (char >= text.length) {
        if (line > 0) window.dispatchEvent(new Event("glyph:pulse"));
        line++;
        char = 0;
        timer = window.setTimeout(tick, line === 1 ? 500 : 380);
      } else {
        timer = window.setTimeout(tick, line === 0 ? 34 : 14);
      }
    };
    tick();
  }

  tabs.forEach((tab, i) =>
    tab.addEventListener("click", () => {
      auto = false;
      play(i);
    }),
  );
  reduced.addEventListener("change", () => play(index));
  play(0);
}
