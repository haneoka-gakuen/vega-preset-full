import type { VegaProject } from "@haneoka/vega-protocol";

export const VEGA_FULL_PRESET_PLUGIN_IDS = Object.freeze([
  "haneoka.renderer-three",
  "haneoka.cubism",
  "haneoka.spine",
  "haneoka.composite",
  "haneoka.webgal-runtime",
  "haneoka.vega-portable-ui",
  "haneoka.vega-shell-default",
  "haneoka.theme",
  "haneoka.vega-richtext",
  "haneoka.vega-richtext-bbcode",
  "haneoka.vega-richtext-html",
  "haneoka.vega-richtext-latex",
  "haneoka.vega-richtext-markdown",
  "haneoka.vega-richtext-typst",
  "haneoka.vega-ending",
]);
const supported = new Set(VEGA_FULL_PRESET_PLUGIN_IDS);
export function unsupportedVegaFullPresetPlugins(project: VegaProject): readonly string[] {
  return (project.plugins ?? [])
    .filter((plugin) => plugin.required !== false && (!supported.has(plugin.id) || plugin.version !== "0.1.0"))
    .map((plugin) => `${plugin.id}@${plugin.version}`);
}
