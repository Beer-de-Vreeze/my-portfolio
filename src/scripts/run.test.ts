import { describe, expect, it } from "vitest";
import type { Run } from "../data/content";
import { runLines } from "./run";

const run: Run = {
  id: "bunq",
  project: "bunq Voice",
  prompt: '"send twenty euros to Mink"',
  steps: [
    { tool: "speech_to_text", detail: "push-to-talk audio" },
    { tool: "find_counterparty", detail: '"Mink" -> IBAN from history' },
  ],
  result: "draft waits for biometric approval in bunq",
};

describe("runLines", () => {
  it("prints prompt, aligned tool calls and the result", () => {
    const lines = runLines(run);
    expect(lines[0]).toBe('> "send twenty euros to Mink"');
    expect(lines.at(-1)).toBe("ok draft waits for biometric approval in bunq");
    const detailCols = lines.slice(1, -1).map((l, i) => l.indexOf(run.steps[i].detail));
    expect(new Set(detailCols).size).toBe(1);
  });
});
