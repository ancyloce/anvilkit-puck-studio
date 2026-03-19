import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";

const root = resolve(import.meta.dirname, "..");
const inputPath = resolve(root, "src/styles.css");
const outputPath = resolve(root, "dist/styles.css");

const source = await readFile(inputPath, "utf8");
const result = await postcss([
  tailwindcss({
    base: root,
    optimize: true,
  }),
]).process(source, {
  from: inputPath,
  to: outputPath,
});

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, result.css, "utf8");

if (result.map) {
  await writeFile(`${outputPath}.map`, result.map.toString(), "utf8");
}

console.log("Built dist/styles.css");
