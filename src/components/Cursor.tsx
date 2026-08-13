import { useEffect, useId, useRef, useState } from "react";
import type { Mood } from "../types/content";
import styles from "./Cursor.module.css";

/**
 * A butterfly. Cool against a garden that is entirely warm pastel: it is the
 * one thing on screen that is not part of the painting, and it should not look
 * like it is.
 *
 * Drawn the way the firefly below is drawn, which is a deliberate pairing --
 * they are the same creature at two times of day and should read as one hand.
 * That means a light blue that opens to near-white at the wingtip rather than a
 * saturated fill, a rim in the same family as the wing instead of a hard warm
 * outline, and a soft halo painted into the SVG as a radial gradient. The halo
 * is what the firefly's lantern does for it, minus the flare: a butterfly does
 * not blink, so this one is steady and much quieter than that one.
 */
function Butterfly({ id }: { id: string }) {
  return (
    <svg className={styles.wings} viewBox="0 0 40 34" fill="none">
      <defs>
        {/* The halo, on the firefly's rules: four stops rather than two,
            because a wide gradient fading straight to nothing ends on a visible
            ring. Weaker than the firefly's -- that one is a light source and
            this one is only catching the sun.

            r=17 off a centre at y=17 is not a round number, it is the largest
            circle that still reaches zero inside a 40x34 viewBox. Any wider and
            the SVG clips the glow flat along the top and bottom edges, which
            puts back the straight-edged ring the four stops are here to
            avoid. */}
        <radialGradient id={`${id}-halo`} gradientUnits="userSpaceOnUse" cx="20" cy="17" r="17">
          <stop offset="0" stopColor="#e2f6ff" stopOpacity="0.5" />
          <stop offset="0.3" stopColor="#aee2fa" stopOpacity="0.26" />
          <stop offset="0.64" stopColor="#7fcdef" stopOpacity="0.09" />
          <stop offset="1" stopColor="#7fcdef" stopOpacity="0" />
        </radialGradient>

        {/* userSpaceOnUse, not the default. Gradient coordinates are fractions
            of the shape's own box unless this says otherwise, and these are
            viewBox numbers -- read as fractions they land twenty box-widths off
            the wing, every stop clamps to the first colour, and both wings come
            out one flat pale wash.

            The ramp runs from the hinge outward, which is how a wing is
            actually pigmented: deepest at the body, opening to near-white at
            the tip.

            FOUR GRADIENTS, NOT TWO, and that is the fix for a real asymmetry.
            One pair was shared by both wings, and a gradient vector pointing
            right means every point on the LEFT wing projects behind its first
            stop and clamps there: the left wing was a flat deep panel while the
            right one carried the whole ramp. Each side now runs its own vector
            out to its own tip, so the pair is a mirror of itself. */}
        <linearGradient
          id={`${id}-up-l`}
          gradientUnits="userSpaceOnUse"
          x1="20"
          y1="19"
          x2="5"
          y2="3"
        >
          <stop offset="0" stopColor="#3d9ac9" />
          <stop offset="0.55" stopColor="#79cdec" />
          <stop offset="1" stopColor="#d3f1ff" />
        </linearGradient>
        <linearGradient
          id={`${id}-up-r`}
          gradientUnits="userSpaceOnUse"
          x1="20"
          y1="19"
          x2="35"
          y2="3"
        >
          <stop offset="0" stopColor="#3d9ac9" />
          <stop offset="0.55" stopColor="#79cdec" />
          <stop offset="1" stopColor="#d3f1ff" />
        </linearGradient>
        <linearGradient
          id={`${id}-low-l`}
          gradientUnits="userSpaceOnUse"
          x1="20"
          y1="20"
          x2="11"
          y2="30"
        >
          <stop offset="0" stopColor="#4aa6d2" />
          <stop offset="1" stopColor="#c2ebfd" />
        </linearGradient>
        <linearGradient
          id={`${id}-low-r`}
          gradientUnits="userSpaceOnUse"
          x1="20"
          y1="20"
          x2="29"
          y2="30"
        >
          <stop offset="0" stopColor="#4aa6d2" />
          <stop offset="1" stopColor="#c2ebfd" />
        </linearGradient>
      </defs>

      {/* Under everything, and outside the beating groups: the glow belongs to
          the creature, not to the wings, so it must not scale with them four
          times a second. */}
      <circle cx="20" cy="17" r="17" fill={`url(#${id}-halo)`} />

      {/* Both wings are drawn out in full rather than one mirrored with a
          transform: the groups carry the beat, and an SVG transform attribute
          on the same elements is one more thing that has to agree with it
          every frame. */}
      <g className={styles.wingLeft}>
        <path
          d="M20 15C18 6 10 1 5 4C1 7 6 16.5 18.6 19.4Z"
          fill={`url(#${id}-up-l)`}
          stroke="#eaf9ff"
          strokeOpacity="0.7"
          strokeWidth="0.8"
        />
        <path
          d="M19.4 18.4C15 19 9 23 11 28C13 32.4 18.8 28.6 20 22.2Z"
          fill={`url(#${id}-low-l)`}
          stroke="#eaf9ff"
          strokeOpacity="0.7"
          strokeWidth="0.8"
        />
        <circle cx="11.4" cy="8.6" r="1.6" fill="#f2fbff" fillOpacity="0.85" />
      </g>

      <g className={styles.wingRight}>
        <path
          d="M20 15C22 6 30 1 35 4C39 7 34 16.5 21.4 19.4Z"
          fill={`url(#${id}-up-r)`}
          stroke="#eaf9ff"
          strokeOpacity="0.7"
          strokeWidth="0.8"
        />
        <path
          d="M20.6 18.4C25 19 31 23 29 28C27 32.4 21.2 28.6 20 22.2Z"
          fill={`url(#${id}-low-r)`}
          stroke="#eaf9ff"
          strokeOpacity="0.7"
          strokeWidth="0.8"
        />
        <circle cx="28.6" cy="8.6" r="1.6" fill="#f2fbff" fillOpacity="0.85" />
      </g>

      {/* Drawn last, over the hinge, so the wings never show a seam where they
          meet the body as they close. A cool dark, like the firefly's body: a
          silhouette against its own wings. */}
      <path d="M20 9.6C21.7 12 21.9 20 20 25C18.1 20 18.3 12 20 9.6Z" fill="#22394d" />
      <path
        d="M19.5 10.4C18 7.6 16.2 6.2 14.6 5.8M20.5 10.4C22 7.6 23.8 6.2 25.4 5.8"
        stroke="#22394d"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A firefly, for the dark.
 *
 * The butterfly is drawn in colour and read by its shape, which is exactly what
 * a violet field at midnight takes away. So the night gets an insect that is
 * read by its light instead: a small dark body doing almost nothing, and a
 * lantern that decides on its own when to be seen.
 */
function Firefly({ id }: { id: string }) {
  return (
    <svg className={`${styles.wings} ${styles.firefly}`} viewBox="0 0 40 34" fill="none">
      <defs>
        {/* The halo. Four stops rather than two: a gradient this wide fading
            straight to nothing ends on a visible ring, and a ring is the one
            shape a glow must not have. */}
        <radialGradient id={`${id}-glow`} gradientUnits="userSpaceOnUse" cx="20" cy="24" r="14">
          <stop offset="0" stopColor="#f4ffc0" stopOpacity="0.95" />
          <stop offset="0.28" stopColor="#d8f57e" stopOpacity="0.55" />
          <stop offset="0.62" stopColor="#a8d84e" stopOpacity="0.18" />
          <stop offset="1" stopColor="#a8d84e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wings first, under the body and under the light: they are membrane,
          and at night what shows of them is whatever is shining through. */}
      <g className={styles.wingLeft}>
        <path
          d="M19 12.5C13.5 13 7.5 18 8.5 23.5C9.4 27.4 16 22.6 19.4 18Z"
          fill="#e8f2d8"
          fillOpacity="0.34"
          stroke="#e8f2d8"
          strokeOpacity="0.3"
          strokeWidth="0.6"
        />
      </g>
      <g className={styles.wingRight}>
        <path
          d="M21 12.5C26.5 13 32.5 18 31.5 23.5C30.6 27.4 24 22.6 20.6 18Z"
          fill="#e8f2d8"
          fillOpacity="0.34"
          stroke="#e8f2d8"
          strokeOpacity="0.3"
          strokeWidth="0.6"
        />
      </g>

      {/* Unlit, the lantern is still there -- a pale segment at the tail, the
          colour a firefly's abdomen is in daylight. Everything that flares sits
          in the group above it. */}
      <ellipse cx="20" cy="23.6" rx="3.1" ry="4.4" fill="#cfd9a0" fillOpacity="0.55" />

      <g className={styles.ember}>
        <circle cx="20" cy="24" r="14" fill={`url(#${id}-glow)`} />
        <ellipse cx="20" cy="23.6" rx="3.1" ry="4.4" fill="#eaffae" />
        <ellipse cx="20" cy="24.4" rx="1.7" ry="2.6" fill="#ffffff" fillOpacity="0.9" />
      </g>

      {/* Thorax, head and antennae, over everything: the body is a silhouette
          against its own light, which is what a firefly looks like. */}
      <ellipse cx="20" cy="15.4" rx="2.7" ry="4.6" fill="#2a2a1c" />
      <circle cx="20" cy="10.6" r="2.2" fill="#39351f" />
      <path
        d="M19.2 9C17.8 6.6 16.4 5.6 15 5.2M20.8 9C22.2 6.6 23.6 5.6 25 5.2"
        stroke="#2a2a1c"
        strokeWidth="0.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The pointer, over anything in the garden that answers.
 *
 * Not a thing that follows the cursor -- the cursor itself, for as long as it
 * is there. The arrow is hidden on the objects (see SceneObject.module.css) and
 * the position here is written straight from the pointer event, unsmoothed and
 * un-lagged, so it is exactly where the arrow would have been. Anything easing
 * toward the pointer would be a second thing chasing a first, and would be
 * behind at the moment you clicked.
 *
 * Mounted for the whole session and merely made visible, rather than mounted on
 * hover: it has to already know where the pointer is when it is asked to
 * appear, or every hover would begin at the top left corner of the window.
 */
export function Cursor({ active, mood }: { active: boolean; mood: Mood }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  /** Whether a mouse has moved yet. A touch visitor has no cursor to replace,
   *  and before the first move there is nowhere to put one. */
  const seenRef = useRef(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = ref.current;
      if (el) el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      // Once, on the first move. Called on every move, a state write -- and
      // React's scheduling around it -- would sit between the pointer moving
      // and the transform landing, which is the whole latency budget.
      if (!seenRef.current) {
        seenRef.current = true;
        setSeen(true);
      }
    };
    // Leaving the window takes it along, or it would be left sitting at the
    // edge of the frame like something that had landed there.
    const out = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        seenRef.current = false;
        setSeen(false);
      }
    };

    // pointerrawupdate fires as fast as the device reports, ahead of the
    // coalescing that gives pointermove one event per frame. On a 1000Hz mouse
    // that is the difference between being where the pointer is and being where
    // it was a frame ago. Chromium only; elsewhere pointermove is the same
    // event at frame rate.
    const name = "onpointerrawupdate" in window ? "pointerrawupdate" : "pointermove";
    window.addEventListener(name, move as EventListener, { passive: true });
    window.addEventListener("pointerout", out, { passive: true });
    return () => {
      window.removeEventListener(name, move as EventListener);
      window.removeEventListener("pointerout", out);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.cursor} ${seen && active ? styles.on : ""}`}
      aria-hidden
    >
      <span className={styles.flit}>
        {mood === "dusk" ? <Firefly id={id} /> : <Butterfly id={id} />}
      </span>
    </div>
  );
}
