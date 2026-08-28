/**
 * Message keys, namespaced and typed.
 *
 * Namespaces keep the catalogue navigable as it grows past a few hundred
 * strings, and the union type means a typo is a build error rather than a
 * string that silently renders its own key.
 *
 * Legacy note: the existing header and footer call `t("/about/", "Our Heritage")`
 * — keyed by href. Those keys are preserved verbatim under `nav.*` aliases in
 * the catalogue so nothing has to change at once.
 */
export const NAMESPACES = [
  "nav", "common", "search", "a11y", "meta", "error", "empty", "lang", "form",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

/** A dotted key, e.g. "search.placeholder". Also accepts legacy href keys. */
export type MessageKey = string;
