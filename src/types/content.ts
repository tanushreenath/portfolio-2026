/**
 * Shape of `src/content/content.json`, the single source of truth for the site.
 *
 * Nothing here is rendered directly by a component that also knows about
 * layout: objects carry their own position, band, and motion so that adding or
 * moving a piece of work is a content edit rather than a code change.
 */

export type Band = "foreground" | "midground" | "distance";
export type Mood = "dawn" | "dusk";
export type MotionPreset = "sway-large" | "sway-medium" | "sway-small" | "hang-swing" | "still";
export type Route = "/" | "/work" | "/about" | "/playground";
/** Which side of an object its hover reveal sits on. */
export type LabelSide = "left" | "right" | "above";

/**
 * Percentages of the stage -- not of the viewport, and not per breakpoint.
 *
 * There is one composition at every screen size; the stage only ever changes
 * how large it is drawn. `y` is the object's base, since objects hinge at the
 * bottom like a plant rooted in soil.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * One painting inside an object.
 *
 * Most objects are a single part. A cluster -- the three toadstools that stand
 * together and answer as one button -- is several, laid out in the object's own
 * box: `x` is a centre and `y` a base, both percentages of that box, so the
 * grouping holds its shape at any size.
 */
export interface ObjectPart {
  /** Key into the asset registry. A part whose asset is absent is skipped. */
  asset: string;
  /** Centre, as % of the object's box. Only meaningful in a multi-part object. */
  x?: number;
  /** Base, as % of the object's box. Only meaningful in a multi-part object. */
  y?: number;
  /** Width, as % of the object's box. Only meaningful in a multi-part object. */
  w?: number;
  /** Negative seconds, so parts share one clock but never sway in unison. */
  delay: number;
  preset?: MotionPreset;
  /** Mirror horizontally. The path is painted receding to the right; the scene
   *  reads right-to-left, so it is flipped rather than repainted. */
  flip?: boolean;
}

export interface ObjectLabel {
  title: string;
  meta: string;
}

export interface SceneObjectData {
  id: string;
  /** Where this object leads. Omitted for scenery. */
  href?: Route;
  parts: ObjectPart[];
  /** Width-to-height ratio of the object's box. Required for multi-part
   *  objects, which position their parts inside it. */
  aspect?: number;
  band: Band;
  position: Position;
  /** Width as a percentage of the stage's width. */
  size: number;
  /** Explicit stacking override. Used by the ground plane, which must sit
   *  behind every object regardless of its band. */
  z?: number;
  label: ObjectLabel;
  /** Chosen per object so a reveal never lands on artwork. Default "above". */
  labelSide?: LabelSide;
}

/** A piece of work. Lives in content ready for the /work page's design. */
export interface WorkItem {
  id: string;
  title: string;
  company: string;
  period: string;
  role: string;
  summary: string;
  metrics: string[];
  href?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  school: string;
  period: string;
  note?: string;
}

export interface ProfileLink {
  label: string;
  href: string;
  display: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  welcome: { greeting: string; sub: string };
  links: ProfileLink[];
}

export interface SceneConfig {
  moods: Mood[];
  defaultMood: Mood;
  /** Shown once, after this many ms of no interaction, then never again. */
  hintDelayMs: number;
  hintText: string;
}

export interface Content {
  profile: Profile;
  scene: SceneConfig;
  objects: SceneObjectData[];
  work: WorkItem[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: Record<string, string[]>;
}
