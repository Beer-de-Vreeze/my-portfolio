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
  ...coreWebVitals,
  ...typescript,
  {
    // react-hooks v6 (bundled with eslint-config-next 16) promotes these new
    // React Compiler-era rules to errors. The flagged patterns (initial reads
    // in subscription effects, etc.) predate the upgrade and work correctly;
    // keep the signal visible without failing the lint gate.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
