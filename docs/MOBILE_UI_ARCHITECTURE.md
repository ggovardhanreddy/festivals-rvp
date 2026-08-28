# Mobile UI Architecture

**Created:** Phase 0, 2026-08-28
**Status:** specification. **Nothing has been implemented.**

> The mobile website is not the desktop website shrunk. It is designed separately, and
> for this audience it is the **primary** experience.

---

## 1. Why mobile is primary here

The audience is a village in YSR Kadapa on Android phones over mobile data. Desktop is
the secondary case. Every decision below assumes a 360 px screen on a mid-range Android
over a slow connection, and works up from there.

### What the current mobile experience costs

Measured on the live build:

| | Raw | Gzipped |
|---|---|---|
| Homepage HTML | 869 KB | 96 KB |
| Homepage JS, 13 chunks | 988 KB | 316 KB |
| CSS, every route | 172 KB | 33 KB |
| **Total first load** | **~2 MB** | **~445 KB** |

Gzip flatters this. The 869 KB of HTML still has to be parsed, and it carries **507
media objects to render 24**. On a low-end phone that parse and hydration is the delay
the user feels, and compression does not help with it.

### What already works on mobile

Do not lose these:

- `rvp-mobile` class set by the pre-paint boot script in `app/layout.tsx`
- `useAllowHeavyEffects()` in `lib/mobile-shell.ts` — Vanta and heavy effects off on mobile
- Drawer navigation rendered through `createPortal` so it escapes stacking contexts
- Hard navigation for `/members/` — soft nav rendered blank in the installed PWA
- Scroll-lock recovery on `pageshow`, `popstate`, `visibilitychange`
- No auto-focus on coarse pointers — focus cancels taps on iOS
- Installable PWA with offline fallback

Each is listed in `PRESERVED_FEATURES.md` § 3 with the bug it fixes.

---

## 2. Mobile shell

```
┌─────────────────────────────────┐
│ ☰   [ Reddivaripalli ]     తె/EN │  header, ~56px, sticky
├─────────────────────────────────┤
│                                 │
│           page content          │  scrolls
│                                 │
├─────────────────────────────────┤
│  🏠      📚     🎮     🔎     ☰  │  bottom nav, ~56px + safe area
│ Home   Learn  Play  Search  More│  fixed
└─────────────────────────────────┘
```

### Header — compact, three slots

| Slot | Content |
|---|---|
| Left | Menu trigger |
| Centre | Compact logo (symbol + wordmark) |
| Right | Language toggle `తె / EN` |

Height about 56 px. Sticky, not hiding on scroll — a disappearing header is disorienting
for less confident users. The theme toggle, notification bell and admin controls move
into **More**; the header stays at three items.

### Bottom navigation — exactly five

| Item | Icon | Route |
|---|---|---|
| Home | 🏠 | `/` |
| Learn | 📚 | `/learn/` |
| Play | 🎮 | `/play/` |
| Search | 🔎 | `/search/` |
| More | ☰ | opens the More sheet |

Requirements:

- `position: fixed`, bottom
- `padding-bottom: env(safe-area-inset-bottom)` — iPhone home indicator
- `<body>` gets matching bottom padding so content is never covered
- Minimum 48 × 48 px targets, 56 px preferred
- Clear active state — colour **and** weight, not colour alone
- `<nav aria-label="Primary">` with `aria-current="page"`
- Hidden inside a running game so it cannot be tapped by accident

**Five, not seven to ten.** The overflow is what More exists for.

### More sheet

A bottom sheet, not a new page — it should feel instant.

`Agriculture` · `Kids` · `English` · `Engineering` · `IT` · `Careers` · `Temples` ·
`Community` · `Weather` · `Government` · `Digital Skills` — then a divider — `Settings` ·
`Language` · `Theme` · `About` · `Contact`.

Reuses the existing drawer's portal, focus and scroll-lock behaviour verbatim.

---

## 3. Mobile homepage

Order is the design. The first screen must answer *what is this* and *what can I do*
without scrolling.

```
1  Compact hero        Reddivaripalli · tagline · nothing else
2  Search              large field + voice, immediately below the fold line
3  Popular searches    horizontal chips
4  What do you want to do?   2-column grid, 6 cards
5  Today's Reddivaripalli    weather + next event + daily challenge
6  Daily Challenge     one prominent card
7  Games               horizontal carousel
8  Continue Learning   only if local progress exists
9  Featured Learning   horizontal carousel
10 Agriculture         one card
11 Ask Reddivaripalli  one card (Phase 6; hidden until then)
12 Explore             compact 2-column category grid
13 Temples · Community · Careers   featured card + "View all" each
14 Footer              compact
```

### 1 · Hero — deliberately short

**No more than ~180 px.** No full-bleed image, no Vanta, no animation. Wordmark, one
tagline line, done. The current desktop hero fills the screen with a logo and a postal
address; on mobile that is a wasted first impression.

### 2 · Search — the primary action

```
┌───────────────────────────────────┐
│ 🔎  What are you looking for?  🎤 │   min-height 52px
└───────────────────────────────────┘
```

- Font size **≥ 16 px** or iOS zooms the page on focus
- Voice button hidden when `webkitSpeechRecognition` is unavailable — never a dead control
- Tapping opens a full-screen search overlay, not an inline dropdown

### 3 · Popular searches

Horizontally scrollable chips, real links: `Agriculture` `English` `Java` `Games`
`Weather` `Temples`. Overflow scroll with `scroll-snap`, and a fade mask on the right so
it is visibly scrollable.

**A chip must never lead to an empty page.** Until Phase 3 ships Java content, either
the chip is absent or it leads to a page that honestly says the section is coming. No
placeholder courses.

### 4 · What do you want to do?

2-column grid, 6 cards, **max ~96 px tall each** — all six visible in roughly one screen.

| | |
|---|---|
| 👧 Kids — *Fun & Learn* | 🎓 Students — *Study & Grow* |
| 🌾 Farmers — *Farming Help* | 💼 Careers — *Jobs & Skills* |
| 👴 Seniors — *Easy Mode* | 🌐 Explore — *Discover More* |

Icon, short title, three-or-four-word description. No account prompt anywhere near them.

### 5 · Today's Reddivaripalli

One card, three facts: weather, next event, daily challenge. **Every field shows an
empty state when data is unavailable** — never a placeholder number. If weather cannot
be fetched, the card says so and offers a retry.

### 7 / 9 · Carousels

Games and Featured Learning scroll horizontally with `scroll-snap-type: x mandatory`.
Card width around 150 px so a second card is always partly visible — that is what tells
the user it scrolls. Keyboard-reachable, and each card is a real link.

### 13 · Temples, Community, Careers

One featured card plus **View all**, not a full section each. This is what keeps the
page from becoming an endless scroll.

---

## 4. Kids World on mobile

Separate visual treatment, same shell.

- Brighter `--kids-*` palette, larger type, rounder cards
- Same logo — playful illustration may surround it, never replace it
- Bottom nav may swap Learn/Play for age-appropriate destinations
- **Nickname only.** No email, phone, address, precise location or school
- No chat, no open recommendation feed, no external video suggestions
- Progress in `localStorage`

---

## 5. Performance rules for mobile

Derived from the measured baseline; these are the rules, not aspirations.

| Rule | Why |
|---|---|
| Serialise only what renders | The homepage currently ships 507 media objects to render 24 |
| Route-level CSS | 172 KB on every route; Kids should not download the admin dashboard's styles |
| No Vanta, GSAP, Three.js or Lenis on mobile | Already partly enforced — extend to `prefers-reduced-motion` and Save-Data |
| Images lazy below the fold, `width`/`height` always set | Prevents layout shift on slow loads |
| Carousels render ~6 items, not the full list | |
| Fonts self-hosted, subset, `display: swap` | Removes the Google Fonts build dependency and a runtime request |
| A CI budget that fails the build | Otherwise the platform gets heavier one section at a time |

### Targets

| | Now | Target |
|---|---|---|
| Homepage HTML raw | 869 KB | < 150 KB |
| Homepage JS gzipped | 316 KB | < 220 KB |
| Per-route CSS raw | 172 KB | < 60 KB |

---

## 6. Touch and accessibility

- Minimum target 44 × 44 px, 48 px on primary navigation
- At least 8 px between adjacent targets
- Inputs ≥ 16 px font size — smaller triggers iOS zoom
- `env(safe-area-inset-*)` on fixed elements, top and bottom
- Visible `:focus-visible` on everything interactive, including inside carousels
- Screen reader: bottom nav is `<nav aria-label="Primary">` with `aria-current`
- Text scaling to 150% must not clip any card — the reason `--text-scale` scales the root, not each step
- Telugu at every breakpoint, with its own line-height

---

## 7. Breakpoints

| Width | Device | Layout |
|---|---|---|
| 320 | Small Android | Single column, tightest gutters, 2-col grid still holds |
| 360 | **Most common in this audience** | Reference width. Design here first |
| 375 / 390 | iPhone | Same as 360 with more breathing room |
| 414 | Large phone | Same |
| 768 | Tablet | 3-column grids; bottom nav becomes a sidebar or reverts to the header |
| 1024 | Small laptop | Desktop header, no bottom nav |
| 1280+ | Desktop | Full layout, `--content-max: 1180px` |

**Design at 360 first and let it grow.** Designing at 1280 and shrinking is how the
current homepage ended up with a full-screen hero on a phone.

---

## 8. Desktop, for contrast

Not a separate codebase — the same components at wider breakpoints.

- Header: logo · `Home Explore Learn Play Agriculture Community Temples Careers More` · language · search · theme
- No bottom navigation
- Hero taller, with the search box centred
- "What do you want to do?" becomes 3 × 2 or 6 × 1
- Carousels become grids where there is room
- `--content-max: 1180px` throughout

---

## 9. What must not happen

- The bottom bar covering content — body padding must match its height
- A dead voice button on devices without speech recognition
- A carousel that cannot be reached by keyboard
- A popular-search chip leading to an empty page
- A fabricated weather value, event or course used as filler
- A hero that fills the first screen on a phone
- Kids World collecting anything beyond a nickname
