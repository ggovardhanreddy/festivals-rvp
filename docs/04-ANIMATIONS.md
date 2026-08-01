# 04 — Animations

## Philosophy

Motion creates **presence and hierarchy**, not noise. Every animation should clarify entry, focus, or transition into a memory.

## Systems in use

| System | Use |
|---|---|
| Framer Motion | Page reveals, hero copy, panels, presence |
| GSAP | Optional timeline-driven sequences |
| Lenis | Smooth scrolling on capable devices |
| CSS transitions | Buttons, nav, glass hover, skeletons |
| R3F / Drei | Camera fly-tos, lighting, hotspot glow |

## Tokens

Use design-token durations and easings:

- Fast UI feedback
- Base page transitions
- Slow atmospheric fades
- Cinematic hero camera moves

Do not invent one-off durations in components when tokens suffice.

## Progressive enhancement

| Context | Behavior |
|---|---|
| High-end + motion OK | Full cinematic intro, 3D, rich particles/lights |
| Low-power device | Reduced particle count, simpler lighting, faster poses |
| `prefers-reduced-motion` | Skip intro phases, static/fallback hero, no parallax spam |
| No WebGL | Image fallback hero (`og-banner` atmosphere) |

Detection helpers live in `lib/client.ts` (`useLowPowerDevice`, `useIsClient`).

## Hero sequence (default)

1. Black / quiet
2. Logo reveal
3. Light sweep
4. Camera fly into village
5. Sunrise / world alive
6. Ready UI (copy + hotspots)

Reduced-motion users jump to the ready overview.

## Gallery / UI motion

- Staggered card reveals via `Reveal`
- Lightbox enter/exit opacity + scale (subtle)
- Skeleton shimmer disabled under reduced motion
- Hover elevation only on pointer-fine devices when practical

## Accessibility rules

- Honor `prefers-reduced-motion: reduce` globally in CSS
- Never convey essential information by motion alone
- Keep focus visible during animated transitions
- Avoid infinite decorative loops except subtle ambient cases that disable under reduced motion

## Performance budgets

- Prefer transform/opacity over layout thrash
- Cap concurrent 3D effects on low power
- Lazy-load `VillageCanvas` with `next/dynamic` and `ssr: false`
