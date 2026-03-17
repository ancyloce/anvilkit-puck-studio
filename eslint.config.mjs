// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      /**
       * Prevent deep-path imports of types that belong in src/types/public.ts.
       * Internal src/ files should import shared types via @/types/public,
       * not by reaching into sibling component files directly.
       */
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["**/components/editor/Studio"],
              importNames: ["StudioProps", "ImagesProps", "CopywritingProps"],
              message:
                "Import public types from '@/types/public' instead of deep component paths.",
            },
            {
              group: ["**/sidebar/library/ImageLibrary"],
              importNames: ["ImageItem", "ImagesProps"],
              message:
                "Import public types from '@/types/public' instead of deep component paths.",
            },
            {
              group: ["**/sidebar/library/CopyLibrary"],
              importNames: ["CopywritingItem", "CopywritingProps"],
              message:
                "Import public types from '@/types/public' instead of deep component paths.",
            },
          ],
        },
      ],
    },
  },
  {
    // The public types file itself is exempt — it IS the canonical source
    files: ["src/types/public.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    // Demo app has no restrictions
    files: ["app/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".next/**"],
  },
);
