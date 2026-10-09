import { defineConfig } from "astro/config";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";

// The site is prerendered; only Keystatic's /keystatic admin and /api/keystatic routes run on demand.
export default defineConfig({
  site: "https://www.beerdevreeze.com",
  // Vercel's image optimizer resizes images on request, including ones uploaded later through the CMS.
  adapter: vercel({ imageService: true, imagesConfig: { sizes: [640, 960, 1280] } }),
  // Shorter address for the CMS admin.
  redirects: { "/admin": { status: 302, destination: "/keystatic" } },
  integrations: [react(), keystatic(), sitemap({ filter: (page) => !page.includes("/keystatic") })],
  vite: {
    // Pre-bundle the CMS admin's dependencies at startup; discovering them on the first visit to /admin
    // makes Vite re-bundle mid-load ("504 Outdated Optimize Dep") and the admin renders blank.
    optimizeDeps: { include: ["@keystatic/core", "@keystatic/core/ui", "@keystatic/astro/ui", "react", "react-dom/client"] },
    resolve: {
      // shortcut: @astrojs/vercel 11.0.13 leaks a bare `import "rolldown"` into the server bundle, and Vercel's
      // file tracing leaves out rolldown's native binary, so the function crashes on boot. Nothing at runtime
      // uses it; drop this alias once the adapter stops importing its build code from the serverless entrypoint.
      alias: { rolldown: fileURLToPath(new URL("./src/stubs/empty.js", import.meta.url)) },
    },
  },
});
