# `@haneoka/vega-preset-full`

Ready-to-use Vega preset with the Three renderer, portable story UI, default
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

Haneoka and WebGAL themes, Cubism, Spine, HTML, Markdown, LaTeX, Typst, and BBCode
can be enabled as needed.

All maintained scenes use Three. Select `theme: "webgal"` for WebGAL presentation.
`renderer: false` continues to let the application supply its own backend.
