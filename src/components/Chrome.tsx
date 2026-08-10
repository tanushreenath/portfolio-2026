import { useEffect, useState } from "react";
import type { Mood, Profile, SceneConfig } from "../types/content";
import styles from "./Chrome.module.css";

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

export function MoodToggle({
  moods,
  current,
  onChange,
}: {
  moods: Mood[];
  current: Mood;
  onChange: (m: Mood) => void;
}) {
  return (
    <div
      className={`${styles.corner} ${styles.topRight} ${styles.moods}`}
      role="group"
      aria-label="Light"
    >
      {moods.map((m) => (
        <button
          key={m}
          type="button"
          className={`${styles.mood} ${m === current ? styles.moodActive : ""}`}
          aria-pressed={m === current}
          onClick={() => onChange(m)}
        >
          {m}
        </button>
      ))}
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
