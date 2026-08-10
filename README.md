# Wonderland — Tanushree Nath

A single-screen, non-scrolling portfolio. One fixed viewport holds a watercolor
clearing laid out after `reference/Whisical Garden.png` — the same composition
at every screen size, scaled to fit and never restaged. Three objects are the
navigation: the toadstool cluster leads to Work, the amber toadstool to About,
the wishing well to Playground. Hover reveals a whisper of text, a corner control
shifts the light between dawn and dusk, and a `?` in the bottom-right opens a
short guide to navigating a site with no menu.

The design spec is [docs/superpowers/specs/2026-08-10-wonderland-portfolio-design.md](docs/superpowers/specs/2026-08-10-wonderland-portfolio-design.md).

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static output in dist/
npm run typecheck
```

If port 5173 misbehaves, use another one — a service worker cached by an
unrelated project on that port can hijack it:
`npm run dev -- --port 5199 --strictPort`.

## Changing the content

Everything is driven by **[src/content/content.json](src/content/content.json)**.
No copy, link, position, or case study lives in a component. Editing that file
is how the site changes.

An object entry controls where a painting sits and what it means:

```jsonc
{
  "id": "work",
  "href": "/work",             // omit for scenery
  "aspect": 1.0667,            // required when an object has several parts
  "parts": [                   // one painting, or several forming a cluster
    { "asset": "toadstool-red", "x": 49.01, "y": 94.04, "w": 58.55, "delay": -0.4 }
  ],
  "band": "foreground",        // foreground | midground | distance
  "position": { "x": 72.22, "y": 70.64 },   // % of the stage; y is the base
  "size": 17.59,                            // width as % of the stage
  "label": { "title": "Work", "meta": "Selected projects" }
}
```

A **cluster** is several paintings inside one object, so the three toadstools
answer as a single button. Within a cluster, a part's `x`/`y`/`w` are
percentages of the object's own box (`x` a centre, `y` a base), which is why
the grouping holds its shape at any size.

`position.y` is the object's **base**, because objects hinge at the bottom like
a plant rooted in soil. `size` is the final rendered width; the band does not
scale it further.

### One composition, every screen

There is no mobile layout, no breakpoint, and no second set of coordinates.
Objects are placed as percentages of a **stage** whose aspect ratio is fixed at
the reference painting's 1728 × 1117, and the stage is fitted into the viewport
like `object-fit: contain` and centred. Resizing the window changes only how
large the garden is drawn — a phone and a 5K display show the identical picture.

Every number above was measured, not eyeballed: each source PNG was located
inside `reference/Whisical Garden.png` by masked template matching, so the
rendered scene registers on the reference almost exactly. If artwork moves,
re-derive rather than nudge.

| object | size | x | y (base) |
|---|---|---|---|
| path stones | 82.41 | 52.31 | 100.00 |
| wishing well | 25.41 | 31.22 | 31.51 |
| amber toadstool | 7.76 | 30.03 | 60.61 |
| toadstool cluster | 17.59 | 72.22 | 70.64 |

The cost of one composition is that a portrait phone draws the garden small —
a band of landscape across the middle of the paper, with the corner type clear
of it above and below. Objects therefore carry a 44px minimum hit area under
`@media (pointer: coarse)`, since the amber toadstool is painted about 30px
wide on a phone.

## Adding artwork

The nine resume-derived projects live in `content.work`, ready for the /work
page's design. A part whose asset is missing from the registry is skipped at
render time rather than breaking the scene.

To add one:

1. Generate it using the locked prompt in [docs/asset-prompt-pack.md](docs/asset-prompt-pack.md).
   **Transparent background**, light from the upper left, no baked ground shadow.
2. Drop the original in `reference/`, and an unmodified copy in
   `src/assets/objects/<id>.png`.
3. Register it in [src/assets/registry.ts](src/assets/registry.ts), choosing a
   `?w=` roughly twice the width it will actually be drawn at.

## How it is put together

- **Vite + React + TypeScript**, static build. Four routes (`/`, `/work`,
  `/about`, `/playground`) handled by a ~25-line hook rather than a router.
  Because these are real paths, **a static host must fall back to index.html**
  for unknown paths, or a direct visit to /work will 404.
- **No animation library, and no JavaScript animation at all.** Every movement
  is a CSS keyframe over layered images.
- **Assets are used exactly as delivered.** No keying, no background removal, no
  glow or shadow passes. `imagetools` converts and resizes at build time, so the
  sources on disk are never rewritten — 14MB of PNG ships as ~1.1MB of WebP.

Three conventions worth knowing before editing CSS:

- Shared animations live as **global** `.anim-*` classes in
  [src/styles/motion.css](src/styles/motion.css). CSS Modules rewrite
  `animation-name`, so a module file cannot reference a global keyframe by name
  — it silently resolves to a scoped symbol that does not exist, and the
  element simply sits still. This has bitten twice; check the computed
  `animationName` if an animation appears not to run.
- Objects are centred with the **`translate` property**, never `transform`. The
  enter animation animates `transform` with `fill-mode: both`, which would
  otherwise override the centring once the reveal finished.
- The **light layer** (a wide diffuse sun at dawn, a small cold moon at dusk)
  sits above the artwork but below type, and is not rendered on `/work`,
  `/about` or `/playground` — over body copy it destroys contrast.
- Stacking is declared once in `tokens.css` as `--z-light: 400`,
  `--z-grain: 450`, `--z-label: 620`, `--z-chrome: 650`, `--z-dialog: 800`.
  Every tinted layer sits below `--z-label` and every piece of type above it,
  so nothing ever washes out the text. Corner type and hover labels also carry
  a `text-shadow` keyed to `--paper`: invisible on plain paper, enough to hold
  11px type legible where a corner crosses a painted stone.
- At dusk, `--scenery-dim` holds the path back from the light so the three
  clickable objects read as the figures and the ground recedes, and a field of
  stars fades in over the upper sky (`--stars-opacity`).
- Each object picks its own `labelSide` (`left`/`right`/`above`) in content, so
  a hover reveal never lands on artwork: the well has open paper to its right,
  the amber toadstool to its left, the cluster above it.

## Verifying

```bash
npm run dev -- --port 5199 --strictPort
node scripts/verify.mjs        # tab order, keyboard, no-scroll, reduced motion
node scripts/shot.mjs http://localhost:5199/ out.png 1440 900 dusk hover
```
