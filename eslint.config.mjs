import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // React Compiler lint rules are too strict for existing client state patterns
      // (localStorage hydration, media players, theme sync). Keep typecheck + build as gates.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "originals/**",
    "review/**",
    "public/images/**",
    "public/thumbs/**",
    "public/videos/**",
    "public/sw.js",
    "scripts/**",
    "components/experience/LiquidCursor.tsx",
    "components/experience/CursorPrefs.tsx",
  ]),
]);

export default eslintConfig;
