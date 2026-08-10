# Asset Prompt Pack

Everything needed to generate the remaining Wonderland assets so they sit beside the existing six without looking imported.

**Suggested tools** (from Tanushree's own stack): Midjourney, or Gemini Nano Banana. Whichever supports image references — feed it the four toadstools as style references, because consistency of *finish* matters far more than consistency of subject.

**After generating:** export as a **transparent PNG** (matching the existing six — no background, no baked shadow), drop it into `reference/`, copy it into `src/assets/objects/` under its kebab-case id, and register it in `src/assets/registry.ts`. No processing step exists or is needed.

---

## The three non-negotiables

Every asset must match the originals on these, or it will read as a foreign object in the scene:

1. **Light comes from the upper left.** Every existing asset is lit this way. A single inconsistent asset breaks the illusion for the whole scene.
2. **Transparent background.** Match the existing six exactly — no background fill, no glow halo, no vignette. The asset is composited straight onto warm paper.
3. **No ground shadow baked in.** The existing six have none, and an object with a shadow will look pasted onto the paper while its neighbours float.

---

## Locked base template

Vary only `{SUBJECT}`. Do not edit the rest — the trailing clauses are what hold the style together.

> Watercolor illustration of {SUBJECT}, storybook fairytale style, soft volumetric shading with light from the upper left, visible cold-press paper grain and pigment texture, crisp clean silhouette edges, delicate botanical detail at the base with grass tufts and tiny white daisies, warm palette of cream #f0d8c0, moss green #787830, and warm wood brown #604830, centred composition with generous margin, subject fully visible and not cropped, transparent background, no text, no watermark, no ground shadow.

---

## Work objects — 4 required

These complete the eight-object work set. Each maps to a GameChange project.

### 1. `key-brass` → KYC / KYB Onboarding & Verification

The key opens accounts. Should feel old, heavy, and a little oversized.

> {SUBJECT} = **an ornate antique brass key lying at a slight angle, with a decorative bow and intricate ward cuts, patina on the metal, resting among low moss and clover**

Band: midground. Target: object clearly readable at 55% scale.

### 2. `bottle-drink-me` → Shopkey, E-commerce Store Builder

*Drink me* — a store that grows. Keep the label blank; **no lettering**, the model will render it badly and the spec forbids text in assets.

> {SUBJECT} = **a small round glass apothecary bottle with a cork stopper and a blank cream paper label tied with twine, filled with pale amber liquid, catching soft light through the glass, standing in short grass**

Band: midground.

### 3. `teacup-saucer` → Wasp, AI WhatsApp Customer Service

The tea party — conversation. Slight tilt gives it life; avoid a perfectly frontal, symmetrical view.

> {SUBJECT} = **a delicate porcelain teacup on a saucer, tilted slightly, with a fine painted floral rim in soft rose and moss green, a wisp of steam rising, resting on a patch of clover**

Band: foreground.

### 4. `pocket-watch` → Remittance Admin Interface

The White Rabbit's lateness. **No numerals on the face** — leave it as suggested marks.

> {SUBJECT} = **an antique gold pocket watch with an open hinged cover and a fine chain trailing to one side, aged brass casing with a plain pale enamel face bearing no numbers, lying half-nestled in moss**

Band: midground.

---

## Non-work object — 1 required

### 5. `lantern` → Gamification Thesis

Research illuminates. This one sits in the distance band, so silhouette clarity beats internal detail — it will be rendered at 28% scale with a soft blur.

> {SUBJECT} = **a small hanging iron lantern with warm glowing candlelight inside, glass panes, a curved carrying handle, suspended from a slender curved branch**

Band: distance. Paint the candlelight *into* the artwork — there is no separate glow layer, so any light it casts must be part of the painting.

---

## Environment set — 9 pieces

Small, cheap, and heavily reused. These carry the negative space and give the ground somewhere to sit. Generate these at lower effort; they are never focal.

| id | Subject clause | Notes |
|---|---|---|
| `grass-tuft-1` … `-4` | **a small tuft of meadow grass with a few slender blades and one or two tiny white daisies** | Generate 4 variations. Reused across the scene at different scales and flips. |
| `bush-distant-1`, `-2` | **a low rounded shrub of soft green foliage, loose and simplified, seen at a distance** | Distance band. Deliberately less detailed than foreground foliage. |
| `seed-1` … `-3` | **a single dandelion seed floating, fine translucent filaments catching light** | Tiny. Transparent background like everything else. |

---

## Acceptance checklist

Per the spec, an asset is not accepted until all pass.

- [ ] Composited over `#f5efe6` with no visible fringe
- [ ] Silhouette edge feathered, not stair-stepped
- [ ] Paper grain visible at 100%
- [ ] Palette within the reference range
- [ ] Light direction upper-left, consistent with the other assets
- [ ] Under size budget for its band
- [ ] Sits believably beside the existing six in the scene

Drop the asset into the scene and look at it beside the existing six. If it jumps out as not belonging, regenerate it — there is no pipeline to correct it in.
