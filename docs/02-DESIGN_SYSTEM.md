# 02 — Design System

## Source of truth

| Asset | Role |
|---|---|
| `styles/tokens.css` | CSS custom properties (runtime styling) |
| `lib/design-tokens.ts` | TypeScript constants for JS/3D config |
| `app/globals.css` | Component styles consuming tokens |
| `components/ui/*` | Reusable primitives |

**Never hardcode** colors, radii, shadows, durations, or spacing in feature components when a token exists.

## Color

Light theme (default) uses forest greens, warm accent golds, and soft glass surfaces. Dark theme overrides live in `styles/tokens.css` under `.dark`.

Token groups:

- Backgrounds: `--color-bg`, `--color-bg-elevated`
- Ink / muted: `--color-ink`, `--color-muted`
- Brand accent: `--color-accent`, `--color-accent-soft`
- Forest / dawn accents: `--color-forest`, `--color-dawn`
- Semantic: `--color-danger`, `--color-success`
- Glass / line / focus: `--color-glass`, `--color-line`, `--color-focus-ring`

Legacy aliases (`--bg`, `--ink`, `--accent`, …) remain for gradual migration and must continue to point at the token layer.

## Typography

- Display: Playfair (`--font-display`)
- Body / UI: Poppins (`--font-body`)
- Weights: regular 400, medium 500, semibold 600
- Scale: `--text-xs` … `--text-hero`
- Eyebrow tracking: `--tracking-eyebrow`

Brand names must remain hero-level signals on branded surfaces. Headlines must not overpower the brand.

## Spacing & grid

Spacing scale `--space-1` … `--space-7`, page gutter `--page-gutter`, content max `--content-max`.

Breakpoints (mirrored in TS): 640 / 920 / 1100 / 1440.

## Radius, elevation, blur

- Radii: sm → pill
- Elevation: 1–3 shadow stacks
- Glass blur: `--blur-glass`, `--blur-strong`

Cards are interaction containers, not default layout decoration. Prefer open compositions on storytelling surfaces.

## Motion

Durations and easing live in tokens (`--motion-fast`, `--motion-base`, `--motion-slow`, cinematic curves). Framer Motion / GSAP / Lenis must respect `prefers-reduced-motion`.

See [04-ANIMATIONS.md](./04-ANIMATIONS.md).

## Component variants

UI primitives under `components/ui/`:

- Button, Card, Input, Dialog
- Empty / Error / Skeleton states
- Higher-level: Gallery cards, Hero, Navigation, Timeline, Search, Lightbox, media players, Footer, Toast patterns

Variants should be expressed via class names or CVA-style helpers, not copy-pasted CSS.

## Visual direction

Avoid generic AI-default looks (purple gradients, cream+terracotta broadsheet clichés, glow spam, emoji decoration). Atmosphere comes from village photography, cinematic hero lighting, restrained glass, and purposeful motion.
