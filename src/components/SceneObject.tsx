import { useId } from "react";
import type { ObjectPart, SceneObjectData } from "../types/content";
import { assets } from "../assets/registry";
import styles from "./SceneObject.module.css";

interface Props {
  data: SceneObjectData;
  enterDelay: number;
  onActivate: (id: string) => void;
  onHover: (id: string | null) => void;
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

  return (
    <span className={styles.part} style={positioned}>
      <span
        className={`${styles.sway} motion-${part.preset ?? "sway-small"}`}
        style={{ animationDelay: `${part.delay}s` }}
      >
        <img
          className={`${styles.image} ${part.flip ? styles.flip : ""}`}
          src={src}
          alt=""
          draggable={false}
          decoding="async"
        />
      </span>
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

  // Scenery. Not a destination, so not a button, not focusable, not hoverable.
  if (!data.href) {
    return (
      <div
        className={`${styles.object} ${styles.scenery} anim-enter band-${data.band}`}
        style={placement}
        aria-hidden
      >
        {paintings}
      </div>
    );
  }

  return (
    <button
      type="button"
      ref={(el) => registerRef(data.id, el)}
      className={`${styles.object} ${styles.interactive} anim-enter band-${data.band}`}
      style={placement}
      aria-labelledby={labelId}
      onClick={() => onActivate(data.id)}
      onMouseEnter={() => onHover(data.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(data.id)}
      onBlur={() => onHover(null)}
    >
      <span id={labelId} hidden>
        {data.label.title}, {data.label.meta}
      </span>
      <span className={`${styles.breath} anim-breathe`}>{paintings}</span>
    </button>
  );
}
