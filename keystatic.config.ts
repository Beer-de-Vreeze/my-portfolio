import { collection, config, fields, singleton } from "@keystatic/core";

const multiline = (label: string) => fields.text({ label, multiline: true });

export default config({
  // Local files while developing; in production the admin commits to GitHub and Vercel redeploys.
  storage: import.meta.env.PROD
    ? { kind: "github", repo: { owner: "Beer-de-Vreeze", name: "my-portfolio" } }
    : { kind: "local" },
  ui: { brand: { name: "beerdevreeze.com" } },

  singletons: {
    site: singleton({
      label: "Site and about",
      path: "src/content/site",
      format: { data: "json" },
      schema: {
        name: fields.text({ label: "Name", validation: { isRequired: true } }),
        role: fields.text({ label: "Role", description: "Shown under the headline and in the about section." }),
        line: fields.text({ label: "Headline", validation: { isRequired: true } }),
        email: fields.text({ label: "Email", validation: { isRequired: true } }),
        links: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            href: fields.url({ label: "URL" }),
          }),
          { label: "Links", itemLabel: (p) => p.fields.label.value },
        ),
        aboutLead: fields.text({ label: "About: first line" }),
        about: fields.array(multiline("Paragraph"), { label: "About: paragraphs", itemLabel: (p) => p.value.slice(0, 60) }),
        portrait: fields.image({ label: "Portrait", directory: "public/images", publicPath: "/images/" }),
        portraitAlt: fields.text({ label: "Portrait description (alt text)" }),
      },
    }),
    runs: singleton({
      label: "Demo runs (hero)",
      path: "src/content/runs",
      format: { data: "json" },
      schema: {
        runs: fields.array(
          fields.object({
            id: fields.text({ label: "Id", description: "Short, no spaces." }),
            project: fields.text({ label: "Tab label" }),
            prompt: fields.text({ label: "Prompt" }),
            steps: fields.array(
              fields.object({ tool: fields.text({ label: "Tool" }), detail: fields.text({ label: "Detail" }) }),
              { label: "Tool calls", itemLabel: (p) => p.fields.tool.value },
            ),
            result: fields.text({ label: "Result" }),
          }),
          { label: "Runs", itemLabel: (p) => p.fields.project.value },
        ),
      },
    }),
  },

  collections: {
    projects: collection({
      label: "Projects",
      path: "src/content/projects/*",
      slugField: "title",
      format: { data: "json" },
      columns: ["order"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        order: fields.integer({ label: "Order", description: "Lower comes first.", defaultValue: 10 }),
        summary: multiline("Summary"),
        body: fields.array(multiline("Paragraph"), { label: "Body", itemLabel: (p) => p.value.slice(0, 60) }),
        facts: fields.array(
          fields.object({ label: fields.text({ label: "Label" }), value: fields.text({ label: "Value" }) }),
          { label: "Facts", itemLabel: (p) => p.fields.label.value },
        ),
        manifestTitle: fields.text({ label: "Manifest heading", description: 'e.g. "MCP server exposes"' }),
        manifest: fields.array(
          fields.object({ name: fields.text({ label: "Name" }), does: fields.text({ label: "What it does" }) }),
          { label: "Manifest", itemLabel: (p) => p.fields.name.value },
        ),
        media: fields.array(
          fields.object({
            image: fields.image({ label: "Image", directory: "public/images/projects", publicPath: "/images/projects/" }),
            alt: fields.text({ label: "Description (alt text)" }),
            caption: fields.text({ label: "Caption" }),
            ratio: fields.text({ label: "Aspect ratio", description: 'Width / height, e.g. "4 / 3". Empty means 4 / 3.' }),
          }),
          { label: "Images", itemLabel: (p) => p.fields.caption.value || p.fields.alt.value },
        ),
        video: fields.object(
          {
            src: fields.text({ label: "Video file path", description: "e.g. /media/showhow-demo.mp4 (put the file in public/media)." }),
            poster: fields.text({ label: "Poster image path" }),
            captions: fields.text({ label: "Captions (.vtt) path" }),
            label: fields.text({ label: "Caption under the video" }),
          },
          { label: "Video (optional)" },
        ),
        links: fields.array(
          fields.object({ label: fields.text({ label: "Label" }), href: fields.url({ label: "URL" }) }),
          { label: "Links", itemLabel: (p) => p.fields.label.value },
        ),
      },
    }),
    earlier: collection({
      label: "Earlier work",
      path: "src/content/earlier/*",
      slugField: "title",
      format: { data: "json" },
      columns: ["order"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        order: fields.integer({ label: "Order", defaultValue: 10 }),
        what: multiline("One-line description"),
        image: fields.image({ label: "Image", directory: "public/images/earlier", publicPath: "/images/earlier/" }),
        alt: fields.text({ label: "Description (alt text)" }),
        href: fields.text({ label: "Link", description: "A URL, or a path to a file in public/." }),
      },
    }),
  },
});
