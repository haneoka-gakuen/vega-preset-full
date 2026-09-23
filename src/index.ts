import { createCompositePlugin } from "@haneoka/vega-plugin-composite";
import {
  defineVegaPlugin,
  type VegaPlugin,
  type VegaPluginContext,
  type VegaThemeContribution,
} from "@haneoka/vega/plugin";
import { createCubismPlugin, type CubismRuntimeAdapter } from "@haneoka/vega-plugin-cubism";
import { createSpinePlugin, type SpineRuntimeAdapter } from "@haneoka/vega-plugin-spine";
import { createVegaEndingPlugin, type VegaEndingPluginOptions } from "@haneoka/vega-plugin-ending";
import { createVegaRichTextPlugin } from "@haneoka/vega-plugin-richtext";
import { createWebGalCompatibilityPlugin } from "@haneoka/vega-plugin-webgal";
import { createPixiRendererPlugin } from "@haneoka/vega-renderer-pixi";
import { createThreeRendererPlugin } from "@haneoka/vega-renderer-three";
import vegaDefaultShell from "@haneoka/vega-shell-default";
import { vegaHaneokaTheme, HANEOKA_POST_TEXTURE_ASSETS } from "@haneoka/vega-theme-haneoka";
import { vegaPortableUiPlugin } from "@haneoka/vega-ui-portable";

export interface VegaFullPresetRichTextOptions {
  readonly bbcode?: boolean;
  readonly html?: boolean;
  readonly latex?: boolean;
  readonly markdown?: boolean;
  readonly typst?: boolean;
}

export interface VegaFullPresetOptions {
  readonly renderer?: "pixi" | "three" | "webgal" | false;
  readonly shell?: boolean;
  readonly theme?: "portable" | "haneoka" | "webgal" | false;
  readonly cubism?: CubismRuntimeAdapter | false;
  readonly composite?: boolean;
  readonly spine?: SpineRuntimeAdapter | false;
  /** Completion screen. Enabled with portable defaults unless set to false. */
  readonly ending?: VegaEndingPluginOptions | false;
  /**
   * Optional format renderers. Each selected renderer is loaded only when its
   * plugin activates. The format-neutral service is always included when the
   * portable or Haneoka UI needs it.
   */
  readonly richText?: VegaFullPresetRichTextOptions | false;
  readonly additionalPlugins?: readonly VegaPlugin[];
}

interface LazyRichTextPluginDescriptor {
  readonly id: string;
  readonly name: string;
  readonly load: () => Promise<{ readonly default: VegaPlugin }>;
}

const RICH_TEXT_FORMAT_PLUGINS = Object.freeze({
  bbcode: {
    id: "haneoka.vega-richtext-bbcode",
    name: "Vega Rich Text — BBCode",
    load: () => import("@haneoka/vega-plugin-richtext-bbcode"),
  },
  html: {
    id: "haneoka.vega-richtext-html",
    name: "Vega Rich Text — HTML",
    load: () => import("@haneoka/vega-plugin-richtext-html"),
  },
  latex: {
    id: "haneoka.vega-richtext-latex",
    name: "Vega Rich Text — LaTeX",
    load: () => import("@haneoka/vega-plugin-richtext-latex"),
  },
  markdown: {
    id: "haneoka.vega-richtext-markdown",
    name: "Vega Rich Text — Markdown",
    load: () => import("@haneoka/vega-plugin-richtext-markdown"),
  },
  typst: {
    id: "haneoka.vega-richtext-typst",
    name: "Vega Rich Text — Typst",
    load: () => import("@haneoka/vega-plugin-richtext-typst"),
  },
} satisfies Readonly<Record<keyof VegaFullPresetRichTextOptions, LazyRichTextPluginDescriptor>>);

const createLazyRichTextPlugin = ({ id, name, load }: LazyRichTextPluginDescriptor): VegaPlugin =>
  defineVegaPlugin({
    manifest: {
      id,
      name,
      version: "0.1.0",
      apiVersion: 1,
      description: `${name} lazy format adapter`,
      dependencies: {
        "haneoka.vega-richtext": "^0.1.0",
      },
      capabilities: ["rich-text"],
    },
    async setup(context) {
      const plugin = (await load()).default;
      return plugin.setup(context);
    },
  });

const withThemeDefault = (plugin: VegaPlugin, themeId?: string, includeThemes = true): VegaPlugin => ({
  manifest: plugin.manifest,
  setup(context) {
    const themedContext: VegaPluginContext = {
      ...context,
      contribute: ((
        kind: Parameters<VegaPluginContext["contribute"]>[0],
        contribution: Parameters<VegaPluginContext["contribute"]>[1],
        contributionOptions?: Parameters<VegaPluginContext["contribute"]>[2],
      ) => {
        if (kind !== "theme") {
          return context.contribute(kind as never, contribution as never, contributionOptions);
        }
        if (!includeThemes) return () => undefined;
        const theme = contribution as VegaThemeContribution;
        return context.contribute(
          "theme",
          Object.freeze({
            ...theme,
            default: theme.id === themeId,
          }),
          contributionOptions,
        );
      }) as VegaPluginContext["contribute"],
    };
    return plugin.setup(themedContext);
  },
});

/**
 * Returns plugins in dependency-safe order. The preset is data-free and does
 * not hide adapter choices: model runtimes appear only when explicitly
 * supplied by the application.
 */
export const createVegaFullPreset = (options: VegaFullPresetOptions = {}): readonly VegaPlugin[] => {
  const renderer = options.renderer ?? "three";
  const theme = options.theme ?? (renderer === "webgal" ? "webgal" : options.shell === false ? "portable" : "haneoka");
  if (theme === "haneoka" && options.shell === false) {
    throw new TypeError("The Haneoka theme requires the portable UI and default shell");
  }
  const plugins: VegaPlugin[] = [];
  const richTextFormats = options.richText && typeof options.richText === "object" ? options.richText : undefined;

  if (renderer === "webgal") {
    plugins.push(
      withThemeDefault(
        createWebGalCompatibilityPlugin({
          enableTheme: theme === "webgal",
        }),
        theme === "webgal" ? "webgal" : undefined,
      ),
    );
  } else if (renderer === "pixi") {
    plugins.push(createPixiRendererPlugin());
  } else if (renderer === "three") {
    plugins.push(
      createThreeRendererPlugin({
        ...(theme === "haneoka" ? { postTextureAssets: HANEOKA_POST_TEXTURE_ASSETS } : {}),
      }),
    );
  }
  if (theme === "webgal" && renderer !== "webgal") {
    plugins.push(
      withThemeDefault(
        createWebGalCompatibilityPlugin({
          enableRenderer: false,
          enableCommands: renderer === "pixi" || renderer === "three",
        }),
        "webgal",
      ),
    );
  }
  if (theme === "portable" || theme === "haneoka" || richTextFormats !== undefined) {
    plugins.push(createVegaRichTextPlugin());
  }
  if (richTextFormats) {
    for (const format of ["bbcode", "html", "latex", "markdown", "typst"] as const) {
      if (richTextFormats[format]) {
        plugins.push(createLazyRichTextPlugin(RICH_TEXT_FORMAT_PLUGINS[format]));
      }
    }
  }
  if (theme === "portable") {
    plugins.push(withThemeDefault(vegaPortableUiPlugin, "portable"));
  }
  if (theme === "haneoka") {
    plugins.push(withThemeDefault(vegaPortableUiPlugin));
  }
  if (options.composite !== false && renderer === "three") plugins.push(createCompositePlugin());
  if (options.cubism) {
    plugins.push(createCubismPlugin({ adapter: options.cubism }));
  }
  if (options.spine) {
    plugins.push(createSpinePlugin({ adapter: options.spine }));
  }
  if (options.shell !== false) {
    plugins.push(withThemeDefault(vegaDefaultShell, undefined, theme !== false));
  }
  if (theme === "haneoka") {
    plugins.push(withThemeDefault(vegaHaneokaTheme, "haneoka"));
  }
  if (options.ending !== false) {
    plugins.push(createVegaEndingPlugin(options.ending && typeof options.ending === "object" ? options.ending : {}));
  }
  plugins.push(
    ...(options.additionalPlugins ?? []).map((plugin) =>
      withThemeDefault(plugin, theme === false ? undefined : theme, theme !== false),
    ),
  );

  const ids = new Set<string>();
  for (const plugin of plugins) {
    if (ids.has(plugin.manifest.id)) {
      throw new Error(`Vega full preset contains duplicate plugin ${plugin.manifest.id}`);
    }
    ids.add(plugin.manifest.id);
  }
  return Object.freeze(plugins);
};

export default createVegaFullPreset;
