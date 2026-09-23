import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const distribution = await readFile(new URL("../dist/index.js", import.meta.url), "utf8");
if (!manifest.repository?.url?.endsWith("/vega-preset-full.git")) {
  throw new Error("package repository must point to the independent preset repository");
}
if (manifest.publishConfig?.access !== "public" || manifest.publishConfig?.provenance !== true) {
  throw new Error("public provenance publishing is required");
}
if (manifest.sideEffects !== false) {
  throw new Error("preset must remain tree-shakeable");
}
for (const prohibited of ["cubism-core", "live2d", "spine-core", "spine-runtime"]) {
  if (Object.keys(manifest.dependencies ?? {}).some((name) => name.toLowerCase().includes(prohibited))) {
    throw new Error(`preset cannot depend on external runtime ${prohibited}`);
  }
}
for (const format of ["bbcode", "html", "latex", "markdown", "typst"]) {
  const packageName = `@haneoka/vega-plugin-richtext-${format}`;
  if (!distribution.includes(`import("${packageName}")`)) {
    throw new Error(`${packageName} must remain a dynamic import`);
  }
  if (distribution.includes(`from "${packageName}"`)) {
    throw new Error(`${packageName} cannot be imported eagerly`);
  }
}
process.stdout.write("Preset package boundary verified: adapters only, optional formats remain lazy\n");
