import styles from "./Stars.module.css";

/**
 * A scattering of stars across the upper sky, visible only at dusk.
 *
 * Positions are a fixed hand-picked list rather than random, so the sky is the
 * same on every visit and between renders -- a constellation that moves each
 * time reads as a glitch. Each star twinkles on its own slow cycle; the
 * durations stay mutually prime-ish so the field never pulses in unison.
 */
const STARS: Array<[x: number, y: number, size: number, delay: number, dur: number]> = [
  [6, 12, 1.6, 0.0, 3.1], [13, 26, 1.1, 1.1, 4.0], [19, 6, 1.9, 1.8, 2.7],
  [24, 19, 1.2, 0.5, 5.0], [31, 9, 1.4, 2.4, 3.6], [37, 22, 1.0, 1.4, 4.5],
  [43, 5, 1.7, 0.4, 3.1], [48, 16, 1.2, 2.7, 5.4], [54, 27, 1.5, 0.9, 4.0],
  [59, 8, 1.1, 2.1, 2.7], [64, 20, 1.8, 0.7, 5.0], [69, 4, 1.3, 1.6, 3.6],
  [74, 14, 1.6, 2.6, 4.5], [79, 25, 1.0, 0.2, 3.1], [83, 10, 1.9, 1.3, 4.0],
  [88, 21, 1.2, 2.0, 2.7], [92, 6, 1.4, 0.5, 5.4], [96, 17, 1.1, 2.9, 3.6],
  [9, 33, 1.0, 1.5, 4.5], [28, 36, 1.3, 2.2, 3.1], [46, 33, 1.1, 0.9, 5.0],
  [66, 35, 1.2, 2.2, 4.0], [85, 31, 1.5, 1.2, 3.6], [35, 30, 0.9, 3.1, 5.4],
  [16, 40, 0.9, 1.0, 4.0], [56, 41, 1.1, 2.5, 4.5], [76, 39, 1.0, 0.3, 3.1],
];

export function Stars() {
  return (
    <div className={styles.sky} aria-hidden>
      {STARS.map(([x, y, size, delay, dur], i) => (
        <span
          key={i}
          className={`${styles.star} anim-twinkle`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            animationDuration: `${dur}s`,
          }}
        />
      ))}
    </div>
  );
}
