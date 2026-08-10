import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Overlay.module.css";

interface Props {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The shell every overlay shares: backdrop, focus trap, Esc, click-outside.
 *
 * It owns no content. Case study, About and Contact each supply their own and
 * inherit correct dismissal and focus behaviour for free.
 */
export function Overlay({ title, eyebrow, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;

      // Keep focus inside the panel while it is open. Without this, tabbing
      // walks into the scene behind, which is both invisible and blurred.
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Return the visitor to the object they came from, not to the page top.
      restoreTo.current?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className={`${styles.backdrop} anim-fade-in`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        className={`${styles.panel} anim-enter`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          close ✕
        </button>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export { styles as overlayStyles };
