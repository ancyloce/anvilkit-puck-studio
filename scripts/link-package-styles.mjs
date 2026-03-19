import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const entries = [
  {
    path: resolve(root, "dist/index.js"),
    statement: 'import "./styles.css";',
  },
  {
    path: resolve(root, "dist/overrides.js"),
    statement: 'import "./styles.css";',
  },
  {
    path: resolve(root, "dist/index.cjs"),
    statement: 'require("./styles.css");',
  },
  {
    path: resolve(root, "dist/overrides.cjs"),
    statement: 'require("./styles.css");',
  },
];

for (const entry of entries) {
  const source = await readFile(entry.path, "utf8");

  if (source.startsWith(`${entry.statement}\n`)) {
    continue;
  }

  await writeFile(entry.path, `${entry.statement}\n${source}`, "utf8");
}

console.log("Linked dist/styles.css to package runtime entrypoints.");
