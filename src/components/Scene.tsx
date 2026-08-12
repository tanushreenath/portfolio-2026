import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SceneObjectData } from "../types/content";
import { bounds } from "../assets/bounds";
import { backgroundImage } from "../assets/registry";
import { SceneObject, type HoverVia } from "./SceneObject";
import styles from "./Scene.module.css";

interface Props {
  objects: SceneObjectData[];
  hovered: string | null;
  overlayOpen: boolean;
  onHover: (id: string | null, via: HoverVia) => void;
  onActivate: (id: string) => void;
}

const BAND_ORDER = { foreground: 0, midground: 1, distance: 2 } as const;

/**
 * The stage's proportions -- one frame, every screen.
 *
 * These are the dimensions of reference/Whisical Garden.png, which is what
 * every object's position and size was measured against. There is no mobile
 * variant and no breakpoint: object coordinates are percentages of this stage,
 * so a phone, a laptop and a 5K display all show the identical composition and
 * a resize only changes how large the garden is drawn.
 */
const STAGE_ASPECT = 1728 / 1117;

/**
 * The lamp's bulb, in stage percentages, and the only source of light at dusk.
 *
 * Derived rather than guessed: the centroid of the lit glass sits at 49.5% /
 * 27.3% of lamp-on.png, and content.json draws the lamp 4.4% wide at x 42.6,
 * base y 44.3, stretched 1.3. Move the lamp and this wants recomputing.
 *
 * Set on .scene as --lamp-x / --lamp-y, which is where the glow reads it from.
 */
const LIGHT_ORIGIN = { x: 42.6, y: 17.3 };

/**
 * Distance from the painted edge to its label. One number, every object.
 *
 * 26px reproduces what the About label already looked like: it previously sat
 * 22px off its DOM box, and the amber toadstool's 4.5% transparent inset made
 * that ~27px from the visible edge. Keeping that spacing and applying it to
 * the artwork bounds is what brings the other two into line with it.
 */
const LABEL_GAP = 26;

/**
 * The box the *artwork* occupies, which is not the box the element occupies.
 *
 * Every painting carries transparent margin and the margins differ per file --
 * the wishing well is 16.8% empty on each side, the pink toadstool 11.5% on the
 * left. Measuring a label's gap from the DOM rect therefore puts it a different
 * distance from the visible edge for every object. These bounds are generated
 * by scripts/genbounds.mjs from the alpha channel of each source PNG.
 */
function artworkRect(data: SceneObjectData, box: DOMRect) {
  const clustered = data.parts.length > 1;
  let left = Infinity;
  let right = -Infinity;
  let top = Infinity;
  let bottom = -Infinity;

  for (const part of data.parts) {
    const b = bounds[part.asset];
    if (!b) continue;

    // A mirrored painting's horizontal insets mirror with it.
    const insetLeft = part.flip ? 1 - b.right : b.left;
    const insetRight = part.flip ? 1 - b.left : b.right;

    let pw = box.width;
    let ph = box.height;
    let pl = box.left;
    let pt = box.top;

    if (clustered) {
      pw = (box.width * (part.w ?? 100)) / 100;
      ph = pw / b.aspect;
      pl = box.left + (box.width * (part.x ?? 50)) / 100 - pw / 2;
      pt = box.top + (box.height * (part.y ?? 100)) / 100 - ph;
    }

    left = Math.min(left, pl + pw * insetLeft);
    right = Math.max(right, pl + pw * insetRight);
    top = Math.min(top, pt + ph * b.top);
    bottom = Math.max(bottom, pt + ph * b.bottom);
  }

  if (left === Infinity) return box;
  return { left, right, top, bottom, width: right - left, height: bottom - top };
}

export function Scene({
  objects,
  hovered,
  overlayOpen,
  onHover,
  onActivate,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLElement>());
  const [labelBox, setLabelBox] = useState<React.CSSProperties | null>(null);

  // Tab order runs front to back, then left to right -- the order the eye
  // actually travels.
  const visible = useMemo(
    () =>
      [...objects]
        .sort(
          (a, b) =>
            // Destinations tab in the order the eye travels, and nothing else
            // may reorder them. An explicit z used to be a scenery-only thing,
            // so sorting on it first was safe; the lamp post is a destination
            // that carries one -- it stands behind the path stones -- and
            // sorting on z first would have made the resume the first thing
            // Tab reaches, ahead of the work it is a summary of. Paint order
            // is unaffected: `zIndex` in the placement is what honours z, and
            // an explicit z-index beats DOM order.
            Number(Boolean(a.href)) - Number(Boolean(b.href)) ||
            // Scenery carries an explicit z; it paints first and never tabs.
            (a.z ?? 999) - (b.z ?? 999) ||
            BAND_ORDER[a.band] - BAND_ORDER[b.band] ||
            a.position.x - b.position.x
        ),
    [objects]
  );

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) nodes.current.set(id, el);
    else nodes.current.delete(id);
  }, []);

  const active = hovered ? visible.find((o) => o.id === hovered) : undefined;

  /**
   * Position the reveal from the object's measured bounds rather than from its
   * declared percentage. A painting's height depends on its own aspect ratio,
   * so percentage arithmetic put labels on top of the artwork; the rect is the
   * only thing that actually knows where an object ends.
   *
   * Which side it sits on is chosen per object in content, because the right
   * answer depends on where the object stands in the composition: the well has
   * open paper to its right, the amber toadstool to its left, and the cluster
   * above it.
   */
  useLayoutEffect(() => {
    if (!active) {
      setLabelBox(null);
      return;
    }

    const place = () => {
      const el = nodes.current.get(active.id);
      if (!el) return;

      const r = artworkRect(active, el.getBoundingClientRect());
      const gap = LABEL_GAP;
      const middle = r.top + r.height / 2;
      const clampY = (y: number) => Math.min(Math.max(y, 96), window.innerHeight - 60);
      const side = active.labelSide ?? "above";

      if (side === "right") {
        setLabelBox({
          left: r.right + gap,
          top: clampY(middle),
          transform: "translate(0, -50%)",
          textAlign: "left",
        });
      } else if (side === "left") {
        setLabelBox({
          left: r.left - gap,
          top: clampY(middle),
          transform: "translate(-100%, -50%)",
          textAlign: "right",
        });
      } else {
        setLabelBox({
          left: Math.min(Math.max(r.left + r.width / 2, 140), window.innerWidth - 140),
          top: clampY(r.top - gap),
          transform: "translate(-50%, -100%)",
          textAlign: "center",
        });
      }
    };

    place();
    // The rect is measured, not declared, so anything that moves the object
    // under a held reveal has to re-place it: a resize, or -- on a narrow
    // screen, where the garden is wider than the window -- scrolling the
    // scene sideways. Focusing an off-screen object scrolls it into view, so
    // this fires on keyboard travel too.
    const scroller = ref.current;
    window.addEventListener("resize", place);
    scroller?.addEventListener("scroll", place, { passive: true });
    return () => {
      window.removeEventListener("resize", place);
      scroller?.removeEventListener("scroll", place);
    };
  }, [active]);

  return (
    <div
      ref={ref}
      className={[
        styles.scene,
        overlayOpen ? styles.blurred : "",
        hovered ? styles.hovering : "",
      ]
        .filter(Boolean)
        .join(" ")}
      // On .scene, not on .artwork: the stage's width is derived from this and
      // the ground has to derive the same width, so it must be readable by
      // both. A custom property set on a child is not visible to its parent.
      style={
        {
          "--stage-aspect": STAGE_ASPECT,
          "--lamp-x": `${LIGHT_ORIGIN.x}%`,
          "--lamp-y": `${LIGHT_ORIGIN.y}%`,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.ground}
        style={{ "--ground-image": `url(${backgroundImage})` } as React.CSSProperties}
        aria-hidden
      >
        <div className={styles.sky} />
      </div>

      <div className={styles.artwork}>
        {visible.map((o, i) => (
          <SceneObject
            key={o.id}
            data={o}
            enterDelay={i * 80}
            onHover={onHover}
            onActivate={onActivate}
            registerRef={register}
          />
        ))}
      </div>

      {/* Both after .artwork, so they act on the paintings as well as on the
          meadow underneath them -- and the vignette before the glow, so the
          lamp's light is not dimmed by the dark it is cutting through. */}
      <div className={styles.vignette} aria-hidden />
      <div className={styles.glow} aria-hidden />

      {active && labelBox && (
        <div
          className={`${styles.label} anim-fade-in`}
          style={labelBox}
          aria-hidden
        >
          <p className={styles.labelTitle}>{active.label.title}</p>
          <p className={styles.labelMeta}>{active.label.meta}</p>
        </div>
      )}
    </div>
  );
}
