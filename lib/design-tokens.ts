/**
 * TypeScript mirror of styles/tokens.css for shared constants in TS modules.
 * Prefer CSS variables in components; use this for JS/3D config only.
 */
export const tokens = {
  /* Mirrors the dark (:root) palette in styles/tokens.css, which is the
     source of truth. Only JS/3D config should read these -- components use
     the CSS variables so they follow the active theme. */
  color: {
    accent: "#a78bfa",
    accentSoft: "#c4b5fd",
    violet: "#8b5cf6",
    indigo: "#4f46e5",
    magenta: "#c026d3",
    forest: "#6d28d9",
    dawn: "#e9d5ff",
    ink: "#eceafc",
    bg: "#0a0a18",
    bgElevated: "#12122a",
  },
  motion: {
    fast: 0.16,
    base: 0.28,
    slow: 0.65,
    cinematic: 0.9,
    easeOut: [0.22, 1, 0.36, 1] as const,
  },
  breakpoints: {
    sm: 640,
    md: 920,
    lg: 1100,
    xl: 1440,
  },
  space: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 40,
    6: 64,
  },
  radius: {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 34,
    pill: 999,
  },
  icon: {
    sm: 16,
    md: 22,
    lg: 42,
  },
  button: {
    variants: ["default", "ghost", "magnetic"] as const,
  },
  card: {
    variants: ["glass", "strong", "plain"] as const,
  },
  input: {
    variants: ["default", "search"] as const,
  },
} as const;

export type DesignTokens = typeof tokens;
