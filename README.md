# beerdevreeze.com

Portfolio of Beer de Vreeze, AI engineer building agents, agent skills and the tools around them.

A static [Astro](https://astro.build/) site with a [Keystatic](https://keystatic.com/) CMS, deployed on Vercel.
The design is a glyph-density render: the name, the demo agent runs, the photos and the showhow video are drawn as monospace characters, and hovering an image shows the real one.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:4321 for the site and http://localhost:4321/admin for the CMS.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 4321, with the CMS at `/admin` |
| `npm run build` | Type-check with `astro check`, then build for Vercel |
| `npm test` | Unit tests for the glyph math, the hover hint and the demo-run formatting (Vitest) |
| `npm run cv` | Render `cv/cv.html` to `public/downloads/beer-de-vreeze-cv.pdf` with your installed Chrome |

`npm run cv` looks for Chrome in the usual places.
Set `CHROME_PATH` if yours lives somewhere else.

## Edit content

All copy lives in `src/content/` as JSON and is edited through Keystatic.

- `/admin` redirects to `/keystatic`.
- Locally (`npm run dev`), saves write straight to `src/content/` and `public/images/`; commit them like any other change.
- On the live site, the admin signs in with GitHub and commits to `master`, which redeploys the site.
  Only GitHub accounts with write access to this repo can save.
- GitHub sign-in only works on `www.beerdevreeze.com`, not on Vercel preview URLs, because the GitHub App's callback is registered for that domain.

Images uploaded through the CMS are stored as `public/images/<collection>/<slug>/...`.
Keep that layout when adding files by hand, or the CMS will not find them and will drop them on the next save.

The CV is not in the CMS: edit `cv/cv.html`, run `npm run cv`, and commit the PDF.

## Where things live

| Path | Contents |
|---|---|
| `src/content/` | Page copy as JSON: site and about, demo runs, projects, earlier work |
| `keystatic.config.ts` | The CMS schema for everything in `src/content/` |
| `src/data/content.ts` | Reads `src/content/` through Keystatic's reader at build time |
| `src/pages/index.astro` | The home page |
| `src/pages/404.astro`, `src/pages/500.astro` | Error pages, built on `src/components/ErrorScreen.astro` |
| `src/layouts/Base.astro` | `<head>`, fonts and global styles shared by every page |
| `src/components/Hero.astro` | Full-screen glyph field with the top bar, used by home and error pages |
| `src/components/GlyphFigure.astro` | Image shown as glyphs, photo on hover (tap on touch screens) |
| `src/scripts/hero.ts` | Hero canvas: text drawn as glyph density, light that follows the pointer |
| `src/scripts/run.ts` | Demo agent runs typed into the hero |
| `src/scripts/media.ts` | Glyph rendering for images and the showhow video, plus its custom controls |
| `src/scripts/glyph.ts` | Shared luminance-to-glyph math |
| `cv/cv.html`, `scripts/build-cv.mjs` | The CV source and its PDF build |
| `public/sw.js` | Clears and unregisters a service worker an earlier version of the site installed |
| `DESIGN.md`, `PRODUCT.md`, `.impeccable/` | Design system and product notes |

## Deploy

Vercel builds every push.
Pushes to `master` go to production; other branches get preview URLs.

- `vercel.json` pins the framework preset to Astro.
- Pages are prerendered; only the Keystatic routes run as functions (`@astrojs/vercel` adapter).
- Production and Preview need four environment variables from the Keystatic GitHub App: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
  Locally they live in `.env`, which is not committed.
- Do not put media in Git LFS: Vercel serves the LFS pointer file instead of the media.

### Known workaround

`astro.config.mjs` aliases `rolldown` to `src/stubs/empty.js`.
`@astrojs/vercel` 11.0.13 leaks a bare `import "rolldown"` into the server bundle, and Vercel's file tracing leaves out rolldown's native binary, so the CMS function crashed on boot.
Remove the alias once a newer adapter stops importing its build code from the serverless entrypoint.

### Setting up the CMS GitHub App again

Only needed if the app or its keys are lost.

1. Start the admin in GitHub mode and open http://127.0.0.1:4321/keystatic/setup:

   ```powershell
   $env:PUBLIC_KEYSTATIC_GITHUB = "1"; npm run dev
   ```

2. Enter `https://www.beerdevreeze.com` as the deployed URL, click "Create GitHub App", and confirm on GitHub.
   Keystatic writes the four variables to `.env`.
3. Add them to Vercel for Production and Preview with `vercel env add <NAME> production,preview`, then redeploy.
