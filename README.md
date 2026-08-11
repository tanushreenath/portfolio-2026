# Wonderland — Tanushree Nath

A single-screen portfolio. One fixed viewport holds a watercolor clearing — a
stepping-stone path through a meadow, laid out after `reference/Whisical
Garden.png` — the same composition at every screen size, scaled to fit and never
restaged. Three objects are the navigation: the
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

### The meadow

`src/assets/background.png` — sky and cloud above a horizon at 20.8%, grass and
flower tufts below — is the field the garden stands in. It is exported from the
registry as `backgroundImage` rather than through the `assets` record, because it
is not an object: it is never placed, never hovered, and has no position.

It renders as `.ground`, a layer of its own inside `.scene`, **not** part of
`.artwork`. That separation is what makes the letterboxing disappear: the stage
is a framed composition with a fixed aspect, while the meadow simply covers the
viewport, so there is no longer an edge where the stage stops and paper begins.
`cover` at `center 22%` places the painted horizon a little above the point the
path recedes to, so the trail dies out into open field rather than running exactly
to the skyline.

Under 768px `.ground` takes the same width as `.artwork`, so the field scrolls
with the garden. Left viewport-width, the grass would sit still while the path
slid across it. This is why `--stage-aspect` is set on `.scene` and not on
`.artwork` — both children derive their width from it, and a custom property set
on a child is not visible to its parent.

Dusk is made rather than drawn, since there is only one painting of a sunlit
field: `--ground-filter` takes the light down and the colour out, and
`--ground-tint` lays the night blue over the top.

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

Conventions worth knowing before editing CSS:

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
  a `text-shadow` keyed to **`--halo`**, which is deliberately *not* `--paper`.
  They used to be the same value, because the garden sat on flat paper and a
  glow the colour of the paper was invisible until it crossed a painting. With a
  meadow behind the type, `--paper` is no longer what is actually behind it and
  a cream glow over grass reads as a smudge. Measured against the rendered
  scene, corner type sits at 5.7:1 against bare grass and 6.5–8.6:1 with the
  halo at dawn, 8.1–15:1 at dusk.
- **A `filter` applies to an element's pseudo-elements too.** `.ground` carries
  the meadow on `::before` and the night tint on `::after` for exactly this
  reason: with both on one filtered box, `--ground-tint` was multiplied by its
  own `brightness(0.4)` and the field came out neutral grey whatever colour was
  asked for.
- **Every mood-graded filter lists the same three functions in the same order**
  — `saturate() brightness() contrast()` — in both moods. This is not tidiness.
  A filter list interpolates function by function, and two lists differing in
  order or length are not interpolable *at all*: the value snaps in the first
  frame and the `transition` is silently discarded. That is what made going
  dark read as a jolt while only the tint eased; measured, the ground filter
  reached its final value within 300ms of a 2.4s transition.
- **Night is made by removing light, not by moving colour.** Only `brightness`
  differs between the moods, so every painting is the colour it was painted,
  just darker. `hue-rotate()` is the only filter that could tint the cut-out
  paintings themselves toward blue and it is the wrong tool: it rotates every
  hue by the same angle rather than pulling them toward one, so the red
  toadstool lands on teal and the blue one on brown, and the transition sweeps
  the whole colour wheel getting there. The blue of night comes from
  `--ground-tint` alone — one flat colour, over the field only.
- **One light over the whole clearing.** At dusk grass, stones, well and
  toadstools all take `--ground-filter` (`brightness(0.3)`) and `--ground-tint`
  — nothing is painted brighter than its surroundings, so the scene goes down
  to night as one thing. Measured at rest: grass `rgb(45,51,48)`, path stone
  `rgb(38,39,45)`, toadstool cap `rgb(45,29,41)`. A field of stars fades in
  over the upper sky (`--stars-opacity`).
- **What marks a destination is that it answers you.** `--object-lift` (1.91)
  and `--object-lift-tint` (0.24) raise a hovered or focused painting back to
  `brightness(0.7)` with the wash at 0.28 — measured, a hovered cap lands on
  `rgb(120,53,54)` against the `rgb(116,53,54)` it used to sit at permanently.
  The two numbers are a ratio off `--ground-filter`, not a taste: `0.7 / 0.3`
  for the brightness, and the tint scale a little under it because the lift
  brightens the wash along with the painting. **Change the field's brightness
  and both want re-deriving.**
- A finger cannot hover, so under `@media (hover: none)` the lift is simply
  always on. It is the whole affordance now that everything rests at the same
  darkness — without it there would be nothing on a phone at dusk to say which
  paintings are the way in. The `scale(1.02)` is not carried over; that one
  answers a cursor, and there is no cursor.
- **The night blue reaches the paintings through a mask, not a filter.** Each
  painting carries a `.tint` sibling — a block of `--object-tint` /
  `--scenery-tint` cut to the painting's own silhouette by using the same image
  file as a `mask-image`. A rectangle would tint the transparent margin every
  asset carries and put a dark card behind each toadstool; `hue-rotate` was the
  only filter alternative and it is not one. The path takes `--ground-tint`
  itself, so stone and grass land on the same value: measured off the rendered
  scene, grass `rgb(37,41,34)` against stone `rgb(38,39,45)`.
- `.tint` is a **sibling** of `.image`, never a child, because `.image` holds
  the mood grade and a filter applies to its whole subtree. Nested, the wash
  would be multiplied by the very `brightness(0.3)` it is meant to sit beside,
  and the path would end up darker than the field it is supposed to match — the
  same trap as `.ground::after`, one level down. The hover lift and the mirror
  both moved up to `.plate` for the opposite reason: they must apply to the
  painting and its wash together, or a rim of untinted painting shows around
  the edge while the cursor rests.
- The two halves of the ground are **staggered** — `--ground-tint` over 1.1s,
  `--ground-filter` over 1.6s after a 0.55s delay — so dusk falls over the
  field first and the light drains out of it after. Run together the whole
  change lands at once and reads as a cut. Transitions reverse symmetrically,
  so dawn plays it backwards.
- Each object picks its own `labelSide` (`left`/`right`/`above`) in content, so
  a hover reveal never lands on artwork: the well has open paper to its right,
  the amber toadstool to its left, the cluster above it.

## Verifying

```bash
npm run dev -- --port 5199 --strictPort
node scripts/verify.mjs        # tab order, keyboard, no-scroll, reduced motion
node scripts/shot.mjs http://localhost:5199/ out.png 1440 900 dusk hover
```
