# Client Component Audit

**Date:** 2026-08-28
**Measured:** 142 `.tsx` files under `components/` and `app/` — 139 in `components/`, 3 in `app/`
**Marked `"use client"`:** 122 (86%)
**Status:** analysis only. No component has been changed.

---

## 1. Why this matters

A static export still benefits from server components: they run at build time and their
code never ships to the browser. At 86% client, almost nothing in this application takes
that benefit. Each `"use client"` file and everything it imports lands in the bundle
that a phone must download, parse and hydrate — which is the direct cause of the
988 KB / 316 KB gzipped homepage JavaScript recorded in `BASELINE.md`.

---

## 2. Method

Every file containing `"use client"` was scanned for the APIs that actually require it:

`useState` · `useReducer` · `useEffect` · `useLayoutEffect` · `onClick`/`onChange`/`onSubmit`/`onInput` ·
`framer-motion`/`gsap`/`useReducedMotion` · `usePathname`/`useRouter`/`useSearchParams` ·
`localStorage`/`sessionStorage`/`navigator.`/`window.`/`document.` · `createContext`/`useContext`

A file matching none of these has no client-only reason to exist.

---

## 3. Results

| Bucket | Count | Convertible? |
|---|---|---|
| **No client-only API at all** | **26** | **Yes — directly** |
| Client only because of `framer-motion` | **11** | Yes, by replacing motion with CSS |
| Genuine client components | 85 | No |
| **Total `"use client"`** | **122** | **37 addressable (30%)** |

### Reason distribution across the 122

| Reasons present | Files |
|---|---|
| *(none)* | 26 |
| motion only | 11 |
| state + effect + handler + browser | 10 |
| state + effect + motion + browser | 8 |
| state + effect + handler + motion + browser | 6 |
| state + effect + handler | 6 |
| effect + motion + browser | 6 |
| state + handler | 5 |
| handler only | 5 |
| state + effect + browser + context | 3 |
| state + effect | 3 |
| effect + motion | 3 |
| *(remaining combinations, ≤2 files each)* | 30 |

---

## 4. Group A — 26 with no client-only API

Directly convertible: delete the `"use client"` line and verify.

| File | Lines | Note |
|---|---|---|
| `components/Logo.tsx` | 76 | Used in header, footer, hero, loading screen — high leverage |
| `components/LogoWatermark.tsx` | 15 | Mounted in the root layout on **every** page |
| `components/VillageMap.tsx` | 8 | |
| `components/YouthPortrait.tsx` | 11 | |
| `components/analytics/CloudflareWebAnalytics.tsx` | 22 | Renders a script tag |
| `components/analytics/PlausibleScript.tsx` | 22 | Renders a script tag |
| `components/calendar/LiveCalendarBridge.tsx` | 57 | **Untracked** — from the working tree |
| `components/events/EventsCalendar.tsx` | 128 | |
| `components/experience/CinematicHero.tsx` | 3 | Stub |
| `components/experience/NightVillageBackdrop.tsx` | 53 | |
| `components/experience/village/FlyCameraRig.tsx` | 47 | Inside the R3F tree — see caveat |
| `components/experience/village/RealVillageTerrain.tsx` | 98 | Inside the R3F tree — see caveat |
| `components/experience/village/VillageCanvas.tsx` | 131 | Inside the R3F tree — see caveat |
| `components/festivals/InstagramFollow.tsx` | 56 | |
| `components/home/CultureTraditions.tsx` | 46 | |
| `components/home/FestivalCalendar.tsx` | 107 | Homepage |
| `components/home/StatsOverview.tsx` | 52 | Homepage |
| `components/home/UpcomingEventsStrip.tsx` | 70 | Homepage |
| `components/home/VantaBirds.tsx` | 20 | Wrapper only |
| `components/location/ContactLocationNote.tsx` | 44 | |
| `components/location/LocationBadge.tsx` | 23 | |
| `components/location/LocationHomeNote.tsx` | 27 | Homepage |
| `components/media/DocumentCard.tsx` | 62 | |
| `components/members/MembersPage.tsx` | 23 | Wrapper only |
| `components/settings/SettingsChrome.tsx` | 16 | |
| `components/vanta/PageVanta.tsx` | 27 | Wrapper only |

### Caveats before converting

- **The three `experience/village/*` files sit inside a React Three Fiber tree.** R3F
  requires a client boundary at the `<Canvas>`. `VillageCanvas` is already loaded
  through `next/dynamic({ ssr: false })`, so it is off the critical path regardless.
  Leave these three alone — the win is zero and the breakage risk is real.
- **The two analytics components** render script tags. Verify the script still executes
  once and only once as a server component before merging.
- **Wrapper components** (`VantaBirds`, `MembersPage`, `PageVanta`) may be client
  boundaries on purpose, to contain a dynamic import. Check each.

**Realistically convertible from Group A: about 20 files**, of which five are on the
homepage — `FestivalCalendar`, `StatsOverview`, `UpcomingEventsStrip`,
`LocationHomeNote`, and `LogoWatermark` via the layout.

---

## 5. Group B — 11 client only because of motion

| File | Lines |
|---|---|
| `components/AlbumCard.tsx` | 84 |
| `components/MemoryHero.tsx` | 205 |
| `components/MemoryWall.tsx` | 79 |
| `components/Particles.tsx` | 47 |
| `components/Reveal.tsx` | 34 |
| `components/TimelineStrip.tsx` | 43 |
| `components/VillageDepthMap.tsx` | 95 |
| `components/YearGrid.tsx` | 39 |
| `components/archive/AnnualArchivePage.tsx` | 94 |
| `components/home/FloatingTileField.tsx` | 103 |
| `components/home/HistoryTimeline.tsx` | 74 |

`components/Reveal.tsx` deserves separate attention: it is 34 lines, it is a
scroll-reveal wrapper, and it is used **throughout** the site. Replacing it with a CSS
`@keyframes` fade driven by an `IntersectionObserver` — or with the native
`animation-timeline: view()` where supported, falling back to no animation — would
remove a client boundary from a large number of pages at once.

`MemoryHero.tsx` at 205 lines appears on most non-home pages and is the largest single
item in this group.

---

## 6. Group C — 85 genuinely client

No action. These legitimately need the browser:

- Every provider — `Providers`, `LanguageProvider`, `MemberAuthProvider`, `LocationProvider`, `MusicProvider`, `SuperAdminProvider`, `NotificationProvider`, `AudioDeckProvider`
- Every form — contact, suggestions, lost & found, login, admin
- `SiteHeader` (drawer, portal, scroll lock, router), `SiteFooter`
- `Gallery`, `SearchClient`, `MembersChat`, `AdminClient`
- All PWA, notification, music and audio components
- Anything reading `localStorage` or `navigator`

---

## 7. Expected benefit

Converting Groups A and B removes roughly 1,400 lines of component code plus their
imports from the client bundle. The bigger win is indirect: `framer-motion` currently
appears in **37 files**. Every conversion that drops a motion import shrinks what has to
be shipped and hydrated before the page is interactive.

This is not the largest performance item — that remains the 507 media objects
serialised into the homepage (`BASELINE.md` § 7). It is complementary, lower risk, and
it can be done file by file.

**No target number is claimed here.** The measurement should be taken after conversion,
against the budget script proposed for Phase 1.

---

## 8. Recommended sequence

Not Phase 0 work. Proposed for Phase 1, after the test harness exists:

1. `LogoWatermark` and `Logo` — they are in the root layout, so they affect every route
2. The four homepage components in Group A
3. `Reveal` — the highest-leverage item in Group B
4. The rest of Group A, one file per commit, verified by screenshot diff
5. The rest of Group B, replacing motion with CSS
6. Re-measure

Each conversion is independently revertable. Any file whose screenshot changes gets
reverted rather than debugged — the point is to remove weight, not to redesign.
