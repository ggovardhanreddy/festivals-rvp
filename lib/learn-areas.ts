/**
 * The village's own practice areas, listed on the Learning Center.
 *
 * Lived in components/learn/LearnPage.tsx until the Learning Center took over
 * /learn/. Moved here rather than deleted: the areas are still real pages and
 * still linked, and a data table has no business inside a component that no
 * longer exists.
 */
export type LearnArea = {
  id: string;
  href: string;
  labelKey: string;
  descKey: string;
  icon: string;
  /** False means the section is named honestly as not built yet. */
  ready: boolean;
};

export const LEARN_AREAS: LearnArea[] = [
  { id: "kids", href: "/kids/", labelKey: "nav.kids", descKey: "learn.kids.desc", icon: "kids", ready: true },
  { id: "play", href: "/play/", labelKey: "nav.play", descKey: "learn.play.desc", icon: "play", ready: true },
  { id: "english", href: "/english/", labelKey: "nav.english", descKey: "learn.english.desc", icon: "english", ready: false },
  { id: "it", href: "/it/", labelKey: "nav.it", descKey: "learn.it.desc", icon: "it", ready: false },
  { id: "engineering", href: "/engineering/", labelKey: "nav.engineering", descKey: "learn.engineering.desc", icon: "engineering", ready: false },
  { id: "digital", href: "/digital-skills/", labelKey: "nav.digitalSkills", descKey: "learn.digital.desc", icon: "digital", ready: false },
];
