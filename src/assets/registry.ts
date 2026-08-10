/**
 * Maps an object's `asset` key from content.json to a real image URL.
 *
 * Content declares every piece of work, including ones whose painting does not
 * exist yet. Anything missing from this registry is skipped at render time
 * rather than breaking the scene, so adding artwork later is a file drop plus
 * one line here -- never a redesign.
 *
 * Files are unmodified copies of `reference/`, renamed only because the
 * originals contain spaces and live outside the Vite root.
 *
 * The `?w=` values are deliberate, not uniform. An object is sized for how
 * large it is actually drawn, at 2x for retina: a midground toadstool occupies
 * ~270 CSS px, so shipping the 1024px original wastes roughly four fifths of
 * its bytes. Widths below are ~2x each object's rendered width at 2560px.
 */

import toadstoolRed from "./objects/toadstool-red.png?w=1000&quality=82&format=webp";
import toadstoolBlue from "./objects/toadstool-blue.png?w=620&quality=82&format=webp";
import toadstoolPink from "./objects/toadstool-pink.png?w=600&quality=82&format=webp";
import toadstoolAmber from "./objects/toadstool-amber.png?w=520&quality=82&format=webp";
import pathStones from "./objects/path-stones.png?w=1600&quality=80&format=webp";
import wishingWell from "./objects/wishing-well.png?w=1150&quality=82&format=webp";

export const assets: Record<string, string> = {
  "toadstool-red": toadstoolRed,
  "toadstool-blue": toadstoolBlue,
  "toadstool-pink": toadstoolPink,
  "toadstool-amber": toadstoolAmber,
  "path-stones": pathStones,
  "wishing-well": wishingWell,

  // Awaiting artwork -- see docs/asset-prompt-pack.md:
  //   bottle-drink-me, teacup-saucer, pocket-watch, lantern
};

export function hasAsset(key: string): boolean {
  return key in assets;
}
