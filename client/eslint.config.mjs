import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // TODO: tighten these back to "error" once addressed file-by-file.
    // - no-explicit-any: ~35 spots need real types matching the FastAPI
    //   response schemas instead of `any`; needs per-endpoint review.
    // - set-state-in-effect: 3 spots call setState directly inside a
    //   useEffect; needs each effect restructured, not a blanket fix.
    // Kept as "warn" (not disabled) so they still surface in `npm run lint`
    // and PR annotations instead of being silently ignored.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;