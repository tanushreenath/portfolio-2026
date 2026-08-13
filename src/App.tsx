import { useEffect, useState } from "react";
import contentData from "./content/content.json";
import type { Content, Mood, Route } from "./types/content";
import { useMood } from "./hooks/useMood";
import { isRoute, useRoute } from "./hooks/useRoute";
import { Scene } from "./components/Scene";
import type { HoverVia } from "./components/SceneObject";
import { Cursor } from "./components/Cursor";
import { Page } from "./components/Page";
import { Work } from "./components/Work";
import { Contact } from "./components/Contact";
import { Help } from "./components/Help";
import { Stars } from "./components/Stars";
import {
  ContactCorner,
  Grain,
  Hint,
  Light,
  MoodToggle,
  Signature,
  Welcome,
} from "./components/Chrome";

const content = contentData as unknown as Content;

/**
 * The routes that are still placeholders.
 *
 * /work is not among them any more: it has a design and a component of its
 * own. This is what is left, and it states plainly what is missing rather than
 * inventing a layout that will be thrown away.
 */
const PAGES: Record<
  Exclude<Route, "/" | "/work">,
  { eyebrow: string; title: string; intro: string; coming: string[] }
> = {
  "/about": {
    eyebrow: "Tanushree Nath",
    title: "About",
    intro: "Product designer in Bengaluru, working across research, systems and interface.",
    coming: [
      "Experience, education and skills, already held in content.json",
      "A longer written introduction",
      "Contact and availability",
    ],
  },
  "/playground": {
    eyebrow: "Tanushree Nath",
    title: "Playground",
    intro: "Experiments, side work and things made for the pleasure of making them.",
    coming: ["Experiments and side projects", "Process sketches and explorations"],
  },
};

export default function App() {
  const [mood, setMood] = useMood(content.scene.defaultMood, content.scene.moods);
  const [hovered, setHovered] = useState<string | null>(null);
  /** Whether the object being reached for is under a pointer, which is the
   *  only case with somewhere to put a butterfly. */
  const [onPointer, setOnPointer] = useState(false);
  const [touched, setTouched] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { route, go } = useRoute();

  const objects = content.objects;

  // Only pages arrive here. An object that leads to a file is an anchor and the
  // browser follows it without asking the app -- see SceneObject.
  const activate = (id: string) => {
    setTouched(true);
    const target = objects.find((o) => o.id === id)?.href;
    if (target && isRoute(target)) go(target);
  };

  const hover = (id: string | null, via: HoverVia) => {
    if (id) setTouched(true);
    setHovered(id);
    setOnPointer(Boolean(id) && via === "pointer");
  };

  /**
   * Leaving the garden puts every object back down.
   *
   * A pointer leaving an object is an event; an object leaving from under a
   * pointer is not. Clicking a toadstool replaces the whole scene, so no
   * mouseleave is ever sent and `hovered` stays set to the thing that was
   * clicked -- which is invisible for as long as you are away and wrong the
   * moment you come back: the garden returns with that object lit, its reveal
   * floating beside it, the welcome dimmed for a hover nobody is performing,
   * and a butterfly for a cursor. All of it clears on the first mouse move,
   * which is exactly the tell that it was stale rather than real.
   *
   * Keyed on the route rather than fixed to the click, so it holds for every
   * way out and back: an object, the page's own Back, and the browser's.
   * `touched` is deliberately left alone -- the hint has been earned and
   * should not return.
   */
  useEffect(() => {
    setHovered(null);
    setOnPointer(false);
  }, [route]);

  // Neither the light nor the grain leaves the garden. Both are there to fuse
  // separately-painted artwork into one image, and away from the scene there
  // is no artwork to fuse: over body copy the light washes out the contrast
  // and the grain lands on the letterforms.
  // The mood is the one piece of state that belongs to the whole site rather
  // than to the garden: it is written to the document element and every page
  // is painted out of the same tokens, so the control travels with the
  // visitor instead of being something they have to go home to find.
  if (route === "/work") {
    return (
      <Work
        content={content}
        mood={mood as Mood}
        onMood={setMood}
        onBack={() => go("/")}
      />
    );
  }

  if (route !== "/") {
    return (
      <Page
        {...PAGES[route]}
        mood={mood as Mood}
        onMood={setMood}
        onBack={() => go("/")}
      />
    );
  }

  return (
    <>
      <Scene
        objects={objects}
        hovered={hovered}
        overlayOpen={contactOpen || helpOpen}
        onHover={hover}
        onActivate={activate}
      />

      <Stars />
      <Light mood={mood as Mood} />
      <Cursor active={onPointer} mood={mood as Mood} />

      <Welcome
        profile={content.profile}
        dimmed={Boolean(hovered) || contactOpen || helpOpen}
      />
      <MoodToggle current={mood as Mood} onChange={setMood} />
      <Signature profile={content.profile} onOpen={() => go("/about")} />
      <ContactCorner
        onContact={() => setContactOpen(true)}
        onHelp={() => setHelpOpen(true)}
      />

      <Grain />
      <Hint config={content.scene} dismissed={touched} />

      {contactOpen && (
        <Contact profile={content.profile} onClose={() => setContactOpen(false)} />
      )}
      {helpOpen && <Help onClose={() => setHelpOpen(false)} />}
    </>
  );
}
