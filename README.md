# beerdvreeze.nl

Portfolio of Beer de Vreeze, AI engineer building agents, agent skills and the tools around them.

A static [Astro](https://astro.build/) site.
The visual idea is a glyph-density render: the name, a demo agent run, the photos and the showhow video are drawn as monospace characters on a canvas.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:4321.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 4321 |
| `npm run build` | Type-check with `astro check`, then build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm test` | Unit tests for the glyph math and demo-run formatting (Vitest) |

## Where things live

| Path | Contents |
|---|---|
| `src/content/` | All copy as JSON: site and about, demo runs, projects, earlier work |
| `keystatic.config.ts` | The CMS schema for everything in `src/content/` |
| `src/data/content.ts` | Reads `src/content/` through Keystatic's reader at build time |
| `src/pages/index.astro` | The page and its styles |
| `src/components/GlyphFigure.astro` | Image shown as glyphs, photo on hover (tap on touch screens) |
| `src/scripts/hero.ts` | Hero canvas: the name as glyph density, light that follows the pointer |
| `src/scripts/run.ts` | Demo agent runs typed into the hero |
| `src/scripts/media.ts` | Glyph rendering for images and the showhow video, plus its custom controls |
| `src/scripts/glyph.ts` | Shared luminance-to-glyph math |
| `public/sw.js` | Unregisters the service worker the previous Next.js site installed |

## Edit content (Keystatic)

Locally: run `npm run dev` and open http://localhost:4321/keystatic. Saves write straight to `src/content/` and `public/images/`.

In production, `/keystatic` signs in with GitHub and commits to `master`, which redeploys the site.
One-time setup:

1. Run `npm run dev` with `storage` temporarily set to GitHub mode (or open `/keystatic` on the deployed site) and follow Keystatic's "Create GitHub App" flow. It writes these to `.env`:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
2. Add the same four variables in Vercel under Project Settings > Environment Variables (Production), then redeploy.

Images uploaded in the CMS are stored as `public/images/<collection>/<slug>/...`; keep that layout when adding files by hand, or the CMS will not see them.

## Deploy

Vercel with the Astro adapter (`@astrojs/vercel`): the pages are prerendered, and only the Keystatic admin routes run as functions.
`vercel.json` pins the framework preset to Astro.
