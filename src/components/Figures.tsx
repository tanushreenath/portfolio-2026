import { useCallback, useEffect, useRef, useState } from "react";
import { assets } from "../assets/registry";
import type { WorkFigure } from "../types/content";
import styles from "./Figures.module.css";

/** Per-frame decay of the glide, expressed at 60fps and rescaled to the real
 *  frame time so a 120Hz screen does not stop the strip twice as fast. */
const FRICTION = 0.94;
/** px/ms below which the glide is over. Roughly one pixel a frame. */
const MIN_SPEED = 0.06;

const pad = (n: number) => String(n).padStart(2, "0");

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * One plate in the strip.
 *
 * A figure whose artwork has not been made yet is not a broken image and not a
 * gap -- it is a labelled plate saying what will be mounted on it. That is the
 * same bargain the scene's registry strikes (see assets/registry.ts): content
 * describes the whole thing, and the missing pieces arrive as file drops.
 */
function Plate({ figure, n }: { figure: WorkFigure; n: number }) {
  const src = figure.asset ? assets[figure.asset] : undefined;

  return (
    <figure
      className={styles.plate}
      data-narrow={figure.aspect < 1 || undefined}
      style={{ "--aspect": figure.aspect } as React.CSSProperties}
    >
      {src ? (
        <img
          className={styles.image}
          src={src}
          alt={figure.caption}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <span className={styles.pending}>
          <span className={styles.figNo}>fig. {pad(n)}</span>
          <span className={styles.what}>{figure.caption}</span>
        </span>
      )}
    </figure>
  );
}

/**
 * A case study's figures, on one line you pull sideways.
 *
 * The strip is a real scroll container, not a transformed track. Everything
 * that already knows how to move a scroll container -- a trackpad, a shift
 * wheel, arrow keys, a touchscreen, a screen reader moving focus -- therefore
 * works without this file mentioning it. What is added on top is one thing: a
 * mouse can grab the paper and throw it.
 *
 * That is deliberately mouse-only. Touch has native momentum scrolling that is
 * better than anything reimplemented here, and taking pointer capture on a
 * finger would replace it with this -- while also swallowing the vertical swipe
 * that scrolls the page.
 */
export function Figures({ figures, label }: { figures: WorkFigure[]; label: string }) {
  const strip = useRef<HTMLDivElement>(null);
  /** The anchor a drag is measured from, and the speed it is leaving at. */
  const drag = useRef<{ id: number; x: number; from: number; speed: number; at: number } | null>(
    null
  );
  const glide = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });

  /* Which ends have more strip beyond them. Drives the fade at each edge, so
     the fade is a statement about the content rather than a permanent
     decoration -- a strip that fits its column has no fade at all. */
  const measure = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 });
  }, []);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    measure();
    // The strip is mounted inside a collapsed accordion and its plates size
    // themselves from a height that only exists once opened, so its scrollable
    // width is not known at mount. Observing it is the only honest way to know.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => ro.disconnect();
  }, [measure]);

  const stopGlide = useCallback(() => {
    if (glide.current) cancelAnimationFrame(glide.current);
    glide.current = 0;
  }, []);

  useEffect(() => stopGlide, [stopGlide]);

  /** Carry on at the speed the pointer let go at, slowing to a stop. */
  const startGlide = useCallback(
    (speed: number) => {
      if (Math.abs(speed) < MIN_SPEED || reduceMotion()) return;
      let v = speed;
      let last = performance.now();

      const step = (now: number) => {
        const el = strip.current;
        // Clamped: a backgrounded tab hands back one enormous frame, and
        // without this the strip would jump the whole way on return.
        const dt = Math.min(now - last, 32);
        last = now;
        v *= Math.pow(FRICTION, dt / 16.667);
        if (!el || Math.abs(v) < MIN_SPEED) {
          glide.current = 0;
          return;
        }
        const before = el.scrollLeft;
        // `instant`, because the element is set to scroll smoothly for the
        // benefit of the keyboard -- and a smooth scroll issued every frame
        // would fight the frame before it and crawl.
        el.scrollTo({ left: before + v * dt, behavior: "instant" });
        // Ran into an end. Stopping here rather than letting the velocity
        // decay against a wall is what keeps the fade honest.
        if (el.scrollLeft === before) {
          glide.current = 0;
          return;
        }
        glide.current = requestAnimationFrame(step);
      };

      glide.current = requestAnimationFrame(step);
    },
    []
  );

  /**
   * The arrow keys, taken over from the browser.
   *
   * A focused scroll container already answers them, at about 40px a press --
   * which is fine for a list and useless for a row of 400px plates: reaching
   * the fifth figure would take thirty presses. This moves by most of a screen
   * instead, and `scroll-behavior: smooth` on the element does the animating.
   */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const el = strip.current;
    if (!el) return;
    const page = el.clientWidth * 0.62;
    const jump =
      e.key === "ArrowRight" || e.key === "PageDown"
        ? page
        : e.key === "ArrowLeft" || e.key === "PageUp"
          ? -page
          : e.key === "Home"
            ? -el.scrollWidth
            : e.key === "End"
              ? el.scrollWidth
              : 0;
    if (!jump) return;
    e.preventDefault();
    stopGlide();
    el.scrollBy({ left: jump });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = strip.current;
    if (!el) return;
    stopGlide();
    el.setPointerCapture(e.pointerId);
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      from: el.scrollLeft,
      speed: 0,
      at: performance.now(),
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = strip.current;
    if (!d || !el || e.pointerId !== d.id) return;

    const now = performance.now();
    const before = el.scrollLeft;
    // Measured from the anchor every move rather than accumulated per event,
    // so a dropped frame cannot make the paper drift out from under the hand.
    el.scrollTo({ left: d.from - (e.clientX - d.x), behavior: "instant" });
    // Speed is taken from what the STRIP did, not from what the pointer did.
    // At either end they disagree completely: the hand keeps moving and the
    // paper cannot, and taking the pointer's speed would fling the strip back
    // the moment it was released.
    d.speed = (el.scrollLeft - before) / Math.max(now - d.at, 1);
    d.at = now;
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    setDragging(false);
    // Nothing for a while before release means the hand had already stopped,
    // and the strip should stop with it rather than resume an old speed.
    if (performance.now() - d.at < 90) startGlide(d.speed);
  };

  return (
    <div className={styles.wrap}>
      <div
        ref={strip}
        className={styles.strip}
        // Focusable, so the arrow keys reach it. A scroll container is one of
        // the few things a browser will operate from the keyboard unaided --
        // given a tab stop and a name, which is all this is.
        tabIndex={0}
        role="group"
        aria-label={`${label}: ${figures.length} figures, scrollable sideways`}
        data-dragging={dragging || undefined}
        data-at-start={edges.start || undefined}
        data-at-end={edges.end || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
        onScroll={measure}
        onWheel={stopGlide}
      >
        {figures.map((f, i) => (
          <Plate key={i} figure={f} n={i + 1} />
        ))}
      </div>

      {/* The strip's own caption, and the only affordance it has. Everything
          about a row of plates says "look"; nothing about it says "pull". */}
      {/* Both words ship; the stylesheet shows whichever matches the hand on
          the device. Telling someone with a touchscreen to drag is telling
          them to do the one thing this strip does not implement. */}
      <p className={styles.caption}>
        fig. 01 – {pad(figures.length)} <span aria-hidden>·</span>{" "}
        <span className={styles.verbDrag}>drag</span>
        <span className={styles.verbSwipe}>swipe</span>
      </p>
    </div>
  );
}
