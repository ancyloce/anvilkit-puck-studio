import { defineConfig } from "tsup";

const sharedExternal = [
  "react",
  "react-dom",
  "@puckeditor/core",
  "@base-ui/react",
  "tailwindcss",
];

export default defineConfig({
  entry: {
    index: "src/index.ts",
    legacy: "src/index.legacy.ts",
    overrides: "src/core/overrides/index.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  splitting: true,
  external: sharedExternal,
  minify: true,
});
