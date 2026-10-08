import { defineConfig } from "astro/config";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";

// The site is prerendered; only Keystatic's /keystatic admin and /api/keystatic routes run on demand.
export default defineConfig({
  site: "https://www.beerdevreeze.com",
  adapter: vercel(),
  integrations: [react(), keystatic(), sitemap({ filter: (page) => !page.includes("/keystatic") })],
  vite: {
    resolve: {
      // shortcut: @astrojs/vercel 11.0.13 leaks a bare `import "rolldown"` into the server bundle, and Vercel's
      // file tracing leaves out rolldown's native binary, so the function crashes on boot. Nothing at runtime
      // uses it; drop this alias once the adapter stops importing its build code from the serverless entrypoint.
      alias: { rolldown: fileURLToPath(new URL("./src/stubs/empty.js", import.meta.url)) },
    },
  },
});
