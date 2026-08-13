import type { ReactNode } from "react";
import type { Mood } from "../types/content";
import { PageBar } from "./Chrome";
import styles from "./Page.module.css";

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  /** What will live here once the design lands. */
  coming: string[];
  mood: Mood;
  onMood: (m: Mood) => void;
  onBack: () => void;
  children?: ReactNode;
}

/**
 * A placeholder page.
 *
 * Deliberately thin: the designs for these are still to come, so this
 * establishes the route, the shared furniture and the way back, and states
 * plainly what is still missing rather than inventing a layout that will be
 * thrown away.
 */
export function Page({
  eyebrow,
  title,
  intro,
  coming,
  mood,
  onMood,
  onBack,
  children,
}: Props) {
  return (
    <main className={styles.page}>
      {/* No centred title: this page names itself in its own column, a line
          below the eyebrow, and saying it twice would be saying it twice. */}
      <PageBar mood={mood} onMood={onMood} onBack={onBack} />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.body}>{intro}</p>
        {children}
        <div className={styles.placeholder}>
          Placeholder — design pending. This page will hold:
          <ul className={styles.list}>
            {coming.map((c) => (
              <li key={c} className={styles.item}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
