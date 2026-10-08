// Stands in for rolldown in the server bundle; see astro.config.mjs. Nothing at runtime should call it.
export function rolldown() {
  throw new Error("rolldown is not available in the server bundle");
}
