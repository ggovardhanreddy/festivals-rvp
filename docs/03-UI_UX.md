# 03 — UI / UX

## Experience goal

Visitors should feel they have **entered Kondreddigaripalli** — not opened a CMS gallery. The first viewport is one cinematic composition: brand, one headline, one supporting sentence, CTA group, and dominant village visual/3D plane.

## Information architecture

| Route | Purpose |
|---|---|
| `/` | Cinematic entry + featured memories + map + timeline teaser |
| `/sankranthi/` etc. | Festival / bucket hubs |
| `/<year>/<bucket>/<album>/` | Album detail |
| `/timeline/` | Year chronology |
| `/search/` | Full-text + type filters |
| `/about/` | Village story + address + archive purpose |
| `/admin/` | CMS contributor guide (no uploads) |

## Homepage section order

1. Cinematic hero (full-bleed)
2. Private / heritage notice (compact)
3. Featured memories
4. Interactive village map
5. Recent memories
6. Timeline strip
7. Gallery teaser / memory wall / story as composed in `app/page.tsx`

Do not overload the first viewport with stats, schedules, or promo chips.

## Interaction principles

- One job per section
- Clear focus states (`--focus`)
- Keyboard access for nav, search, lightbox, media controls, map hotspots
- Magnetic / hover effects only when motion is allowed
- Empty, error, and skeleton states for incomplete data paths

## Content tone

Warm, intimate, village-first copy. Prefer “memory”, “home”, “festival”, “tradition” over “portfolio”, “collection”, or “upload”.

Always identify the village as **Kondreddigaripalli (Reddivaripalli)** with the full address available on About and Footer.

## Responsive behavior

- Desktop: cinematic 3D + wide grids
- Tablet: condensed hotspot chips, readable ledes
- Mobile: fallback-friendly hero, stacked sections, sticky nav, touch-sized controls

## Accessibility UX

- Semantic landmarks (`header`, `nav`, `main`, `footer`, `aside`)
- Descriptive alt text from media titles / filenames
- Visible focus rings
- Reduced motion path disables autoplay cinematic intensity
- High-contrast readable ink on glass

## Anti-patterns

- Card grids in the hero
- Floating promo stickers on media
- Dashboard-style first screens
- Hardcoded colors outside tokens
- Upload UIs pretending to be a backend CMS
