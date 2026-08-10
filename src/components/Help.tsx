import { Overlay, overlayStyles as s } from "./Overlay";

const STEPS: Array<[string, string]> = [
  ["Hover", "Rest on any object in the garden and its name appears."],
  ["Click", "Opens that part of the site."],
  ["Toadstools", "The three together are Work."],
  ["Amber toadstool", "About."],
  ["Wishing well", "Playground."],
  ["Dawn / dusk", "Top right. Changes the light. Your choice is remembered."],
  ["Keyboard", "Tab moves between objects, Enter opens, Esc closes."],
];

/**
 * How to navigate.
 *
 * A scene without a nav bar has no affordance of its own, so this is the
 * explicit version of what the hover hint only gestures at.
 */
export function Help({ onClose }: { onClose: () => void }) {
  return (
    <Overlay title="Finding your way" eyebrow="The garden is the menu" onClose={onClose}>
      <p className={s.body}>
        There is no navigation bar. The objects in the clearing are the links —
        hover one to see where it goes, then click.
      </p>
      <dl className={s.steps}>
        {STEPS.map(([term, detail]) => (
          <div key={term} className={s.step}>
            <dt className={s.stepTerm}>{term}</dt>
            <dd className={s.stepDetail}>{detail}</dd>
          </div>
        ))}
      </dl>
    </Overlay>
  );
}
