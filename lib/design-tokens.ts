/**
 * TypeScript mirror of styles/tokens.css for shared constants in TS modules.
 * Prefer CSS variables in components; use this for JS/3D config only.
 */
export const tokens = {
  color: {
    accent: "#8f6a32",
    accentSoft: "#c49855",
    forest: "#1f3d2e",
    dawn: "#f0d7a0",
    ink: "#13241b",
    bg: "#eef3ef",
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
    sm: 12,
    md: 18,
    lg: 22,
    xl: 28,
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
