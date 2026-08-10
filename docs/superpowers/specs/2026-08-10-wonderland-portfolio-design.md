# Wonderland — Portfolio for Tanushree Nath

**PRD & Design Specification**
Date: 2026-08-10
Status: Approved design, ready for implementation planning

---

## 1. Summary

A single-screen, non-scrolling portfolio for **Tanushree Nath, Product Designer**. The entire site is one fixed viewport containing a watercolor Wonderland clearing painted on near-white paper. Eight objects sit in the clearing — toadstools, a wishing well, a key, a bottle, a teacup, a pocket watch, a lantern. Each object is a piece of work.

Hovering an object reveals a whisper of text. Clicking opens the case study as an overlay while the clearing stays visible behind it, blurred. A small control shifts the light from day to sunset to night. Nothing on the scene ever scrolls.

All content — profile, welcome message, object positions, work items, case studies, experience, links — is driven by a single `content.json`. Adding or removing a piece of work is a config edit, never a redesign.

### 1.1 Design principles, in priority order

1. **The paper is mostly empty.** Negative space is the primary material. When a decision is contested, the one that leaves more empty paper wins.
2. **The scene is the interface.** There is no nav bar, no menu, no hamburger. Objects are the navigation.
3. **Text whispers.** Body and label text is 11–14px mono, confined to the four corners and to hover reveals. If a sentence can be cut, cut it.
4. **Motion is weather, not animation.** Everything drifts, breathes, and sways on a slow shared clock. Nothing bounces, pops, or demands attention.
5. **One painting, not a collage.** A unifying grain overlay, a single light source, and one atmospheric depth rule bind every asset into a single image.

### 1.2 Explicit non-goals

- No scrolling on the scene, at any breakpoint, in any state.
- No Alice in Wonderland *narrative*. No characters, no plot, no quotes from the book. Wonderland is a visual register only — scale play, botanical strangeness, tea things, keys and doors.
- No page-to-page routing for case studies. Overlays only.
- No WebGL, no GSAP, no Framer Motion, no scroll-driven animation libraries.
- No blog, no journal, no CMS.

---

## 2. Reference research

Two references govern this build, and they govern **different things**. Keeping them separate is essential.

### 2.1 chloeyan.me — governs motion, layout, restraint

I fetched and decompiled the live site. Findings, verified from its shipped stylesheet and build manifest:

**Stack.** Next.js pages router, static export. **No animation library** — no GSAP, no Framer Motion, no Lenis, no scroll library. The entire scene is CSS `@keyframes` over layered transparent WebP images, orchestrated by React state. Three.js appears only in the unrelated `/canvas` and `/shaders` routes.

**Assets.** Roughly 60 separately-painted elements under `/images/{tree,bushes,grass,lilies,cattails,buttercups,small-grass,sign}/`. Every element group ships a **separate shadow pass** (`lily-shadows.webp`, `grass-shadows.webp`, `bushes-shadow`). Source art is real watercolor, scanned — the downloaded `tree.webp` and `bushes.webp` show cold-press paper tooth, pigment granulation, and hard bloom edges where washes dried.

**The single most important CSS rule on the site:**

```css
* { transform-origin: bottom center; }
```

Everything hinges at its base, like a plant rooted in soil. This one line is why the whole scene feels grown rather than assembled.

**Verified motion values** (extracted from `99155b7eba1aa0bd.css`):

| Animation | Value | Timing |
|---|---|---|
| `tree-swing` | `rotate(0deg → 2deg)`, `brightness(1.05)` at 30% | 4s linear infinite |
| `swing-large` | `rotate(0 → -16deg)` | 4s linear infinite |
| `swing-small` | `rotate(0 → 5deg)` | 4s linear infinite |
| `loquat-swing-large` | `rotate(0 → -30deg)`, brightness flicker at 20% | 2s linear infinite alternate |
| `tree-shadow-swing` | `rotate(20deg) skew(-55deg)`, `blur(.3vw → .5vw → .3vw)` | 7s linear infinite alternate |
| `tree-leaves-1` | opacity `0→1→0` while `translate(50%,30%) → translate(130%,60%)`, `rotate(-24deg)` | 5s ease-out infinite |
| `spotlight-trail-swing` | `rotate(85deg) scale(1) opacity(.1)` → `rotate(115deg) scale(.5) opacity(.08)` | 4s linear infinite |
| `noise` | 11-step `translate3d` jitter, ±4.5rem | 1s `steps(2)` infinite |
| `enter` | `opacity 0→1`, `translateY(10px → 0)` | 0.6s both |
| `plant-happy` (click reward) | `scale(1 → 1.15 → 1.3 → 1.15)` + `rotate(-3 → 4 → -12deg)` | 1s ease-in-out |
| `contrast-fade` (page load) | `contrast(.7 → 1)` | 5s linear forwards |
| `load-grain` | `opacity 0 → 1` | 1.5s forwards |

**Mood system.** Day/sunset/night/tea/newspaper moods are driven by exactly three CSS custom properties, with **zero additional artwork**:

```css
--shadow-hue           /*  0deg | -50deg | -60deg  */
--shadow-saturation    /*  0 | 0.15 | 0.18 | 0.5   */
--shadow-brightness-offset /* -0.15 | 0 | 0.1 | 0.4 | 0.7 */
```

Backgrounds observed: `#fff` (minimal), `#ebd7bc` (sunset/tea/newspaper), `#24252c` (night).

**Compositing.** 50 uses of `mix-blend-mode: plus-lighter` (glow and spotlight layers), 13 `overlay`, 8 `soft-light`. Glow is always a separate additive layer, never baked into the artwork.

**Typography.** JetBrains Mono, and **only three sizes exist on the entire site: 11px, 12px, 14px.** Text is fixed to the four screen corners. This is where its negative space comes from.

### 2.2 Tanushree's reference images — governs paint style

Six images in `/reference`, all watercolor, all mutually consistent: four toadstools (red, blue, pink, amber), a receding stepping-stone path, and a wishing well.

**Style characteristics (this is the style bible):** rendered rather than loose. Airbrushed volumetric shading with a clear soft light source from the upper left. Precise radial gill lines under each cap. Visible paper-grain texture inside the wash. Crisp white speckle highlights on caps. Subordinate botanical detail at every base — grass tufts, tiny daisies, buttercups.

**Format:** transparent RGBA PNG, 1024×1536 (portrait) or 1536×1024 (landscape), 47–62% fully transparent. Clean alpha with no matte fringe. They composite onto warm paper with no preparation of any kind.

**Decision: the reference images win on paint style.** All new assets are generated to match them. chloeyan.me is *not* copied for paint handling — its flat, unrendered washes would fight these. chloeyan.me contributes motion, layout, and restraint only.

**Extracted palette** (sampled from the reference images, transparent regions excluded):

| Role | Hex | Source |
|---|---|---|
| Paper cream (lightest) | `#f0d8c0` | all |
| Paper warm mid | `#d8c0a8` | all |
| Stone / sand | `#c0a878` | path, well |
| Moss light | `#909048` | path, toadstools |
| Moss mid | `#787830` | toadstools |
| Moss deep | `#484818` | toadstools, well |
| Toadstool red | `#c01818` → `#f04830` | red toadstool |
| Toadstool blue | `#6090a8` | blue toadstool |
| Toadstool pink | `#f0a8a8` → `#f09090` | pink toadstool |
| Wood warm | `#906030` | well |
| Wood deep | `#604830` → `#483018` | well |

**The assets need no preparation.** They arrive as transparent PNGs and are used exactly as delivered — no keying, no background removal, no glow or shadow extraction. Where chloeyan.me composites separate light layers to animate glow independently of artwork, we do not: these paintings carry their own light, and a second lighting system on top would fight it. See §5.2.

---

## 3. Content model

### 3.1 Source of truth

All content lives in **one file: `src/content/content.json`**. No content is hardcoded in components. No Markdown, no CMS, no second content location. A build-time TypeScript type guards its shape.

### 3.2 Profile

| Field | Value |
|---|---|
| Name | Tanushree Nath |
| Title | Product Designer |
| Location | Bengaluru, Karnataka, India |
| Email | designbytanushree@gmail.com |
| LinkedIn | linkedin.com/in/designbytanushree |
| Portfolio (existing) | designbytanushree.framer.ai |

### 3.3 Welcome message

Required on landing. Copy:

> **Hello! I am Tanushree.**
> Product designer. Bengaluru.

Placement: upper-left quadrant, in the empty paper area established by the path reference's composition. Behaviour: fades up on load via the `enter` animation after the scene settles (1.2s delay). Dims to 25% opacity when the visitor hovers any object, returns to full when they stop — so it never competes with a reveal. It is never dismissed and never scrolls away; it is a permanent, quiet part of the composition.

### 3.4 Work items — eight objects

Derived from the resume. Four carry real external case study links; four are described in the overlay without an external link.

| # | Object | Work | Company | Year | Case study link |
|---|---|---|---|---|---|
| 1 | Red toadstool | Enterprise Banking Dashboards (Bitnudge, Engage, Ticket Portal) | GameChange | 2025– | Figma deck `IorkEqc5wERaTduFtrWFkd` |
| 2 | Blue toadstool | Bill of Materials Workflow | Bild | 2023–24 | Figma slides `syHseblvDh4j1Z2QkCBinO` |
| 3 | Pink toadstool | Design System | Bild | 2023–24 | Figma slides `CgYwduP7U9Gup06E8zAqyf` |
| 4 | Wishing well | InfluencerBit — Brand & 0→1 MVP | Restless Monks | 2021–22 | Notion case study |
| 5 | Brass key | KYC / KYB Onboarding & Verification | GameChange | 2025– | — |
| 6 | Bottle | Shopkey — E-commerce Store Builder | GameChange | 2025– | — |
| 7 | Teacup | Wasp — AI WhatsApp Customer Service | GameChange | 2025– | — |
| 8 | Pocket watch | Remittance Admin Interface | GameChange | 2025– | — |

Object-to-work assignment is deliberate, not arbitrary: the key opens accounts (identity verification), the bottle is *drink me* (a store that grows), the teacup is the tea party (conversation), the pocket watch is the White Rabbit's lateness (transaction oversight and a 30% cut in task time). This reasoning is recorded so future edits preserve it.

**Non-work objects:**

| Object | Role |
|---|---|
| Stepping-stone path | The scene's spine and ground plane. Also the **About** trigger. |
| Lantern | The **gamification thesis** (research illuminates). Distance band, optional 9th. |
| Contact card | Small painted card, lower-right. Opens contact links. |

### 3.5 Case study overlay content

Each work item's overlay carries: title, company, role, dates, a one-paragraph summary, 2–4 outcome metrics pulled verbatim from the resume, and an external link where one exists. Metrics are quoted exactly — `18% increase in high-value opportunities pursued`, `42% faster access to critical financial insights`, `4x faster BOM creation`, `70% reduction in data entry errors`, `14x ROI`, `30%` admin task reduction.

### 3.6 `content.json` schema

```jsonc
{
  "profile": {
    "name": "Tanushree Nath",
    "title": "Product Designer",
    "location": "Bengaluru, Karnataka, India",
    "welcome": { "greeting": "Hello! I am Tanushree.", "sub": "Product designer. Bengaluru." },
    "links": [ { "label": "Email", "href": "mailto:..." } ]
  },

  "scene": {
    "moods": ["day", "sunset", "night"],
    "defaultMood": "day"
  },

  "objects": [
    {
      "id": "banking-dashboards",
      "type": "work",                     // work | about | contact
      "asset": "toadstool-red",           // resolves to 3 files, see §5.2
      "band": "foreground",               // foreground | midground | distance
      "position": {
        "desktop": { "x": 22, "y": 68 },  // % of viewport, anchored bottom-center
        "mobile":  { "x": 28, "y": 62 }
      },
      "size": { "desktop": 26, "mobile": 38 },   // width as % of viewport
      "motion": { "preset": "sway-large", "delay": -1.4 },
      "label": { "title": "Enterprise Banking Dashboards", "meta": "GameChange · 2025" },
      "caseStudy": {
        "role": "Product Designer",
        "summary": "…",
        "metrics": ["18% increase in high-value opportunities pursued", "…"],
        "href": "https://www.figma.com/deck/IorkEqc5wERaTduFtrWFkd"
      }
    }
  ],

  "experience": [ { "company": "GameChange", "role": "Product Designer", "period": "Jan 2025 – Present", "location": "Remote, Singapore", "bullets": ["…"] } ],
  "education":  [ { "degree": "B.B.A. Retail and Fashion Merchandising", "school": "Footwear Design and Development Institute, Hyderabad", "period": "2020–2023", "note": "Gold Medal, 9.33 CGPA" } ],
  "skills":     { "design": ["…"], "research": ["…"], "tools": ["…"] }
}
```

`experience`, `education`, and `skills` render inside the **About** overlay only. They do not appear on the scene.

---

## 4. Composition & spatial system

### 4.1 The depth-band system

This is the core visual mechanic and the reason the scene reads as a place rather than a sticker collage. Every object is assigned to one of three bands, and the band **mechanically determines five properties at once**:

| Property | Foreground | Midground | Distance |
|---|---|---|---|
| Scale multiplier | 1.00 | 0.55 | 0.28 |
| Saturation | 100% | 92% | 78% |
| Blur | 0 | 0.15vw | 0.4vw |
| Motion amplitude | 1.0× | 0.6× | 0.3× |
| Mouse parallax offset | 24px | 12px | 5px |
| z-index range | 300–399 | 200–299 | 100–199 |

Implemented as three CSS classes setting custom properties; no per-object overrides of these five values are permitted. Consistency here is what buys the illusion.

**Band assignment rule:** work objects may only occupy the **foreground** or **midground** bands. The distance band is reserved for decorative and non-work objects (lantern, bushes, particles). At 0.28 scale with 0.4vw blur, a distance object is too small to be a reliable hover or touch target, and no piece of work should ever be the hardest thing on screen to click.

### 4.2 Layout

The stepping-stone path is the scene's spine, running lower-left → upper-right, establishing the depth axis. Objects are distributed along and beside it.

```
┌──────────────────────────────────────────────────┐
│  Hello! I am Tanushree.              ☾ ◐ ☀       │  ← welcome (TL), mood toggle (TR)
│  Product designer. Bengaluru.                     │
│                                                   │
│                      ·lantern                     │  ← distance band
│         (empty paper)                             │
│                     ○ watch  ◗ bottle   ⌂ well    │  ← midground
│                    ♣ blue          ♣ pink         │
│                                                   │
│      ♣ RED TOADSTOOL        ⚷ key    ☕ teacup    │  ← foreground
│   ═══════ stepping-stone path ═══════════════     │
│  tanushree nath                    contact ↗      │  ← corner type
└──────────────────────────────────────────────────┘
```

**The upper-left quadrant stays empty**, mirroring the composition of the path reference. That emptiness is load-bearing — it is where the welcome message lives and where the eye rests.

### 4.3 Typography

Following chloeyan.me's discipline: **three sizes only, site-wide.**

| Token | Size | Use |
|---|---|---|
| `--type-sm` | 11px | corner meta, mood toggle |
| `--type-md` | 12px | hover labels, contact links |
| `--type-lg` | 14px | welcome greeting, overlay titles |

Typeface: a monospace face for all UI and labels. Overlay body copy may use a single serif at 14px for readability in longer prose. No other faces, no other sizes. Letter-spacing `0.02em` on all mono text.

### 4.4 Mood palettes

Three moods. Each sets a paper colour, an ink colour, and one scene-wide filter. **No mood requires additional artwork.**

| Mood | Paper | Ink | Scene filter |
|---|---|---|---|
| Day (default) | `#f5efe6` | `#4a4038` | none |
| Sunset | `#ebd7bc` | `#3e3636` | `sepia(.18) saturate(1.08) hue-rotate(-10deg)` |
| Night | `#24252c` | `rgba(255,255,255,.9)` | `brightness(.68) saturate(.72) contrast(1.04)` |

The filter is applied to the scene layer only, never to text, so labels stay legible in every mood. Filters are kept mild deliberately — these are finished paintings, and a heavy grade fights the light already in them.

Mood transitions are `2.4s` cross-fades on paper, ink, and filter — slow enough to feel like weather changing.

---

## 5. Asset pipeline

This section is the most consequential part of the build. Asset quality determines whether the site works.

### 5.1 Style bible (locked)

Every generated asset must match the five references on all of these:

- Watercolor on textured paper, **rendered** — soft volumetric shading with a consistent light source from upper-left, not flat washes.
- Visible paper grain inside every wash.
- Crisp, un-blurred silhouette edges with soft interior gradients.
- Transparent background, clean alpha, no matte fringe.
- Subordinate botanical detail at every base: grass tufts, tiny daisies or buttercups, moss.
- Palette restricted to §2.2's table.
- Framing: subject centred, full object visible, generous margin, no cropping at edges, no ground shadow baked in.

### 5.2 Assets are used exactly as delivered

The reference files in `reference/` are already transparent RGBA PNGs with clean alpha. **There is no extraction step, no keying, no background removal, and no glow or shadow passes.** Each object is one file, used byte-for-byte as painted.

| File | Purpose | Compositing |
|---|---|---|
| `{id}.png` | The object, unmodified | normal |

This is a deliberate departure from chloeyan.me. Their scene needs separate glow and shadow passes because it is built from loose, flat washes that would read as inert without them. These assets are already fully rendered, carrying their own volumetric shading and internal light. A second lighting system layered on top would fight the one that is painted in.

All life in the scene comes from CSS motion. Nothing is baked into the artwork.

### 5.3 Build-time optimisation

The six source files total roughly 14MB, against a 2.2MB scene budget. This is resolved entirely at build time:

- Sources stay untouched in `reference/`, which is the pristine archive.
- Unmodified copies live in `src/assets/objects/` under clean kebab-case names, because the source filenames contain spaces and sit outside the Vite root. These are byte-identical copies, not edits.
- The bundler compresses them to WebP on build. Nothing in the repository is rewritten.

Per-band ceilings: foreground max 1600px on long edge, midground 1000px, distance 600px.

### 5.4 Current inventory and what is missing

Six assets exist. They cover five work objects plus the ground spine:

| Asset | Role |
|---|---|
| `toadstool-red` | Enterprise Banking Dashboards — GameChange |
| `wishing-well` | InfluencerBit — Brand & 0→1 MVP |
| `toadstool-blue` | Bill of Materials Workflow — Bild |
| `toadstool-pink` | Design System — Bild |
| `toadstool-amber` | KYC / KYB Onboarding & Verification — GameChange |
| `path-stones` | Ground spine; also the About trigger |

Four work items from §3.4 have no artwork yet: Shopkey (bottle), Wasp (teacup), Remittance Admin (pocket watch), and the gamification thesis (lantern). They remain declared in `content.json` and are skipped at render time until their asset exists. Adding one is a file drop plus a registry line — never a redesign.

### 5.5 Prompt template for future assets

A single locked template, varying only `{SUBJECT}`. Note the final clause: new assets must be generated with a **transparent background**, matching the existing six.

> Watercolor illustration of {SUBJECT}, storybook fairytale style, soft volumetric shading with light from the upper left, visible cold-press paper grain and pigment texture, crisp clean silhouette edges, delicate botanical detail at the base with grass tufts and tiny white daisies, warm palette of cream #f0d8c0, moss green #787830, and warm wood brown #604830, centred composition with generous margin, subject fully visible and not cropped, transparent background, no text, no watermark, no ground shadow.

Per-subject clauses are in [docs/asset-prompt-pack.md](docs/asset-prompt-pack.md).

### 5.6 Asset acceptance checklist

- [ ] Transparent RGBA, no matte fringe when composited over `#f5efe6`
- [ ] Paper grain visible at 100%
- [ ] Palette within §2.2 range
- [ ] Light direction upper-left, consistent with the other assets
- [ ] Sits believably beside the existing six when placed in-scene

---

## 6. Motion system

### 6.1 Foundations

```css
* { transform-origin: bottom center; }
```

Adopted directly from chloeyan.me. Every object hinges at its base.

**One shared clock.** All ambient motion runs on a 4s base period. Objects are de-synchronised using **negative animation delays** (`animation-delay: -1.4s`) rather than different durations, so nothing ever visibly beats in unison but everything shares one rhythm.

**Amplitude, not speed, encodes depth.** Distant objects move less, not slower. This is the parallax cue.

### 6.2 Motion presets

| Preset | Transform | Timing | Applied to |
|---|---|---|---|
| `sway-large` | `rotate(0 → -16deg)` | 4s linear infinite | large foreground botanicals |
| `sway-medium` | `rotate(0 → 5deg)` | 4s linear infinite | toadstool caps, well |
| `sway-small` | `rotate(0 → 2deg)` + `brightness(1.05)` at 30% | 4s linear infinite | small objects, key, watch |
| `hang-swing` | `rotate(-3deg → 3deg)` | 5s ease-in-out infinite alternate | lantern, hanging bucket |
| `breathe` | `scale(1 → 1.012)` | 7s ease-in-out infinite alternate | interactive objects, as an affordance cue |
| `grain-jitter` | 11-step `translate3d` ±4.5rem | 1s `steps(2)` infinite | grain overlay |

`breathe` deliberately runs at **7s against the scene's 4s** — a coprime relationship, so an object's sway and its breath never resynchronise. Two motions on unrelated clocks read as organic; on the same clock they read as a loop.

Every preset animates `transform` and `opacity` only. There are no glow or shadow layers to animate — see §5.2.

### 6.3 The grain overlay

A fixed full-viewport noise layer above the scene and below the UI text, at `opacity 0.12`, `mix-blend-mode: overlay`, jittering on `grain-jitter`. **This is the single highest-leverage element in the entire visual system** — it is what fuses separately-generated assets into one coherent painting. It fades in on load over 1.5s (`load-grain`).

### 6.4 Mouse parallax

Pointer position writes two CSS custom properties on the scene root, throttled to `requestAnimationFrame`:

```css
--mouse-x: /* -1 … 1 */;
--mouse-y: /* -1 … 1 */;
```

Each band translates by its offset from §4.1 (24px / 12px / 5px), with a `0.6s cubic-bezier(.22,.61,.36,1)` ease so it lags the cursor rather than tracking it rigidly. Disabled entirely on touch and under reduced motion.

### 6.5 Interaction motion

| Event | Response |
|---|---|
| Page load | Scene `contrast(.7 → 1)` over 5s; objects `enter` (opacity 0→1, translateY 10px→0, 0.6s) staggered 80ms by band, foreground first; grain fades in over 1.5s; welcome text enters at 1.2s |
| Object hover | Object `scale(1.03)` and `brightness(1.06)` over 0.4s; ambient sway eases to rest; label fades up in 0.3s |
| Object unhover | All reverse over 0.6s; sway resumes from current angle, never snapping |
| Object click | Brief `plant-happy`-style acknowledgement (`scale 1 → 1.08 → 1`, `rotate ±2deg`, 0.5s), then overlay opens |
| Overlay open | Scene `blur(8px)` + `brightness(0.75)` over 0.5s; overlay panel fades and rises 16px over 0.45s |
| Overlay close | Reverse over 0.4s; scene returns to full clarity |
| Mood change | 2.4s cross-fade on paper, ink, and scene filter |

### 6.6 Reduced motion

Under `prefers-reduced-motion: reduce`: all ambient sway, breathing, grain jitter, and mouse parallax stop. The grain overlay remains but static. Hover and overlay transitions reduce to simple 0.2s opacity fades. **The scene must remain fully navigable and legible with zero motion.**

---

## 7. Interaction & information architecture

### 7.1 States

The site has exactly four states: **Resting**, **Hovering**, **Overlay open**, and **Mood transitioning**. Overlay open is the only state that traps focus.

### 7.2 Hover reveal

On hover, a label fades up adjacent to the object — positioned by the object's quadrant so it never runs off-screen or crosses the object:

```
Enterprise Banking Dashboards
GameChange · 2025
```

Title at `--type-md`, meta at `--type-sm` in 60% opacity. No box, no background, no border — text directly on paper. It appears within 0.3s and disappears on unhover.

### 7.3 Case study overlay

The scene stays mounted and visible, blurred and dimmed behind a translucent panel. The panel is max 720px wide, centred, with generous internal padding, and **scrolls internally when content exceeds the viewport** — this is the one place scrolling exists, and it never affects the scene. Contains: title, company · role · dates, summary paragraph, metric list, external link where present, and a close affordance. Dismissed by close button, `Esc`, or clicking outside.

The **About** overlay uses the same component and renders `experience`, `education`, and `skills`. The **Contact** overlay renders `profile.links`.

### 7.4 Discoverability — a named risk

**Hover-only navigation has no affordance.** A visitor who does not move their cursor over an object may perceive an illustration and leave. Three mitigations, all required:

1. **Idle breathing pulse.** Interactive objects carry the `breathe` preset; decorative ones do not — a subtle, continuous signal of interactivity.
2. **First-visit hint.** After 4s of no interaction on first visit, a 12px line fades in near the path: `hover the objects`. It disappears permanently on first hover and is remembered in `localStorage`.
3. **Keyboard equivalence.** Every interactive object is a real focusable element in a sensible tab order (foreground → midground → distance, left to right). Focus produces the *identical* reveal as hover, plus a visible focus ring. This is a correctness requirement, not an enhancement.

### 7.5 Touch

On touch devices there is no hover. First tap on an object reveals its label; second tap opens the overlay. Tapping empty paper dismisses any open label. Mouse parallax is disabled. Touch targets are minimum 44×44px — enforced with an invisible hit area where an object's painted silhouette is smaller.

### 7.6 Mood toggle

Top-right corner, `--type-sm`. Three states shown as small glyphs or the words `day · sunset · night`. Current mood is emphasised; the others sit at 40% opacity. Selection persists to `localStorage`. Default on first visit is **day**.

---

## 8. Responsive strategy

**The constraint:** the scene never scrolls at any breakpoint. chloeyan.me solved mobile by shipping an entire duplicate `Mobile` component and stylesheet — visible in its CSS as a full parallel set of `Mobile_*` keyframes. **We explicitly avoid that.**

**The approach:** one scene, one component tree, one set of assets. Object positions and sizes come from `content.json` with per-breakpoint values (`position.desktop` / `position.mobile`, `size.desktop` / `size.mobile`). Switching layouts is a data lookup, not a code branch.

| Breakpoint | Behaviour |
|---|---|
| ≥ 1024px | Full scene, 8 objects, all three bands, mouse parallax active |
| 768–1023px | Full scene, positions from a tablet interpolation of desktop values; parallax active |
| < 768px | Mobile positions; **all 8 work objects remain visible** — no piece of work is ever hidden by breakpoint. Only non-work objects may be dropped: the lantern (thesis) is hidden and the contact card collapses into the corner type. Parallax off; tap-to-reveal |
| < 768px landscape | Welcome message collapses to greeting line only |

Everything is sized in viewport units (`vw`/`dvh`) so the composition scales rather than reflows. `dvh` specifically, not `vh`, to survive mobile browser chrome.

---

## 9. Technical architecture

### 9.1 Stack

**Vite + React + TypeScript**, static build.

Chosen over Next.js deliberately: this is a single page with no routing. Case studies are overlays, not routes, so Next's file-system router, SSR, and image pipeline contribute nothing here while adding build weight and configuration. Vite gives a faster loop and a smaller output. Deep-linking to a case study is handled with a URL hash (`/#banking-dashboards`) synced via the History API — shareable links work without a router.

- **Styling:** CSS Modules with a global custom-property layer for bands, moods, and motion tokens. No CSS framework, no CSS-in-JS.
- **Animation:** CSS `@keyframes` only. No animation library. The single piece of animation JavaScript is the `requestAnimationFrame` mouse-parallax writer.
- **State:** React `useState`/`useContext`. Three pieces of state total: active overlay, current mood, hovered object. No state library.
- **Content:** `content.json` imported at build time, validated against a TypeScript type.

### 9.2 Component structure

Each component has one clear purpose and can be understood without reading the others.

```
src/
  content/content.json          ← single source of truth
  types/content.ts              ← types + validation
  components/
    Scene.tsx                   ← viewport, bands, mouse parallax, mood class
    SceneObject.tsx             ← one object: image, band, motion preset, interaction
    HoverLabel.tsx              ← quadrant-aware reveal
    Overlay.tsx                 ← shell: backdrop, focus trap, Esc, internal scroll
    CaseStudy.tsx               ← work overlay content
    About.tsx                   ← experience / education / skills
    Contact.tsx                 ← links
    Welcome.tsx                 ← greeting, dims on hover
    MoodToggle.tsx              ← day / sunset / night
    Grain.tsx                   ← fixed noise overlay
    Hint.tsx                    ← first-visit affordance
  hooks/
    useMouseParallax.ts
    useMood.ts                  ← localStorage-backed
    useHashRoute.ts             ← deep-link sync
  styles/
    tokens.css                  ← type scale, palette, moods, band variables
    motion.css                  ← all @keyframes, all presets
```

`SceneObject` is the load-bearing component. It receives a manifest entry and renders three stacked layers with the correct blend modes, band class, motion preset, and delay. It knows nothing about work, case studies, or overlays — it renders an object and reports interaction upward. Every visual behaviour in §6 is expressed through the CSS classes it applies, so tuning motion never requires touching component logic.

### 9.3 Performance budgets

| Metric | Target |
|---|---|
| LCP | < 2.0s on 4G |
| Total scene payload | ≤ 2.2MB |
| JS bundle (gzipped) | ≤ 60KB |
| CLS | 0 — every object is absolutely positioned with explicit aspect ratios |
| Sustained frame rate | 60fps on a 2020-era laptop |

All animated properties are restricted to `transform`, `opacity`, and `filter`. Every animated layer carries `will-change` on exactly the properties it animates — no blanket `will-change`. `filter: blur()` on distance-band objects is applied once at rest, never animated per-frame except on the deliberately-slow shadow blur.

### 9.4 Accessibility

- Every interactive object is a `<button>` with an accessible name (`{title}, {company}, {year}`), not a `div` with a click handler.
- Tab order follows visual reading order; focus produces the same reveal as hover with a visible focus ring meeting 3:1 contrast.
- Overlays trap focus, close on `Esc`, and return focus to the originating object.
- All text meets WCAG AA (4.5:1) against its paper background **in all three moods** — night mood is verified separately, as light text on `#24252c` behind a blurred scene is the riskiest combination.
- Decorative assets carry `alt=""`; the scene container is `aria-label`led as a description of the illustration.
- Full `prefers-reduced-motion` support per §6.6.
- The site is fully operable with keyboard alone, and all content is reachable without hover.

---

## 10. Build phases

| Phase | Deliverable | Exit criterion |
|---|---|---|
| **1. Foundation** | Vite + React + TS scaffold, `content.json` populated from the resume, types, token layer, mood system | Moods switch and change background, text colour, and shadow variables |
| **2. Assets** | Unmodified copies into `src/assets/objects/`, asset registry, build-time compression | Six assets render on paper with no fringe; built payload under budget |
| **3. Remaining artwork** | Four missing subjects via the locked prompt template (bottle, teacup, watch, lantern) | All 8 work objects render; none skipped for a missing asset |
| **4. Scene** | `Scene` + `SceneObject`, depth bands, positioning from manifest, grain overlay | Static scene renders correctly at all three breakpoints, no scroll anywhere |
| **5. Motion** | All presets, shared clock with negative delays, mouse parallax, load sequence | Scene runs at 60fps; reduced-motion path verified |
| **6. Interaction** | Hover labels, overlays, About, Contact, mood toggle, hint, deep links | Full keyboard traversal; every overlay reachable without a mouse |
| **7. Polish** | Performance budgets, WCAG AA in all moods, touch behaviour, mobile positions | All §9.3 budgets met; audit clean |

---

## 11. Open items

These do not block implementation; each has a stated default so work can proceed.

1. **Case study depth.** Overlays currently carry resume-derived summaries and metrics. If Tanushree wants richer narratives with imagery, `caseStudy` gains a `blocks[]` array. *Default: resume-derived summary and metrics only.*
2. **Typeface selection.** The spec fixes the scale (11/12/14) and the mono+serif pairing, not the specific faces. *Default: a mono for UI and labels, one serif for overlay prose, both self-hosted as WOFF2.*
3. **The ninth object.** The lantern (gamification thesis) is specified but sits in the distance band and is hidden on mobile. *Default: include it; it is trivially removable from the manifest.*
4. **Existing Framer portfolio.** `designbytanushree.framer.ai` is live. *Default: linked from the Contact overlay; no content migration.*
