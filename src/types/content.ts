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
/** Which side of the cursor a two-state painting belongs to. */
export type PartState = "rest" | "hover";
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
  /**
   * Vertical scale, applied about the painting's base.
   *
   * The one place a painting is allowed to leave its own proportions. A lamp
   * post is a column: it can be drawn taller without being drawn heavier, and
   * scaling it up uniformly to gain height would only make it fat. Anything
   * with a recognisable silhouette should be resized with `size` instead.
   */
  stretch?: number;
  /** Negative seconds, so parts share one clock but never sway in unison. */
  delay: number;
  preset?: MotionPreset;
  /**
   * Show this painting in one mood only.
   *
   * Both states stay mounted and the invisible one is faded out, so a lamp
   * going on at dusk cross-fades with the lamp that is off, on the same clock
   * as the rest of the light. Swapping the `src` instead would pop, and would
   * mean loading an image at the moment the mood changed.
   */
  mood?: Mood;
  /**
   * Show this painting on one side of the cursor only.
   *
   * The same device as `mood`, answering to hover instead of to the light: the
   * frog beside the amber toadstool is painted twice, and reaching for the
   * object it belongs to is what opens its mouth. Both frames stay mounted, so
   * nothing is fetched at the moment the cursor arrives.
   *
   * A part takes `mood` or `showOn`, not both -- they are two claims on the
   * same opacity.
   */
  showOn?: PartState;
  /**
   * Dissolve the foot of this painting into the meadow, over this percentage of
   * its own height.
   *
   * Every other object is a cut-out standing ON the field: a toadstool ends at
   * its stem, and the eye accepts that because a stem is a thing that ends. The
   * signpost was painted with its own turf and flowers around the post, so it
   * arrives with a second, harder ground line inside it -- an oval of somebody
   * else's grass sitting on top of the meadow, and no amount of moving it makes
   * two ground planes agree.
   *
   * Softening the bottom edge is what makes them one. Note this is a dissolve
   * and not a blur: the bands overhead take depth from scale and placement and
   * explicitly refuse to blur, because these are finished paintings and
   * softening one reads as a rendering fault rather than as distance. The same
   * reasoning applies here, so the painting keeps its focus all the way down and
   * simply stops being there.
   */
  fade?: number;
  /** Mirror horizontally. The path is painted receding to the right; the scene
   *  reads right-to-left, so it is flipped rather than repainted. */
  flip?: boolean;
}

export interface ObjectLabel {
  title: string;
  meta: string;
}

/**
 * Words painted onto an object, rather than floated beside it.
 *
 * A hover label is UI: it appears next to a painting, in the site's own type,
 * because you reached for something. This is the opposite -- it is part of the
 * artwork, it is always there, and it takes the light and the night with the
 * board it is written on.
 */
export interface ObjectSign {
  /** One entry per line, centred. Line breaks are a composition decision, so
   *  they are set here rather than left to wrapping. */
  lines: string[];
  /** What the sign says, read as a sentence. The lettering itself is hidden
   *  from assistive tech: split into one element per letter for the wiggle, it
   *  would otherwise be announced letter by letter. */
  label: string;
  /**
   * The painted panel the lettering sits in: centre, and size, as percentages
   * of the object's own box.
   *
   * Measured from the artwork's alpha and colour, not judged by eye -- the
   * board is the one bright near-neutral region inside the silhouette, and
   * these are its bounds. Repaint the signpost and they want re-measuring.
   */
  panel: { x: number; y: number; w: number; h: number };
  /** Cap height of the lettering, as a percentage of the object's width, so
   *  the writing scales with the painting it is on. */
  size: number;
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
  /**
   * This painting is a source of light, not a thing lit by one.
   *
   * It is therefore exempt from the night grade the rest of the clearing
   * takes: at dusk a lamp is the one object that should still show its own
   * colour, because it is the only thing at night doing its own lighting.
   */
  lit?: boolean;
  /** Words painted on this object. Scenery may carry one; it is content, not
   *  decoration, so it stays in the accessibility tree. */
  sign?: ObjectSign;
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
