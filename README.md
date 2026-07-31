# `@haneoka/vega-preset-full`

Ready-to-use Vega preset with the Pixi renderer, portable story UI, default
game shell, and optional official plugins.

```ts
const engine = new VegaEngine({
  officialPlugins: createVegaFullPreset({
    cubism: authorizedCubismAdapter,
    spine: authorizedSpineAdapter,
    richText: { markdown: true, bbcode: true },
  }),
});
```

Three.js rendering, Haneoka and WebGAL themes, Cubism, Spine, HTML, Markdown,
LaTeX, Typst, and BBCode can be enabled as needed.
