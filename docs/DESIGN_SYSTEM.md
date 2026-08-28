# Design System

**Created:** Phase 0, 2026-08-28
**Supersedes:** `02-DESIGN_SYSTEM.md` (legacy, kept for reference)
**Status:** specification. **Nothing has been implemented.**

Brand direction approved by the owner: *"Our village, built for the future."* Natural,
warm, modern, premium, friendly, educational, cultural, accessible, trustworthy. Forest
and gold retained as the foundation; the execution modernised.

---

## 1. What already exists and stays

`styles/tokens.css` (162 lines) is a real token system and the foundation is sound:

- Colour, type scale, spacing, radii, three elevation levels, motion durations and easings, breakpoints
- Component tokens for buttons, cards, inputs
- A complete `.dark` override
- `lib/design-tokens.ts` mirrors the subset needed by JS and 3D config

**This file is kept.** The work is to extend it, not replace it.

### The problem sitting on top of it

| | |
|---|---|
| `app/globals.css` | **9,570 lines**, shipped on every route |
| `components/ui/` primitives | **7** — button, card, dialog, input, skeleton, empty-state, error-state |
| Compiled CSS | 172 KB raw / 33 KB gzipped, one file, every page |

Every new section currently adds global CSS rather than a component. That is the
opposite of what a platform with dozens of surfaces needs.

Helpfully, `globals.css` already carries **50+ section comments** (`/* Stats */`,
`/* Members chat */`, `/* Developments */`, `/* Telugu panchangam calendar */`…), so the
split is mechanical rather than interpretive.

---

## 2. Colour tokens

Extending the existing names rather than renaming them, so nothing that consumes
`--color-*` or the legacy `--bg`/`--ink`/`--accent` aliases breaks. New semantic names
are added as aliases.

### Light

| Token | Value | Role |
|---|---|---|
| `--brand-primary` | `#1f3d2e` | Forest — existing `--color-forest` |
| `--brand-secondary` | `#8f6a32` | Gold — existing `--color-accent` |
| `--brand-accent` | `#35617f` | Sky / natural blue — **new**, for information and links |
| `--background` | `#fafaf8` | Existing `--color-bg` |
| `--surface` | `#ffffff` | Existing `--color-bg-elevated` |
| `--surface-sunken` | `#f1f2ee` | **New** — for wells and inset panels |
| `--text` | `#1a1f1c` | Existing `--color-ink` |
| `--muted` | `#5c675f` | Existing `--color-muted` |
| `--border` | `rgba(26,31,28,.10)` | Existing `--color-line` |
| `--success` | `#2f6b45` | Existing |
| `--warning` | `#8a6212` | **New** |
| `--error` | `#9b3b32` | Existing `--color-danger` |

### Dark

The existing `.dark` block already defines the counterparts. New tokens need dark values
adding: `--brand-accent: #93bcd8`, `--surface-sunken: #131a15`, `--warning: #e0b45f`.

### Rules

- **Semantic colour is separate from brand colour.** Success/warning/error never double as an accent
- Kids World may add brighter colours, declared as `--kids-*` tokens scoped to that section, never overriding brand tokens
- No component declares a raw hex. If a colour is needed, it becomes a token first
- Contrast: 4.5:1 for body text, 3:1 for large text and UI boundaries, in **both** themes

### Explicitly avoided

Per the approved direction: excessive gradients, excessive glassmorphism, too many
shadows, too many colours. The current `--color-glass` / `--blur-glass` tokens stay for
existing surfaces but new components default to solid `--surface` with one elevation
step.

---

## 3. Typography

### Today

`Playfair Display` (display) + `Poppins` (body), loaded via `next/font/google` with
`subsets: ["latin"]` **only**. Neither contains Telugu glyphs, so Telugu text falls back
to whatever the device has — often poor or absent on low-end Android.

There is also a build-time dependency: `next/font/google` fetches from
`fonts.googleapis.com` during the build. If that host is unreachable, **the build
fails** (observed during the Phase 0 baseline — see `BASELINE.md` § 6).

### Target

| Role | Face | Notes |
|---|---|---|
| Display (English) | Playfair Display | Keep. Restrained use — headings and the wordmark |
| Body (English) | Poppins | Keep |
| Telugu, all roles | **Noto Sans Telugu** | SIL Open Font Licence, free |
| Numerals in data | `font-variant-numeric: tabular-nums` | Wherever digits align in columns |

### Telugu specifics

- Telugu needs **more line-height than Latin at the same size** — add `--leading-telugu` and apply via `:lang(te)`
- Telugu glyphs have taller ascenders and descenders; vertical rhythm must be checked at every heading level, not assumed
- Subset to the Telugu block plus Latin digits and punctuation. Do not ship the full face

### Loading strategy

**Self-host.** Download the WOFF2 files into `public/fonts/` and declare them with
`next/font/local`. This removes the build-time network dependency, removes the runtime
Google Fonts request, and improves privacy. It applies to all three faces, not only the
Telugu one.

Keep `display: swap`. Keep `adjustFontFallback` behaviour by declaring explicit
fallback metrics so the layout does not shift.

---

## 4. Spacing, radius, elevation, motion

All already defined in `tokens.css` and unchanged:

- Spacing `--space-1` … `--space-7` (4 px → 96 px), `--page-gutter`, `--content-max: 1180px`
- Radius `--radius-sm|md|lg|xl|pill`
- Elevation — three levels only. **Do not add a fourth**
- Motion `--motion-fast|base|slow|cinematic` with `--ease-out` / `--ease-soft`

### One inconsistency to fix

`lib/design-tokens.ts` and `styles/tokens.css` disagree on radii:

| | CSS | TS |
|---|---|---|
| `md` | 14 px | 18 px |
| `lg` | 16 px | 22 px |
| `xl` | 20 px | 28 px |

The CSS is authoritative — it is what renders. Sync the TS mirror.

---

## 5. Stylesheet structure

Target layout. `globals.css` becomes a short manifest of imports **in the original
source order**, so the cascade is unchanged.

```
styles/
├── tokens.css          # existing — colour, type, space, radius, motion, breakpoints
├── base.css            # reset, element defaults, typography base
├── layout.css          # page, section, grid, container
├── components.css      # shared component classes
├── motion.css          # reveal, transitions, reduced-motion
└── pages/
    ├── home.css  nav.css  gallery.css  members.css  events.css
    ├── heritage.css  developments.css  chat.css  admin.css
    ├── legal.css  calendar.css
    └── … carved along the existing section comments
```

### The rule that makes this safe

**The split lands as a pure file move with zero edits, and the commit is only accepted
if the compiled CSS output is byte-identical to the previous build.** Any intentional
change goes in a separate, later commit.

This matters because `globals.css` has accumulated specificity fights — it contains
comments like *"Failsafe: never leave roster / hero invisible if motion styles stick"*.
Reordering rules silently breaks pages.

---

## 6. Component library

Seven primitives today. The platform needs roughly thirty. **Nothing existing is
rewritten** — the seven gain variants.

### Existing — extend

`Button` · `Card` · `Dialog` · `Input` · `Skeleton` · `EmptyState` · `ErrorState`

### New primitives

`Badge` · `Chip` · `Tabs` · `Accordion` · `Field` (label + input + error + hint) ·
`Select` · `SectionHead` · `IconButton` · `Stat` · `Tile` · `Alert` · `ProgressBar` ·
`Toast` · `Drawer` · `Carousel`

### New domain components

`Logo` *(exists — needs the variant system in § 7)* · `Header` · `MobileHeader` ·
`DesktopNavigation` · `MobileBottomNavigation` · `SearchBar` · `VoiceButton` ·
`LanguageSwitcher` · `Hero` · `CategoryCard` · `FeatureCard` · `CourseCard` ·
`GameCard` · `VideoCard` · `WeatherCard` · `AgricultureCard` · `TempleCard` ·
`CommunityCard` · `CareerCard` · `Leaderboard`

### Card discipline

Nine card types is a lot. They must share one base — `Card` — and differ only in slots
and accent. A `CourseCard` and a `GameCard` that diverge in padding, radius or shadow is
a bug, not a design decision.

### Rules

- Every component takes its colours from tokens
- Every interactive element has a visible `:focus-visible` state
- Every interactive element has a minimum 44 × 44 px touch target
- No component duplicates another. Before adding one, check the list
- Each component renders correctly in light and dark, and in English and Telugu

---

## 7. Logo system

### Current state

`components/Logo.tsx` (76 lines) supports variants and is generated by
`scripts/generate-logo-system.ts`. Assets live in `public/logo/` (4.3 MB) and
`public/brand/` (7.6 MB). Icons are wired through `app/layout.tsx` metadata and
`manifest.webmanifest`.

### Required variants

| Variant | Use | Format |
|---|---|---|
| **Primary — horizontal** | `[symbol] REDDIVARIPALLI` — desktop header, footer | SVG |
| **Compact** | Mobile header | SVG |
| **Symbol only** | App icon, PWA, favicon, avatar, small buttons | SVG + PNG 192/512 |
| **Favicon** | Browser tab | SVG + ICO fallback |
| **Apple touch icon** | iOS home screen | PNG 180 |
| **Social banner** | Open Graph | PNG 1200×630 |

### Symbol brief

One recognisable mark combining village, nature, community, learning, heritage and
future — **without drawing all six**. Candidate directions: a tree whose canopy reads as
a settlement; a rising sun over a field line; a gopuram silhouette that also reads as an
open book.

Hard constraints:

- Legible at **16 px**. This is the test that eliminates most concepts
- Works on light and dark backgrounds without a second version
- No gradient, no more than two colours in the mark itself
- Vector, small file, sharp on retina
- One logo across website, mobile, PWA, future Android and iOS, favicon, social preview, loading screen and footer

Kids World may surround the logo with playful illustration but **may not alter the mark**.

### Tagline

`Our Village • Our People • Our Learning • Our Future`

Lockup rules and clear-space to be defined during the design phase.

---

## 8. Dark mode

Already working via `next-themes` (`rvp-theme`), with a pre-paint inline script that
prevents the flash of wrong theme, plus `AutoDayNightSync`. Light / dark / system.

**Keep as is.** The additions are: dark values for the new tokens, and a contrast check
on Telugu text in dark mode, which is where poor font fallbacks are most visible.

---

## 9. Motion

Existing tokens are correct. What changes is discipline.

**Use:** fade, slide, hover feedback, progress, focus transitions, micro-interactions on
press.

**Avoid:** constant ambient movement, parallax on every section, long entrance
sequences, anything that delays reading.

The site should feel premium, not like a game — except inside Games and Kids, where
playfulness is the point.

### Reduced motion

`globals.css` has **ten** `@media (prefers-reduced-motion: reduce)` blocks, which covers
CSS well. The gap is JavaScript: Vanta, GSAP, Lenis and the fireworks components are not
consistently gated on the preference. `lib/mobile-shell.ts` already provides
`useAllowHeavyEffects()` — extend it to also return false on `prefers-reduced-motion`
and on `navigator.connection.saveData`.

---

## 10. Accessibility baseline

Better than most projects this size. Measured:

| Present | Count |
|---|---|
| `aria-label` | 86 |
| `aria-labelledby` | 12 |
| `aria-live` | 4 |
| `alt` attributes | 51 |
| `prefers-reduced-motion` blocks | 10 |
| Skip link, `.sr-only`, `:focus-visible` rules | yes |

Gaps this system must close:

- No user-facing text-size control
- No contrast option
- No Telugu typography (§ 3)
- Motion reduction does not reach the JS effects (§ 9)
- One known defect: `components/events/TeluguCalendar.tsx:174` — `aria-pressed` on a
  `gridcell` role, flagged by ESLint

**Easy Mode (Phase 5) is a design constraint on this whole system, not a page added at
the end.** Its two foundations — a preferences store and a `--text-scale` multiplier —
belong in the token layer from the start.

---

## 11. Breakpoints

Existing tokens: `--bp-sm: 640px`, `--bp-md: 920px`, `--bp-lg: 1100px`, `--bp-xl: 1440px`.

Design and test at: **320 · 360 · 375 · 390 · 414 · 768 · 1024 · 1280+**.

360 px is the one that matters most for this audience and is the one most often skipped.

Layout uses flex/grid with `gap`, never per-element margins that collapse. Wide content —
tables, code, diagrams, carousels — scrolls inside its own container so the page body
never scrolls sideways.
