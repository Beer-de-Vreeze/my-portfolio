// /llms.txt: a plain-text summary for language models (llmstxt.org), built from the same CMS content as the page.
import type { APIRoute } from "astro";
import { loadContent } from "../data/content";

export const GET: APIRoute = async ({ site: origin }) => {
  const { site, projects, earlier } = await loadContent();
  const abs = (href: string) => new URL(href, origin).href;
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.line} ${site.role}.`,
    "",
    ...site.about.map((p) => p),
    "",
    "## Projects",
    "",
    ...projects.map((p) => {
      const link = p.links[0]?.href ? abs(p.links[0].href) : abs(`/#${p.id}`);
      return `- [${p.title}](${link}): ${p.summary}`;
    }),
    "",
    "## Contact",
    "",
    `- [Email](mailto:${site.email})`,
    ...site.links.filter((l) => l.href).map((l) => `- [${l.label}](${abs(l.href!)})`),
    "",
    "## Optional",
    "",
    ...earlier.map((g) => `- [${g.title}](${g.href.startsWith("/") ? abs(g.href) : g.href}): ${g.what}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
