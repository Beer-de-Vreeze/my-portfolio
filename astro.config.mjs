import { defineConfig } from "astro/config";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// The site is prerendered; only Keystatic's /keystatic admin and /api/keystatic routes run on demand.
export default defineConfig({
  site: "https://beerdvreeze.nl",
  adapter: vercel(),
  integrations: [react(), keystatic(), sitemap({ filter: (page) => !page.includes("/keystatic") })],
});
