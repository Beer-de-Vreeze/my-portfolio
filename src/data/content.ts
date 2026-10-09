// All page copy lives in src/content as JSON, edited through Keystatic at /keystatic.
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

export type RunLine = { tool: string; detail: string };
export type Run = { id: string; project: string; prompt: string; steps: RunLine[]; result: string; status?: "ok" | "err" };

const byOrder = <T extends { entry: { order: number | null } }>(a: T, b: T) => (a.entry.order ?? 0) - (b.entry.order ?? 0);

export async function loadContent() {
  const reader = createReader(process.cwd(), keystaticConfig);
  const [site, runs, projects, earlier] = await Promise.all([
    reader.singletons.site.readOrThrow(),
    reader.singletons.runs.readOrThrow(),
    reader.collections.projects.all(),
    reader.collections.earlier.all(),
  ]);
  return {
    site,
    runs: runs.runs as Run[],
    projects: projects.sort(byOrder).map(({ slug, entry }) => ({
      ...entry,
      id: slug,
      video: entry.video.src ? entry.video : null,
    })),
    earlier: earlier.sort(byOrder).map(({ slug, entry }) => ({ ...entry, id: slug })),
  };
}
