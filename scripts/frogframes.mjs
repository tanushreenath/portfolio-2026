/**
 * Register a frog frame onto the canvas the others already share.
 *   node scripts/frogframes.mjs <src.png> <name>
 *   node scripts/frogframes.mjs reference/frog-open.png frog-open
 *
 * Every other object in src/assets/objects is an unmodified copy of its file in
 * reference/. The frog is the exception, and this script is why.
 *
 * The frog's frames are separate paintings of the same animal, not frames drawn
 * over one another: each generation puts it at its own scale and its own place
 * in a 1536x1024 field, drifting by ~5% and ~20px from the last. Swapping
 * between them as they ship makes the whole frog jump and swell, which reads as
 * a scale-up rather than as a mouth opening -- the one movement that should be
 * legible is the only one lost in everything else moving with it.
 *
 * So a new frame is resampled onto BASE's coordinates before it is used. The
 * transform is fitted, not eyeballed: a scale-and-translate search maximising
 * the overlap of the two alpha silhouettes, scored over the body ONLY (columns
 * left of MOUTH_X), since the mouth is the one part that is supposed to differ
 * and including it would drag the fit toward hiding the very thing being
 * animated. On frog-open it takes the silhouettes from 0.83 to 0.93 IoU; the
 * remainder is brushwork that genuinely differs between two paintings and no
 * rigid transform can close.
 *
 * CROP is then applied unchanged to every frame, which is what keeps the set
 * registered -- and what makes it safe to add a frame later without disturbing
 * the ones already shipped. It was derived from the first pair (the union of
 * their silhouettes plus 2% margin, the few percent the other paintings carry:
 * a cut-out flush to its own edge shows a hard cut when the night wash is
 * masked to it) and is fixed here so the answer cannot move underneath the
 * files that already exist.
 *
 * Only the frame you name is written. Run scripts/genbounds.mjs afterwards --
 * bounds.ts is generated from these files.
 */
import sharp from "sharp";

/** The frame every other frame is registered onto. */
const BASE = "reference/frog-closed.png";
/** Fixed, not derived. See the note above. */
const CROP = { left: 250, top: 7, width: 1078, height: 992 };
/** Score the fit over the body only; right of here is the mouth. */
const MOUTH_X = 0.66;

const OUT_DIR = "src/assets/objects";

const [src, name] = process.argv.slice(2);
if (!src || !name) {
  console.error("usage: node scripts/frogframes.mjs <src.png> <name>");
  process.exit(1);
}

const load = async (f) => {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, W: info.width, H: info.height, C: info.channels };
};

const mask = (img, k) => {
  const W = Math.floor(img.W / k);
  const H = Math.floor(img.H / k);
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      m[y * W + x] = img.data[(y * k * img.W + x * k) * img.C + 3] > 128 ? 1 : 0;
    }
  }
  return { m, W, H };
};

/** Intersection over union of the two silhouettes under (scale, tx, ty), where
 *  a point (u,v) of `b` is taken to be the point (s*u+tx, s*v+ty) of `a`.
 *  Translations are in `a`'s own pixels at this sampling. */
function iou(a, b, s, tx, ty) {
  const xmax = Math.floor(a.W * MOUTH_X);
  let inter = 0;
  let union = 0;
  for (let y = 0; y < a.H; y++) {
    for (let x = 0; x < xmax; x++) {
      const bx = Math.round((x - tx) / s);
      const by = Math.round((y - ty) / s);
      const bv = bx >= 0 && bx < b.W && by >= 0 && by < b.H ? b.m[by * b.W + bx] : 0;
      const av = a.m[y * a.W + x];
      if (av | bv) {
        union++;
        if (av & bv) inter++;
      }
    }
  }
  return inter / union;
}

const base = await load(BASE);
const frame = await load(src);

/** A frame's own silhouette: what the search is seeded from, and what the fit
 *  is held inside CROP by. */
function silhouette(img) {
  let left = img.W;
  let right = 0;
  let top = img.H;
  let bottom = 0;
  for (let y = 0; y < img.H; y++) {
    for (let x = 0; x < img.W; x++) {
      if (img.data[(y * img.W + x) * img.C + 3] > 24) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  return { left, right, top, bottom };
}

const sil = silhouette(frame);
const baseSil = silhouette(base);

/**
 * Where to start looking: line the two silhouettes up by their bounding boxes.
 *
 * The frames do not arrive in one framing. Some are the raw 1536x1024 field
 * they were generated in, some have already been trimmed square to the animal,
 * and a fixed search window around the identity transform only ever finds the
 * first kind -- for a pre-trimmed frame the true answer is a third of the image
 * away and every candidate in range scores nothing.
 *
 * Height, not width, sets the scale. An open mouth adds to a frog's width and
 * nothing to its height, so seeding from width would start every open frame too
 * small by however far its jaw happens to be open. The search still has to move
 * off this guess -- a bounding box is the animal plus whatever the mouth is
 * doing -- but it puts the answer inside the window instead of outside it.
 */
const seed = (() => {
  const s = (baseSil.bottom - baseSil.top) / (sil.bottom - sil.top);
  const mid = (a, lo, hi) => (a[lo] + a[hi]) / 2;
  return {
    s,
    tx: Math.round(mid(baseSil, "left", "right") - s * mid(sil, "left", "right")),
    ty: Math.round(mid(baseSil, "top", "bottom") - s * mid(sil, "top", "bottom")),
  };
})();

/**
 * Would this transform push the painting out of the crop?
 *
 * The best unconstrained fit for a frame can sit a little wider than the box
 * the set shares -- the dark frog's rear haunch reached 18px past it -- and a
 * clipped haunch is a flat vertical cut down one side of the animal, which
 * shows the moment the frame swaps. Better to give up a pixel of registration
 * than to amputate. Rejecting these here rather than clamping afterwards means
 * the search returns the best fit that actually fits, instead of the best fit
 * followed by damage.
 */
function fits(s, tx, ty) {
  return (
    sil.left * s + tx >= CROP.left &&
    sil.right * s + tx <= CROP.left + CROP.width - 1 &&
    sil.top * s + ty >= CROP.top &&
    sil.bottom * s + ty <= CROP.top + CROP.height - 1
  );
}

// Coarse pass at 1/8 scale over a wide net around the seed, then a fine pass at
// 1/2 around the winner. A single fine sweep of the same range would be ~60x
// the work for an answer no better than a pixel. Scale windows are fractions of
// the seed rather than absolute, so a frame that arrives at a third of the
// base's scale gets a search as wide, in proportion, as one that arrives at 95%.
let best = { score: -1 };
for (const [k, sSpan, sStep, tSpan, tStep] of [
  [8, 0.12, 0.01, 112, 8],
  [2, 0.02, 0.002, 16, 2],
]) {
  const a = mask(base, k);
  const b = mask(frame, k);
  const centre = best.score < 0 ? seed : best;
  let round = { score: -1 };
  for (let d = -sSpan; d <= sSpan + 1e-9; d += sStep) {
    const s = centre.s + d * seed.s;
    for (let tx = centre.tx - tSpan; tx <= centre.tx + tSpan; tx += tStep) {
      for (let ty = centre.ty - tSpan; ty <= centre.ty + tSpan; ty += tStep) {
        if (!fits(s, tx, ty)) continue;
        const score = iou(a, b, s, tx / k, ty / k);
        if (score > round.score) round = { score, s, tx, ty };
      }
    }
  }
  if (round.score < 0) {
    console.error(`no transform in range keeps ${src} inside the crop box`);
    process.exit(1);
  }
  best = round;
  console.log(`1/${k}  IoU ${round.score.toFixed(4)}  scale ${round.s.toFixed(4)}  offset ${round.tx},${round.ty}`);
}
console.log(`     seed  scale ${seed.s.toFixed(4)}  offset ${seed.tx},${seed.ty}`);

// Scale the frame by its OWN dimensions -- a pre-trimmed frame is not the size
// of the field the base was drawn in -- and take CROP straight out of it rather
// than laying it on a base-sized canvas first. The crop lands wherever the fit
// put the frame, including partly off its edges, so each side is padded by
// exactly the amount the cut overhangs it.
const sw = Math.round(frame.W * best.s);
const sh = Math.round(frame.H * best.s);
const cut = { left: CROP.left - best.tx, top: CROP.top - best.ty };
const pad = {
  left: Math.max(0, -cut.left),
  top: Math.max(0, -cut.top),
  right: Math.max(0, cut.left + CROP.width - sw),
  bottom: Math.max(0, cut.top + CROP.height - sh),
};

// Two pipelines, not one. sharp applies its operations in its own fixed order
// rather than in call order, and an extract chained after an extend is taken
// against the pre-extend image -- so the cut lands short by the padding it was
// supposed to be measured against. Rendering the padded frame to a buffer first
// is what makes the second stage mean what it says.
const padded = await sharp(src)
  .resize(sw, sh)
  .extend({ ...pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(padded)
  .extract({
    left: cut.left + pad.left,
    top: cut.top + pad.top,
    width: CROP.width,
    height: CROP.height,
  })
  .png()
  .toFile(`${OUT_DIR}/${name}.png`);
console.log(`     wrote ${OUT_DIR}/${name}.png at ${CROP.width}x${CROP.height}`);
console.log("\nrun scripts/genbounds.mjs next -- bounds.ts is generated from these files");
