import { useState } from "react";
import contentData from "./content/content.json";
import type { Content, Mood, Route } from "./types/content";
import { useMood } from "./hooks/useMood";
import { isRoute, useRoute } from "./hooks/useRoute";
import { Scene } from "./components/Scene";
import type { HoverVia } from "./components/SceneObject";
import { Cursor } from "./components/Cursor";
import { Page } from "./components/Page";
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

const PAGES: Record<
  Exclude<Route, "/">,
  { eyebrow: string; title: string; intro: string; coming: string[] }
> = {
  "/work": {
    eyebrow: "Tanushree Nath",
    title: "Work",
    intro:
      "Selected product design work across enterprise banking, hardware manufacturing and influencer marketing.",
    coming: [
      "Case studies for the nine projects already held in content.json",
      "Outcome metrics pulled from each engagement",
      "Links out to the full Figma and Notion write-ups",
    ],
  },
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

  if (route !== "/") {
    const page = PAGES[route];
    return (
      <>
        {/* No Light here: the sun pool and shafts sit above the artwork by
            design, which is right in the garden and wrong over body copy. */}
        <Page {...page} onBack={() => go("/")} />
        <Grain />
      </>
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
