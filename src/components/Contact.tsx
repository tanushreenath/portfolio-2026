import type { Profile } from "../types/content";
import { Overlay, overlayStyles as s } from "./Overlay";

export function Contact({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  return (
    <Overlay title="Get in touch" eyebrow={profile.location} onClose={onClose}>
      <div className={s.links}>
        {profile.links.map((l) => (
          <div key={l.href} className={s.linkRow}>
            <span className={s.linkLabel}>{l.label.toLowerCase()}</span>
            <a href={l.href} target="_blank" rel="noreferrer noopener">{l.display}</a>
          </div>
        ))}
      </div>
    </Overlay>
  );
}
