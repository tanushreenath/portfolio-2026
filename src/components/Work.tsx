import { useCallback, useEffect, useId, useRef, useState } from "react";
import { assets } from "../assets/registry";
import type { Content, SceneObjectData, WorkItem } from "../types/content";
import { PageBar } from "./Chrome";
import { Figures } from "./Figures";
import styles from "./Work.module.css";

/** Where an opening case study comes to rest, measured from the top of the
 *  viewport. Clears the page bar with room to spare. */
const SETTLE_TOP = 104;
/** How much of the remaining distance the page closes each frame at 60fps. */
const CHASE = 0.16;
/** How long the fold itself takes. Must match .reveal in Work.module.css: the
 *  settle has to know when the layout has stopped moving under it. */
const FOLD_MS = 620;

function reduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Bring a row to rest near the top of the page while the layout is still
 * moving underneath it.
 *
 * A plain scrollIntoView cannot do this. Opening a case study also closes the
 * one before it, so between the click and the end of the animation every row
 * below the closing one is travelling upward -- and a smooth scroll aimed at
 * where the target was when the click landed arrives at where it no longer is.
 *
 * So this chases rather than animates: every frame it reads where the row
 * actually is and closes a fixed fraction of the gap. Being exponential, it
 * eases out for free, and being re-measured each frame it cannot be wrong
 * about its destination -- the accordion and the scroll settle together.
 */
function useSettle(page: React.RefObject<HTMLElement>) {
  const raf = useRef(0);

  const stop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
  }, []);

  useEffect(() => stop, [stop]);

  const settle = useCallback(
    (row: HTMLElement | null) => {
      const scroller = page.current;
      if (!row || !scroller) return;
      stop();

      const top = Math.min(SETTLE_TOP, window.innerHeight * 0.18);

      if (reduceMotion()) {
        scroller.scrollTop += row.getBoundingClientRect().top - top;
        return;
      }

      let last = performance.now();
      // The accordion takes 0.62s and an exponential chase over a long gap
      // takes about another 0.9s to close the last pixel, so this is the
      // ceiling on the pair of them -- generous, because the only thing it cuts
      // short is a row that cannot be brought any higher and is therefore not
      // moving anyway.
      const settled = last + FOLD_MS;
      const deadline = last + 2400;

      const step = (now: number) => {
        const dt = Math.min(now - last, 32);
        last = now;
        const gap = row.getBoundingClientRect().top - top;
        /* Arriving is only believable once the fold has finished.
         *
         * While a case study above is collapsing, the row is travelling up the
         * viewport under its own steam, and somewhere on that journey it passes
         * through the very position being aimed for. Treating that frame as
         * arrival stopped the chase mid-flight and let the row sail on past --
         * a thousand pixels past, on a phone, which is the height of the case
         * study that was closing. So a small gap counts for nothing until the
         * layout has stopped moving. */
        if ((now > settled && Math.abs(gap) < 0.5) || now > deadline) {
          raf.current = 0;
          return;
        }
        scroller.scrollTop += gap * (1 - Math.pow(1 - CHASE, dt / 16.667));

        /* Deliberately no early exit when the scroll refuses to move.
         *
         * It is the obvious optimisation and it is wrong here. Closing one case
         * study to open another makes the page shorter, and a page that gets
         * shorter under a reader near the bottom of it has its scroll position
         * clamped by the browser every frame of the fold -- so for most of that
         * 0.62s the scroll goes nowhere no matter what is asked of it. Worse,
         * the row goes nowhere either: it climbs the document by exactly as
         * much as the clamp drops the scroll, so it holds still in the viewport
         * and even "has neither moved" is not evidence of being stuck. Bailing
         * out on that left the reader pinned to the end of the page, looking at
         * the tail of the case study they had just opened.
         *
         * A row that genuinely cannot be brought any higher costs the deadline
         * instead: about a second of a loop that asks for a scroll the browser
         * declines. Nothing is drawn, so the price of being patient is far
         * lower than the price of being wrong. */
        raf.current = requestAnimationFrame(step);
      };

      raf.current = requestAnimationFrame(step);
    },
    [page, stop]
  );

  return { settle, stop };
}

/**
 * The three toadstools that are the way into this page, standing at the foot
 * of it.
 *
 * The same three paintings, read from the same object in content.json, laid
 * out by the same rule the scene uses: each part is placed by its centre and
 * its base inside a box of the object's own proportions. It is the one thing
 * on the page that is not type, and it is here to say the garden is still
 * there rather than to decorate the end of a list.
 */
function Cluster({ data }: { data: SceneObjectData }) {
  const parts = data.parts.filter((p) => assets[p.asset]);
  if (!parts.length) return null;

  return (
    <div className={styles.cluster} style={{ aspectRatio: data.aspect }} aria-hidden>
      {parts.map((p) => (
        <span
          key={p.asset}
          className={styles.part}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%` }}
        >
          {/* Negative delays, exactly as in the garden: one clock, no two
              toadstools swaying in unison. */}
          <span
            className={`${styles.sway} motion-${p.preset ?? "still"}`}
            style={{ animationDelay: `${p.delay}s` }}
          >
            <img className={styles.paint} src={assets[p.asset]} alt="" />
          </span>
        </span>
      ))}
    </div>
  );
}

interface RowProps {
  item: WorkItem;
  index: number;
  open: boolean;
  onToggle: (id: string, row: HTMLElement | null) => void;
}

/**
 * One line of the index, and the case study folded underneath it.
 *
 * The case study is always in the DOM. It has to be -- a panel that mounts on
 * open has no height to animate from, and one that unmounts on close cannot be
 * animated out. What keeps it from being read by a screen reader while it is
 * shut is `visibility`, in the stylesheet, which also takes its links out of
 * the tab order. See .revealInner.
 */
function Row({ item, index, open, onToggle }: RowProps) {
  const row = useRef<HTMLDivElement>(null);
  const id = useId();
  const panelId = `${id}-case`;
  const titleId = `${id}-title`;

  return (
    <li
      className={`${styles.item} anim-enter`}
      data-open={open || undefined}
      style={{ animationDelay: `${140 + index * 90}ms` }}
    >
      <div className={styles.row} ref={row}>
        {/* The whole row is the target, which is why this covers it rather
            than wrapping it: the row is a three-column grid whose middle cell
            also holds a link out, and a button cannot contain one. */}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onToggle(item.id, row.current)}
        >
          <span className={styles.srOnly}>
            {open ? "Close" : "Open"} case study: {item.title}, {item.subtitle}
          </span>
        </button>

        <span className={styles.rowTitle} id={titleId}>
          {item.title}
        </span>

        <span className={styles.rowSub}>
          <span className={styles.rowSubText}>{item.subtitle}</span>
          {item.href && (
            <a
              className={styles.out}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title}: the full write-up, opens in a new tab`}
            >
              <span aria-hidden>↗</span>
            </a>
          )}
        </span>

        <span className={styles.rowYear}>{item.year}</span>
      </div>

      <div className={styles.reveal} data-open={open || undefined}>
        <div className={styles.revealInner}>
          <article
            className={styles.case}
            id={panelId}
            role="region"
            aria-labelledby={titleId}
          >
            <header className={styles.caseHead}>
              <h2 className={styles.caseTitle} style={{ "--i": 0 } as React.CSSProperties}>
                {item.caseTitle ?? item.title}
              </h2>
              <p className={styles.caseRole} style={{ "--i": 0 } as React.CSSProperties}>
                {item.role}
                <span className={styles.caseWhere}>
                  {item.company} · {item.period}
                </span>
              </p>
            </header>

            <p className={styles.caseSub} style={{ "--i": 1 } as React.CSSProperties}>
              {item.subtitle}
            </p>

            <div className={styles.plates} style={{ "--i": 2 } as React.CSSProperties}>
              <Figures figures={item.figures} label={item.caseTitle ?? item.title} />
            </div>

            <p className={styles.headline} style={{ "--i": 3 } as React.CSSProperties}>
              {item.headline}
            </p>

            <div className={styles.body} style={{ "--i": 4 } as React.CSSProperties}>
              {item.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            {item.metrics.length > 0 && (
              <ul className={styles.metrics} style={{ "--i": 5 } as React.CSSProperties}>
                {item.metrics.map((m) => (
                  <li key={m.label} className={styles.metric}>
                    <span className={styles.metricValue}>{m.value}</span>{" "}
                    <span className={styles.metricLabel}>{m.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {item.href && (
              <p className={styles.more} style={{ "--i": 6 } as React.CSSProperties}>
                <a
                  className={styles.moreLink}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  The full write-up <span aria-hidden>↗</span>
                </a>
              </p>
            )}
          </article>
        </div>
      </div>
    </li>
  );
}

/**
 * Work: an index of four case studies, each of which opens where it stands.
 *
 * Deliberately not four pages. A visitor comparing projects is comparing the
 * one-line description of each, and every navigation away and back costs them
 * that comparison. Here the index never leaves: a case study unfolds between
 * the row that names it and the row after it, and closing it puts the list
 * back exactly as it was.
 *
 * One at a time, for the same reason -- two open cases put a screen of
 * scrolling between two rows that are supposed to be read against each other.
 */
export function Work({ content, onBack }: { content: Content; onBack: () => void }) {
  const page = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  const { settle, stop } = useSettle(page);
  const cluster = content.objects.find((o) => o.id === "work");

  const toggle = useCallback(
    (id: string, row: HTMLElement | null) => {
      const next = open === id ? null : id;
      setOpen(next);
      // Only on the way open. Closing a case study should leave the page
      // exactly where the reader left it -- they are already looking at the
      // row they just shut.
      if (next) settle(row);
      else stop();
    },
    [open, settle, stop]
  );

  return (
    <>
      <PageBar title="Work" handle={content.profile.handle} onBack={onBack} />

      <main
        className={styles.page}
        ref={page}
        // Any deliberate scroll of their own outranks the settle. Nothing is
        // worse than a page that keeps pulling itself back.
        onWheel={stop}
        onTouchStart={stop}
      >
        <div className={styles.column}>
          <ul className={styles.list}>
            {content.work.map((item, i) => (
              <Row
                key={item.id}
                item={item}
                index={i}
                open={open === item.id}
                onToggle={toggle}
              />
            ))}
          </ul>

          {cluster && <Cluster data={cluster} />}
        </div>
      </main>
    </>
  );
}
