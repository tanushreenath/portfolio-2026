/**
 * Maps an object's `asset` key from content.json to a real image URL.
 *
 * Content declares every piece of work, including ones whose painting does not
 * exist yet. Anything missing from this registry is skipped at render time
 * rather than breaking the scene, so adding artwork later is a file drop plus
 * one line here -- never a redesign.
 *
 * Files are unmodified copies of `reference/`, renamed only because the
 * originals contain spaces and live outside the Vite root. The frog is the one
 * exception: its two frames are separate paintings at slightly different scales
 * and had to be registered onto one canvas before they could be cross-faded.
 * See scripts/frogframes.mjs.
 *
 * The `?w=` values are deliberate, not uniform. An object is sized for how
 * large it is actually drawn, at 2x for retina: a midground toadstool occupies
 * ~270 CSS px, so shipping the 1024px original wastes roughly four fifths of
 * its bytes. Widths below are ~2x each object's rendered width at 2560px.
 */

import background from "./background.png?w=1920&quality=74&format=webp";
import toadstoolRed from "./objects/toadstool-red.png?w=1000&quality=82&format=webp";
import toadstoolBlue from "./objects/toadstool-blue.png?w=620&quality=82&format=webp";
import toadstoolPink from "./objects/toadstool-pink.png?w=600&quality=82&format=webp";
import toadstoolAmber from "./objects/toadstool-amber.png?w=520&quality=82&format=webp";
import pathStones from "./objects/path-stones.png?w=1600&quality=80&format=webp";
import wishingWell from "./objects/wishing-well.png?w=950&quality=82&format=webp";
import lampOff from "./objects/lamp-off.png?w=300&quality=82&format=webp";
import lampOn from "./objects/lamp-on.png?w=300&quality=82&format=webp";
import frogClosed from "./objects/frog-closed.png?w=320&quality=82&format=webp";
import frogOpen from "./objects/frog-open.png?w=320&quality=82&format=webp";
import signpost from "./objects/signpost.png?w=760&quality=82&format=webp";

/**
 * The meadow the garden stands in: sky and clouds above a horizon at 20.8%,
 * grass below. Not an object -- it is never placed, never hovered and carries
 * no position, so it is exported on its own rather than through the registry.
 *
 * Upscaled a little on the way out (source is 1536px, and it is drawn the full
 * width of the viewport) which a soft watercolour wash tolerates where a
 * detailed painting would not.
 */
export const backgroundImage = background;

export const assets: Record<string, string> = {
  "toadstool-red": toadstoolRed,
  "toadstool-blue": toadstoolBlue,
  "toadstool-pink": toadstoolPink,
  "toadstool-amber": toadstoolAmber,
  "path-stones": pathStones,
  "wishing-well": wishingWell,
  // Two states of one lamp. Both are always in the DOM; the mood decides which
  // one is visible, so they cross-fade rather than swap. See ObjectPart.mood.
  "lamp-off": lampOff,
  "lamp-on": lampOn,

  // Two states of one frog, on the same principle -- the cursor decides rather
  // than the mood. See ObjectPart.showOn.
  "frog-closed": frogClosed,
  "frog-open": frogOpen,

  // Trimmed to its own silhouette, which the original is not: the painting sits
  // in the middle of a 1536x1024 field and only fills a fifth of it, so four
  // fifths of every byte -- and of the box `size` and `position` are measured
  // against -- was empty margin. Trimmed to the alpha bounds plus 2%.
  signpost,

  // Awaiting artwork -- see docs/asset-prompt-pack.md:
  //   bottle-drink-me, teacup-saucer, pocket-watch, lantern
};

export function hasAsset(key: string): boolean {
  return key in assets;
}
