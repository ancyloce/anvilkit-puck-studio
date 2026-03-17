import { defineConfig } from "tsup";

const sharedExternal = [
  "react",
  "react-dom",
  "@puckeditor/core",
  "@base-ui/react",
  "tailwindcss",
];

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: false,
    clean: true,
    treeshake: true,
    splitting: true,
    external: sharedExternal,
  },
  {
    entry: { legacy: "src/index.legacy.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: false,
    clean: false,
    treeshake: true,
    splitting: false,
    external: sharedExternal,
  },
  {
    entry: { overrides: "src/components/overrides/index.tsx" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: false,
    clean: false,
    treeshake: true,
    splitting: false,
    external: sharedExternal,
  },
  {
    entry: { styles: "src/styles.css" },
    format: ["esm"],
    sourcemap: false,
    clean: false,
  },
]);
