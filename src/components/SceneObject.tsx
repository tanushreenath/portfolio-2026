import { useId } from "react";
import type { ObjectPart, ObjectSign, SceneObjectData } from "../types/content";
import { assets } from "../assets/registry";
import styles from "./SceneObject.module.css";

/** Seconds between one letter starting its wiggle and the next. Negative, so
 *  every letter is already mid-cycle on the scene's shared clock and the sign
 *  is never caught starting. */
const LETTER_STAGGER = -0.18;

/**
 * Whether a destination names a file rather than a page.
 *
 * This is a question about the string, not about the site's routes -- which is
 * the point. It lets an object know that reaching it should follow a link out
 * without this file having to learn what the routes are.
 */
const isFile = (href: string) => /\.[a-z0-9]+$/i.test(href);

/**
 * How an object was reached.
 *
 * The reveal is the same either way, but the butterfly cursor is not: it has
 * to sit on a pointer, and a visitor arriving by Tab has not got one. Reported
 * rather than inferred, because by the time it reaches the top of the app the
 * two are indistinguishable.
 */
export type HoverVia = "pointer" | "focus";

interface Props {
  data: SceneObjectData;
  enterDelay: number;
  onActivate: (id: string) => void;
  onHover: (id: string | null, via: HoverVia) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

/** One painting, with its own sway. Several of these make a cluster. */
function Painting({ part, clustered }: { part: ObjectPart; clustered: boolean }) {
  const src = assets[part.asset];
  if (!src) return null; // artwork not painted yet; declared in content, skipped here

  const positioned: React.CSSProperties = clustered
    ? {
        position: "absolute",
        left: `${part.x ?? 50}%`,
        top: `${part.y ?? 100}%`,
        width: `${part.w ?? 100}%`,
        translate: "-50% -100%",
      }
    : {};

  // A two-state painting is always rendered; the mood, or the cursor, only
  // decides which of the pair you can see. Both states of the lamp therefore
  // sit in the same place and cross-fade, and so do both frogs.
  const stateClass = part.mood
    ? styles[`only${part.mood === "dusk" ? "Dusk" : "Dawn"}`]
    : part.showOn
      ? styles[`only${part.showOn === "hover" ? "Reached" : "Resting"}`]
      : "";

  return (
    <span className={`${styles.part} ${stateClass}`} style={positioned}>
      <span
        className={`${styles.sway} motion-${part.preset ?? "sway-small"}`}
        style={{ animationDelay: `${part.delay}s` }}
      >
        {/* The plate holds the painting and its night wash together, so the
            mirror and the hover lift apply to both at once and the two can
            never come apart. */}
        <span
          className={`${styles.plate} ${part.flip ? styles.flip : ""} ${
            part.fade ? styles.rooted : ""
          }`}
          style={
            {
              "--part-stretch": part.stretch ?? 1,
              "--part-fade": part.fade ? `${part.fade}%` : undefined,
            } as React.CSSProperties
          }
        >
          <img className={styles.image} src={src} alt="" draggable={false} decoding="async" />
          {/* The wash is a plain block of colour cut to the painting's own
              silhouette: same file, used as a mask. A rectangle would tint the
              transparent margin every asset carries and put a dark card behind
              each toadstool. */}
          <span
            className={styles.tint}
            style={{ "--part-src": `url(${src})` } as React.CSSProperties}
          />
        </span>
      </span>
    </span>
  );
}

/**
 * Lettering painted onto an object's board.
 *
 * Positioned from the panel measured off the artwork, and sized in `cqw` --
 * percentages of the object's own width -- so the writing is locked to the
 * painting at every screen size. There is one composition here, not a set of
 * breakpoints, and type in `px` or `rem` would be the one thing in the garden
 * that did not scale with it: legible at 1440 and spilling off the board at 500.
 *
 * The letters are separate elements because they have to move separately. That
 * is fine to look at and useless to listen to, so the lettering is hidden and
 * the sign presents itself as one image with one label.
 */
function Sign({ sign }: { sign: ObjectSign }) {
  let letter = 0;

  return (
    <span
      className={styles.signText}
      role="img"
      aria-label={sign.label}
      style={
        {
          left: `${sign.panel.x}%`,
          top: `${sign.panel.y}%`,
          width: `${sign.panel.w}%`,
          height: `${sign.panel.h}%`,
          fontSize: `${sign.size}cqw`,
        } as React.CSSProperties
      }
    >
      {sign.lines.map((line) => (
        <span className={styles.signLine} key={line}>
          {[...line].map((char, i) =>
            char === " " ? (
              // A space is not a letter and must not wiggle -- moving it would
              // move the words either side of it.
              <span className={styles.signSpace} key={i} />
            ) : (
              <span
                className={`${styles.signLetter} anim-letter`}
                key={i}
                style={{ animationDelay: `${(letter++ * LETTER_STAGGER).toFixed(2)}s` }}
              >
                {char}
              </span>
            )
          )}
        </span>
      ))}
    </span>
  );
}

/**
 * Renders one object in the clearing and reports interaction upward.
 *
 * It knows nothing about routes or pages -- only how to place its paintings,
 * apply their band and motion, and say when it was chosen. Every visual
 * behaviour is expressed through CSS classes, so motion can be retuned in
 * motion.css without touching this file.
 */
export function SceneObject({
  data,
  enterDelay,
  onActivate,
  onHover,
  registerRef,
}: Props) {
  const labelId = useId();
  const parts = data.parts.filter((p) => assets[p.asset]);
  if (parts.length === 0) return null;

  const clustered = parts.length > 1;

  const placement = {
    left: `${data.position.x}%`,
    top: `${data.position.y}%`,
    width: `${data.size}%`,
    aspectRatio: clustered ? data.aspect : undefined,
    zIndex: data.z,
    // Anchored at its base and centred on its x, via `translate` so the enter
    // animation's `transform` cannot clobber it.
    translate: "-50% -100%",
    animationDelay: `${enterDelay}ms`,
  } as React.CSSProperties;

  const paintings = parts.map((p) => (
    <Painting key={p.asset} part={p} clustered={clustered} />
  ));

  // Scenery. Not a destination, so not a link, not focusable, not hoverable.
  //
  // Hidden from assistive tech unless it says something. A signpost is still
  // scenery -- it leads nowhere and cannot be clicked -- but "Welcome to Tanu's
  // Garden" is the first thing the garden says to anyone who arrives, and
  // hiding it would mean it greeted only the people who can see it. The
  // paintings inside carry alt="" and stay silent either way.
  if (!data.href) {
    return (
      <div
        className={`${styles.object} ${styles.scenery} ${data.lit ? styles.lit : ""} ${
          data.sign ? styles.signed : ""
        } anim-enter band-${data.band}`}
        style={placement}
        aria-hidden={data.sign ? undefined : true}
      >
        {paintings}
        {data.sign && <Sign sign={data.sign} />}
      </div>
    );
  }

  // Shared by both kinds of destination. Reaching an object is reaching it
  // whether it is a page or a file: the same reveal, the same lift, the same
  // breath, and only what happens on the click differs.
  const reached = {
    ref: (el: HTMLElement | null) => registerRef(data.id, el),
    className: `${styles.object} ${styles.interactive} ${
      data.lit ? styles.lit : ""
    } anim-enter band-${data.band}`,
    style: placement,
    "aria-labelledby": labelId,
    onMouseEnter: () => onHover(data.id, "pointer"),
    onMouseLeave: () => onHover(null, "pointer"),
    onFocus: () => onHover(data.id, "focus"),
    onBlur: () => onHover(null, "focus"),
  };

  const inside = (
    <>
      <span id={labelId} hidden>
        {data.label.title}, {data.label.meta}
      </span>
      <span className={`${styles.breath} anim-breathe`}>{paintings}</span>
    </>
  );

  // A file is a real link, not a button that opens one.
  //
  // The lamp post leads to a PDF the browser fetches for itself, and an anchor
  // is the only way that behaves the way a link is expected to: cmd-click and
  // middle-click open it in a background tab, the status bar shows where it
  // goes, and "Save link as" is there. window.open() from a button offers none
  // of that -- it also has to survive a popup blocker, which a plain link does
  // not. The site's own pages stay buttons: they are pushState navigations
  // inside one document, not somewhere else to go.
  if (isFile(data.href)) {
    return (
      <a {...reached} href={data.href} target="_blank" rel="noopener noreferrer">
        {inside}
      </a>
    );
  }

  return (
    <button {...reached} type="button" onClick={() => onActivate(data.id)}>
      {inside}
    </button>
  );
}
