/**
 * Kids World activity catalogue.
 *
 * `ready: false` entries are listed but not linked, and each carries the
 * honest reason it is not here yet. Stories, rhymes and educational videos
 * are the clearest examples: publishing them would mean either copying
 * material we have no licence to, or writing "traditional" stories that no
 * one in the village has actually told us. Neither is acceptable, so the
 * section says so instead of filling the grid.
 */
export type KidsActivity = {
  id: string;
  /** Path segment under /kids/, or an absolute path for a cross-link. */
  href: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  ready: boolean;
  /** Why it is not ready. Rendered to the visitor, not just to us. */
  pendingKey?: string;
};

export const KIDS_ACTIVITIES: KidsActivity[] = [
  {
    id: "alphabet",
    href: "/kids/alphabet/",
    labelKey: "kids.abc",
    descriptionKey: "kids.abc.desc",
    icon: "letter",
    ready: true,
  },
  {
    id: "telugu",
    href: "/kids/telugu/",
    labelKey: "kids.telugu",
    descriptionKey: "kids.telugu.desc",
    icon: "letter",
    ready: true,
  },
  {
    id: "english",
    href: "/kids/english/",
    labelKey: "kids.english",
    descriptionKey: "kids.english.desc",
    icon: "english",
    ready: true,
  },
  {
    id: "numbers",
    href: "/kids/numbers/",
    labelKey: "kids.numbers",
    descriptionKey: "kids.numbers.desc",
    icon: "plus",
    ready: true,
  },
  {
    id: "math",
    href: "/kids/math/",
    labelKey: "kids.math",
    descriptionKey: "kids.math.desc",
    icon: "plus",
    ready: true,
  },
  {
    id: "drawing",
    href: "/kids/drawing/",
    labelKey: "kids.drawing",
    descriptionKey: "kids.drawing.desc",
    icon: "brush",
    ready: true,
  },
  {
    id: "memory",
    href: "/play/memory/",
    labelKey: "kids.memory",
    descriptionKey: "kids.memory.desc",
    icon: "cards",
    ready: true,
  },
  {
    id: "puzzles",
    href: "/play/sudoku/",
    labelKey: "kids.puzzles",
    descriptionKey: "kids.puzzles.desc",
    icon: "grid",
    ready: true,
  },
  {
    id: "quiz",
    href: "/play/quiz/",
    labelKey: "kids.quiz",
    descriptionKey: "kids.quiz.desc",
    icon: "question",
    ready: true,
  },
  {
    id: "gk",
    href: "/kids/gk/",
    labelKey: "kids.gk",
    descriptionKey: "kids.gk.desc",
    icon: "globe",
    ready: true,
  },
  {
    id: "stories",
    href: "/kids/stories/",
    labelKey: "kids.stories",
    descriptionKey: "kids.stories.desc",
    icon: "book",
    ready: true,
  },
  {
    id: "rhymes",
    href: "/kids/rhymes/",
    labelKey: "kids.rhymes",
    descriptionKey: "kids.rhymes.desc",
    icon: "music",
    ready: true,
  },
  {
    id: "science",
    href: "/kids/science/",
    labelKey: "kids.science",
    descriptionKey: "kids.science.desc",
    icon: "science",
    ready: true,
  },
  {
    id: "videos",
    href: "/kids/videos/",
    labelKey: "kids.videos",
    descriptionKey: "kids.videos.desc",
    icon: "video",
    ready: true,
  },
];

/** Only these resolve to a page. Everything else stays on the hub. */
export const KIDS_ROUTES = [
  "alphabet",
  "telugu",
  "english",
  "numbers",
  "math",
  "drawing",
  "gk",
  "stories",
  "rhymes",
  "science",
  "videos",
] as const;

/** Sections whose pages list content items rather than run an activity. */
export const KIDS_LIBRARIES = ["stories", "rhymes", "science", "videos"] as const;
export type KidsLibrary = (typeof KIDS_LIBRARIES)[number];

export function isKidsLibrary(slug: string): slug is KidsLibrary {
  return (KIDS_LIBRARIES as readonly string[]).includes(slug);
}
export type KidsRouteSlug = (typeof KIDS_ROUTES)[number];

export function isKidsRoute(slug: string): slug is KidsRouteSlug {
  return (KIDS_ROUTES as readonly string[]).includes(slug);
}
