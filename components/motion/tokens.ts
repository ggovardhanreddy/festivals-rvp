/**
 * One vocabulary for movement across the site.
 *
 * Before this, every animated component chose its own duration and curve, and
 * eighteen separate CSS blocks each remembered prefers-reduced-motion on their
 * own. The result reads as several websites politely sharing a domain. These
 * are the values everything now borrows, so a card settling on the People page
 * settles at the same speed as one on the gallery.
 *
 * The easing is the curve `Reveal` already used -- a fast start that comes to
 * rest slowly. It was the right choice; it just was not written down anywhere.
 */

/** Standard ease-out. Motion should arrive quickly and stop gently. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** For something leaving, or a hover that must feel immediate. */
export const EASE_SHORT = [0.4, 0, 0.2, 1] as const;

export const DUR = {
  /** Hover and focus: fast enough to feel like a direct response. */
  micro: 0.18,
  /** A single element arriving. */
  reveal: 0.55,
  /** A portrait or hero image settling. Slower reads as deliberate. */
  image: 0.9,
  /** Deliberately slow, for a hero's opening move. */
  cinematic: 1.4,
} as const;

/**
 * How far things travel.
 *
 * Small on purpose. A long slide draws attention to the animation; a short one
 * draws attention to the content, which is the point -- these are photographs
 * of people's grandparents, not a product launch.
 */
export const DIST = {
  /** Text and small elements. */
  near: 18,
  /** Cards and blocks. */
  mid: 30,
  /** The lower layer of a two-speed pair, for depth. */
  far: 45,
} as const;

/** Cards, timeline entries, gallery items: enough to read as a sequence. */
export const STAGGER = 0.08;

/** Fire when this fraction of the element has entered the viewport. */
export const VIEWPORT = { once: true, amount: 0.15, margin: "80px 0px" } as const;

/**
 * A safer viewport for anything tall or below a locked scroll container.
 *
 * `Reveal` carried a hard-won comment about this: whileInView can miss on
 * mobile when overflow is locked or the observer is late after a navigation.
 * A lower threshold makes a missed trigger far less likely, and the cost of
 * being early is nothing.
 */
export const VIEWPORT_SAFE = { once: true, amount: 0.05, margin: "120px 0px" } as const;
