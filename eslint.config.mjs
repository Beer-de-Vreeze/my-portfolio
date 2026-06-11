import { fixupConfigRules } from "@eslint/compat";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "**/.next/",
      "**/out/",
      ".claude/",
      "next-env.d.ts",
      "public/sw.js",
      "public/workbox-*.js",
      "public/swe-worker-*.js",
      "tsconfig.tsbuildinfo",
    ],
  },
  // fixupConfigRules bridges plugins that still use context APIs removed in
  // ESLint 10 (eslint-plugin-react inside eslint-config-next calls
  // context.getFilename()). Drop it once eslint-config-next ships an
  // ESLint 10-ready eslint-plugin-react.
  ...fixupConfigRules(coreWebVitals),
  ...fixupConfigRules(typescript),
];

export default eslintConfig;
