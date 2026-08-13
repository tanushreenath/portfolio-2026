import { useEffect, useState } from "react";
import { Around as AroundUntyped } from "@theme-toggles/react";
import "@theme-toggles/react/css/Around.css";
import type { Mood, Profile, SceneConfig } from "../types/content";
import styles from "./Chrome.module.css";

/**
 * @theme-toggles/react ships a broken `.d.ts`.
 *
 * Its props are declared as a `Pick<>` over a hand-written union of ~280 React
 * prop names, generated against an older @types/react. Three of those names --
 * `placeholder`, `onPointerEnterCapture`, `onPointerLeaveCapture` -- no longer
 * exist in @types/react 18.3, and `Pick` over a key a type does not have
 * yields a *required* property of an error type. So the component cannot be
 * rendered at all without passing three props that do not exist.
 *
 * The runtime component is fine; only the declaration is wrong. This restates
 * the props we actually use, which is also the honest surface: if the library
 * is ever swapped out, this is the contract to satisfy.
 */
const Around = AroundUntyped as unknown as React.FC<{
  className?: string;
  toggled?: boolean;
  onToggle?: (toggled: boolean) => void;
  duration?: number;
  title?: string;
  "aria-label"?: string;
}>;

/** The fixed corner furniture: welcome, mood, signature, contact, grain, hint. */

export function Welcome({ profile, dimmed }: { profile: Profile; dimmed: boolean }) {
  return (
    <div
      className={[
        styles.corner,
        styles.topLeft,
        styles.welcome,
        "anim-enter",
        dimmed ? styles.dimmed : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: "1.2s" }}
    >
      <p className={styles.greeting}>{profile.welcome.greeting}</p>
      <p className={styles.sub}>{profile.welcome.sub}</p>
    </div>
  );
}

/**
 * Dawn and dusk, as a sun that draws in its rays and becomes a moon.
 *
 * `Around` comes from @theme-toggles/react. The `Spin` toggle this was
 * specified from is documented on toggles.dev but has never been published to
 * npm -- no release of the package exports it -- and `Around` is the nearest
 * thing that ships. It draws in `currentColor` at `1em`, so it inherits the
 * mood's ink and is sized by font-size alone.
 *
 * Held controlled: `toggled` follows the mood, so the icon can never disagree
 * with the scene, including when the mood is restored from storage on load.
 *
 * The control on its own, with no position of its own: the light is changed
 * from the garden's corner and from a page's bar, and those are two different
 * places to stand. Everything that makes it the same control in both lives
 * here; everything that places it lives in whichever furniture is hosting it.
 */
export function MoodControl({
  current,
  onChange,
  className,
}: {
  current: Mood;
  onChange: (m: Mood) => void;
  className?: string;
}) {
  const dusk = current === "dusk";
  return (
    <Around
      className={`${styles.mood} ${className ?? ""}`}
      toggled={dusk}
      onToggle={(on) => onChange(on ? "dusk" : "dawn")}
      duration={750}
      aria-label={dusk ? "Switch to dawn" : "Switch to dusk"}
      title={dusk ? "Switch to dawn" : "Switch to dusk"}
    />
  );
}

/** The garden's copy, in the top right corner. */
export function MoodToggle({
  current,
  onChange,
}: {
  current: Mood;
  onChange: (m: Mood) => void;
}) {
  return (
    <div className={`${styles.corner} ${styles.topRight} ${styles.moods}`}>
      <MoodControl current={current} onChange={onChange} />
    </div>
  );
}

/**
 * The signature doubles as the way into About. The stepping-stone path used to
 * carry that job, but scenery a visitor can click is scenery they will click
 * by accident, so the affordance moved to type where it reads as a control.
 */
export function Signature({ profile, onOpen }: { profile: Profile; onOpen: () => void }) {
  return (
    <div className={`${styles.corner} ${styles.bottomLeft}`}>
      <button type="button" className={styles.link} onClick={onOpen}>
        {profile.name.toLowerCase()}
      </button>
    </div>
  );
}

export function ContactCorner({
  onContact,
  onHelp,
}: {
  onContact: () => void;
  onHelp: () => void;
}) {
  return (
    <div className={`${styles.corner} ${styles.bottomRight} ${styles.helpRow}`}>
      <button type="button" className={styles.link} onClick={onContact}>
        contact ↗
      </button>
      <button
        type="button"
        className={styles.help}
        onClick={onHelp}
        aria-label="How to navigate"
        title="How to navigate"
      >
        ?
      </button>
    </div>
  );
}

/**
 * The header for a page away from the garden.
 *
 * Three things and no more, which is the same restraint the garden's corners
 * keep: the way back, where you are, and whose site this is. It is furniture,
 * so it is fixed to the viewport rather than set in the page's column -- the
 * content scrolls underneath it and fades out into the paper as it goes.
 */
export function PageBar({
  title,
  mood,
  onMood,
  onBack,
}: {
  /** Shown centred. Omitted by a page that names itself in its own column. */
  title?: string;
  mood: Mood;
  onMood: (m: Mood) => void;
  onBack: () => void;
}) {
  return (
    <header className={styles.pageBar}>
      <button type="button" className={styles.pageBack} onClick={onBack}>
        ← back to the garden
      </button>
      {title ? <h1 className={styles.pageWhere}>{title}</h1> : <span />}
      {/* The same control the garden keeps in this corner, at the same size.
          Someone who has found it once should not have to look for it again. */}
      <MoodControl current={mood} onChange={onMood} className={styles.pageMood} />
    </header>
  );
}

/**
 * The scene's light: a warm low sun at dawn, a cold high moon at dusk.
 *
 * Sits above the artwork but below the type, so it grades the paintings
 * without ever washing out an 11px label.
 */
export function Light({ mood }: { mood: Mood }) {
  return (
    <div className={styles.light} data-mood={mood} aria-hidden>
      <div className={styles.pool} />
      <div className={styles.shafts} />
    </div>
  );
}

export function Grain() {
  return <div className={`${styles.grain} anim-grain`} aria-hidden />;
}

/**
 * Shown once, to a visitor who has not touched anything.
 *
 * A scene navigated entirely by hover has no affordance of its own -- someone
 * who never moves their cursor over an object sees an illustration and leaves.
 * This is the cheapest honest fix; it disappears on first interaction and is
 * never shown again.
 */
export function Hint({ config, dismissed }: { config: SceneConfig; dismissed: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    try {
      if (window.localStorage.getItem("wonderland:hinted")) return;
    } catch {
      // Storage unavailable; showing the hint again is the harmless outcome.
    }
    const t = window.setTimeout(() => setShow(true), config.hintDelayMs);
    return () => window.clearTimeout(t);
  }, [config.hintDelayMs, dismissed]);

  useEffect(() => {
    if (!dismissed) return;
    setShow(false);
    try {
      window.localStorage.setItem("wonderland:hinted", "1");
    } catch {
      /* no-op */
    }
  }, [dismissed]);

  if (!show || dismissed) return null;
  return <div className={`${styles.hint} anim-enter`}>{config.hintText}</div>;
}
