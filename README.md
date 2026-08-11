# Wonderland — Tanushree Nath

A single-screen portfolio. One fixed viewport holds a watercolor clearing laid
out after `reference/Whisical Garden.png` — the same composition at every screen
size, scaled to fit and never restaged. Three objects are the navigation: the
toadstool cluster leads to Work, the amber toadstool to About, the wishing well
to Playground. Hover reveals a whisper of text, a corner toggle shifts the light
between dawn and dusk, and a `?` in the bottom-right opens a short guide to
navigating a site with no menu.

Nothing scrolls on a desktop screen. Below 768px the garden is drawn larger than
the window on purpose and travels sideways; see *One composition, every screen*.


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

There is no mobile layout, no breakpoint for *placement*, and no second set of
coordinates. Objects are placed as percentages of a **stage** whose aspect ratio
is fixed at the reference painting's 1728 × 1117. Only how large that stage is
drawn ever changes.

Every number below was measured, not eyeballed: each source PNG was located
inside `reference/Whisical Garden.png` by masked template matching, so the
rendered scene registers on the reference almost exactly. If artwork moves,
re-derive rather than nudge.

| object | size | x | y (base) |
|---|---|---|---|
| path stones | 82.41 | 52.31 | 100.00 |
| wishing well | 25.41 | 31.22 | 31.51 |
| amber toadstool | 7.76 | 30.03 | 60.61 |
| toadstool cluster | 17.59 | 72.22 | 70.64 |

Two tokens in `tokens.css` govern the drawing, and they are the only dials worth
touching:

- **`--stage-zoom: 1.18`** — the stage is a contain-fit *multiplied by this*. A
  plain fit leaves the painting's own negative space sitting inside further
  bands of empty paper and the garden reads as a small picture in a large frame;
  past the fit, the path runs off both edges the way a ground plane should.
  Raising it much beyond 1.2 clips the wishing well's roof on a 16:9 screen.
- **`--stage-min: 64dvh`** — the smallest *height* the garden is ever drawn at.

Because the zoom crops, **where** it crops is the whole question, and the answer
is a media query in `Scene.module.css`:

- **Viewport wider than 1728/1117.** The fit is height-bound, so the zoom can
  only go off the top and bottom. The stage is pinned to the top and the entire
  crop is taken off the bottom, because the top of this composition is the well's
  roof at ~5% and the bottom is the near edge of the foreground stone — which
  reads as ground continuing under the viewer.
- **Narrower.** There is spare height to absorb the zoom, so the stage is centred
  and nothing is lost.
- **Under 768px.** Fitting a 1.55 landscape into an upright phone draws it about
  250px tall, which is a garden you cannot see. So the stage stops shrinking at
  `--stage-min`, ends up wider than the screen, and `.scene` scrolls sideways —
  the same composition, entered at the well and followed along the path. The
  stage is anchored `left: 0` there, not centred: overflow to the left of a
  scroll container is unreachable.

Objects also carry a 44px minimum hit area under `@media (pointer: coarse)`,
since the amber toadstool is painted about 35px wide on a phone.

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

- **One dependency beyond React**, `@theme-toggles/react`, for the dawn/dusk
  control. Pinned to the `4.x` line: `5.0.0-rc.0` requires React 19. Its
  shipped `.d.ts` is broken — props are a `Pick<>` over a hand-written union of
  React prop names generated against an older `@types/react`, and three of those
  names no longer exist, which makes them *required*. `Chrome.tsx` restates the
  props it uses rather than fighting it. Note also that the `Spin` toggle
  documented on toggles.dev has never been published to npm; `Around` is what
  ships and is what this uses.

Four conventions worth knowing before editing CSS:

- Shared animations live as **global** `.anim-*` classes in
  [src/styles/motion.css](src/styles/motion.css). CSS Modules rewrite
  `animation-name`, so a module file cannot reference a global keyframe by name
  — it silently resolves to a scoped symbol that does not exist, and the
  element simply sits still. This has bitten twice; check the computed
  `animationName` if an animation appears not to run.
- Objects are centred with the **`translate` property**, never `transform`. The
  enter animation animates `transform` with `fill-mode: both`, which would
  otherwise override the centring once the reveal finished.
- The **light layer** (a wide amber sun at dawn, a small cold moon at dusk) sits
  above the artwork but below type, and is not rendered on `/work`, `/about` or
  `/playground` — over body copy it destroys contrast. Both layers blend with
  `screen`, which is why the dawn light is warm rather than white: screening
  white over cream paper only raises its value and flattens the scene into haze,
  where an amber beam keeps a hue of its own and reads as air.
- **The dialog blur lives on `.scene`, the mood grade on `.artwork`** — two
  filters on two elements because they need very different durations. Dawn to
  dusk is a change of light and takes 2.4s; the blur behind a dialog is UI state
  and must be gone the moment the dialog is. Declared together they have to
  share one duration, and they did: the blur was set on `.artwork`, so removing
  the class fell back to the 2.4s filter transition and the scene took two and a
  half seconds to come back into focus. It is now 0.28s.
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
