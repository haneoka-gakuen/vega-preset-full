# Vega Full Preset

Everything you need to ship a visual novel with
[Vega](https://github.com/haneoka-gakuen/vega), assembled in one call: a
renderer, the story UI, a game shell with title screen, saves and settings, a
theme, an ending screen, and — when you want them — Live2D, Spine, composed
characters and rich-text formats. Every piece is an official plugin; the
preset picks compatible versions, wires them in the right order and lets you
switch any of them off.

## Install

```sh
pnpm add @haneoka/vega @haneoka/vega-preset-full three@0.184
```

Use `pixi.js@6` instead of Three.js if you choose the Pixi or WebGAL
renderer.

## Use it

```ts
import { VegaEngine } from "@haneoka/vega/engine";
import createVegaFullPreset from "@haneoka/vega-preset-full";

const engine = new VegaEngine({ officialPlugins: createVegaFullPreset() });
const player = await engine.createPlayer({ mount: document.querySelector("#game")!, story });
```

With no options you get the Three.js renderer, the portable story UI, the
default shell with the Haneoka theme, composed characters, the rich-text
service and the ending screen.

## Options

| Option | Values | Default |
| --- | --- | --- |
| `renderer` | `"three"`, `"pixi"`, `"webgal"` (Pixi with WebGAL's stage profile), or `false` for the DOM fallback | `"three"` |
| `theme` | `"haneoka"`, `"portable"`, `"webgal"`, or `false` | `"webgal"` with the WebGAL renderer; `"portable"` without a shell; otherwise `"haneoka"` |
| `shell` | Include the [default game shell](https://github.com/haneoka-gakuen/vega-shell-default) | `true` |
| `ending` | [Ending screen](https://github.com/haneoka-gakuen/vega-plugin-ending) options, or `false` | enabled |
| `composite` | [Composed characters](https://github.com/haneoka-gakuen/vega-plugin-composite) (Three.js only) | `true` |
| `cubism` | A Cubism runtime adapter to enable [Live2D](https://github.com/haneoka-gakuen/vega-plugin-cubism) | off |
| `spine` | A Spine runtime adapter to enable [Spine](https://github.com/haneoka-gakuen/vega-plugin-spine) | off |
| `richText` | `{ markdown, bbcode, html, latex, typst }` — formats to support in dialogue | none |
| `additionalPlugins` | Your own plugins, added last | none |

```ts
createVegaFullPreset({
  renderer: "pixi",
  theme: "portable",
  cubism: cubismAdapter,
  richText: { markdown: true, bbcode: true },
  ending: { heading: "Fin", message: "Thank you for playing." },
  additionalPlugins: [myAnalyticsPlugin],
});
```

A few rules the preset enforces:

- The Haneoka theme needs the shell; `theme: "haneoka"` with `shell: false`
  throws.
- Rich-text formats are loaded lazily — a format's code is only fetched when
  its plugin activates.
- Live2D and Spine are never enabled implicitly. You pass the adapter, which
  is where your licensed SDK comes in.
- The chosen theme becomes the default theme of every plugin that brings one,
  including your `additionalPlugins`.
- A plugin id may appear only once; adding an official plugin again through
  `additionalPlugins` throws.

The return value is a frozen array of plugins in dependency order. Pass it as
`officialPlugins`, or combine it with others.

## What is included

| Plugin | When |
| --- | --- |
| [Three.js renderer](https://github.com/haneoka-gakuen/vega-renderer-three) | `renderer: "three"` |
| [Pixi renderer](https://github.com/haneoka-gakuen/vega-renderer-pixi) | `renderer: "pixi"` |
| [WebGAL compatibility](https://github.com/haneoka-gakuen/vega-plugin-webgal) | `renderer: "webgal"` or `theme: "webgal"` |
| [Portable UI](https://github.com/haneoka-gakuen/vega-ui-portable) | `theme` is `"portable"` or `"haneoka"` |
| [Rich text](https://github.com/haneoka-gakuen/vega-plugin-richtext) and its formats | with the portable or Haneoka UI, or when `richText` is set |
| [Default shell](https://github.com/haneoka-gakuen/vega-shell-default) | unless `shell: false` |
| [Haneoka theme](https://github.com/haneoka-gakuen/vega-theme-haneoka) | `theme: "haneoka"` |
| [Composed models](https://github.com/haneoka-gakuen/vega-plugin-composite) | Three.js renderer, unless `composite: false` |
| [Cubism](https://github.com/haneoka-gakuen/vega-plugin-cubism), [Spine](https://github.com/haneoka-gakuen/vega-plugin-spine) | when you pass an adapter |
| [Ending](https://github.com/haneoka-gakuen/vega-plugin-ending) | unless `ending: false` |

## License

MPL-2.0. See [LICENSE](LICENSE).
