# Preserved Features — The Preservation Contract

**Created:** Phase 0, 2026-08-28
**Purpose:** This is the list every later phase is checked against. If a change breaks
anything below, the change is wrong — not the list.

Nothing here may be removed, degraded or silently altered without an explicit decision
recorded in this file.

---

## 1. Routes — all 68 must keep resolving

Produced by `generateStaticParams()` in `app/[...slug]/page.tsx`, with
`dynamicParams = false` and `trailingSlash: true`.

| Group | Routes | Access |
|---|---|---|
| Home | `/` | public |
| Village & heritage | `/about/` `/heritage/` `/timeline/` `/years/` `/years/<year>/` | public |
| Festival chapters | `/sankranthi/` `/vinayaka-chavithi/` `/mathamma-jathara/` `/devapatlamma-jathara/` `/sri-rama-navami/` `/varalakshmi-vratam/` `/ugadi/` `/deepavali/` `/dasara/` — each also `/<year>/` | public |
| Media | `/gallery/` `/rvp-birthdays/` `/rvp-birthdays/<year>/<album>/` | public |
| Community | `/members/` `/events/` `/directory/` `/developments/` `/suggestions/` `/lost-found/` `/documents/` `/contact/` | public |
| Utility | `/search/` `/settings/` `/offline/` `/privacy/` `/terms/` | public |
| Gated | `/fun-trips/` `/fun-trips/<year>/` `/chat/` `/login/` | member |
| Admin | `/admin/` | super admin |

Plus the redirects in `public/_redirects`: `/blood-donors*` → `/` (a removed feature
whose bookmarks are still honoured — do not drop these).

**Full old→new mapping for the Telugu work is in `ROUTE_MIGRATION.md`.**

---

## 2. Features that work today

### Archive and media
- Year × festival archive covering **2010–2026**, 17 years × 11 buckets, driven entirely by folder structure under `content/`
- 21 albums, 775 media items (699 images, 76 videos)
- Album viewer with AVIF/WebP variants, blur placeholders, poster frames
- Perceptual-hash duplicate detection (`lib/phash.ts`)
- R2-backed delivery with `media:strip-local` keeping the Pages artefact under the 25 MiB file limit
- Google Drive overflow when R2 approaches ~90% (`functions/_lib/gdrive.ts`)

### Community
- Members: Legacy Circle / Core / NextGen, photos, designations, homepage counts
- Village directory: doctors, teachers, government employees
- Events and birthdays hub with tabs
- Developments, suggestions, lost & found, panchayat documents — each an R2-backed collection, with an approval queue for the two user-submitted ones
- Heritage archive and the 28 KB village heritage record
- Contact page with a working form

### Telugu panchangam
- Tithi, Nakshatra, Rahu Kalam, Yama Gandam
- `lib/telugu-panchangam.ts`, `lib/telugu-calendar-labels.ts`, `panchang-ts`
- **This is the one genuinely bilingual feature in the product.** Do not regress it.

### Search
- Pre-built index over media, albums, members, directory, events, developments, documents and heritage
- Filters: kind, year, festival/collection, media type

### Fun Fest (private)
- Member login, 7-day HMAC session
- Edge gating in `functions/_middleware.ts`
- Signed R2 URLs via `/api/media/sign`

### Super Admin
- Single-account login, PBKDF2, KV rate limit (5 failures / 15 min)
- Members manager, analytics panel, audit log
- In-page **Edit Mode** toggle
- Media upload with R2 reindex

### PWA
- Manifest with four shortcuts; installable
- Custom service worker with per-route-class caching
- Silent update on new deploys (no user prompt) — *working-tree change, see `WORKING_TREE_AUDIT.md` A4*
- Offline fallback page

### SEO
- Seven JSON-LD blocks: WebSite, GovernmentOrganization, Place, BreadcrumbList, ImageObject, FAQPage, Event
- Generated sitemap and RSS feed
- IndexNow submission after each deploy
- Canonical URLs, Open Graph, Twitter cards
- Geo meta tags for the village coordinates

### Security headers
- HSTS with preload, CSP, `nosniff`, `X-Frame-Options`, `Permissions-Policy` scoping geolocation to self and disabling microphone and camera

### Theming
- Light / dark / system via `next-themes`, `rvp-theme` storage key
- Pre-paint inline script prevents the flash of wrong theme
- Automatic day/night sync (`AutoDayNightSync`)

---

## 3. Hard-won fixes that must be carried verbatim

These are not features. They are bugs that already reached real users and were fixed.
Any refactor that touches these files must **move** the code, not reimplement it.

| Behaviour | Location | Why it exists |
|---|---|---|
| Hard navigation to `/members/` | `SiteHeader.tsx` `onDrawerNav`, `HomeBelowFold.tsx` `onMobileHardNav` | Soft nav rendered a blank page in the installed PWA. Commit `e8cf378` |
| Scroll-lock recovery | `SiteHeader.tsx` — `pageshow`, `popstate`, `visibilitychange` listeners | Drawer left `body` scroll-locked after bfcache restore |
| Drawer rendered via `createPortal` | `SiteHeader.tsx` | Page stacking contexts made the hamburger untappable |
| No auto-focus on coarse pointers | `SiteHeader.tsx` open effect | Focus cancels taps on iOS |
| Member photo edge proxy | `functions/_middleware.ts` | Old service workers cached redirects; must be a same-origin 200 |
| PWA update debounce | `lib/pwa-update.ts`, 12 s lock | SW `controllerchange` + version poll caused a reload loop |
| Vanta gated off mobile | `lib/mobile-shell.ts` `useAllowHeavyEffects()` | Performance on low-end Android |
| `#overview` anchor contract | `HomeHero.tsx` links to it; `AboutTeaser.tsx` provides `id="overview"` | Hero's primary CTA breaks silently if reordered |
| Fun Fest login interception | `SiteHeader.tsx` `onFunFestNav` | Opens the dialog instead of bouncing through `/login/` |
| CSS failsafes | `app/globals.css` — "Failsafe: never leave roster / hero invisible if motion styles stick" | Motion styles occasionally stuck and hid content |
| 100k PBKDF2 iterations | `functions/api/admin/[[route]].ts` comment | 210k exceeds the Workers CPU limit and returns error 1101 |
| Canonical host redirect | `functions/_middleware.ts` | `pages.dev` → `www.reddivaripalli.com`, 301 |
| Google verification served before Pages 308 | `functions/_middleware.ts` | Pages strips `.html` and breaks Search Console verification |

---

## 4. Product invariants

Not code — commitments. Every phase is checked against these.

| Invariant | Current state |
|---|---|
| No mandatory signup | Held. No registration exists anywhere; all public pages readable without an account |
| Free | Held. No payment, no paywall, no premium tier |
| No automatic agriculture reminders | Held — no agriculture feature exists yet |
| No fabricated content | Held. Every rendered item traces to `content/`, R2 or a generated index |
| Village identity | `Kondreddigaripalli` / `Reddivaripalli`, PIN 516215, Sambepalle Mandal, YSR Kadapa (Annamayya). Asserted by `scripts/smoke-test.ts` |
| Aggregate-only analytics | Plausible and Cloudflare Web Analytics; no per-user profiles, no cookies |
| Fun Fest stays private | `robots.txt` disallow + edge gate + signed media |

---

## 5. Content that must never be deleted

| Path | Contents |
|---|---|
| `content/2010/` … `content/2026/` | 17 years of village media |
| `content/data/*.json` | 13 editorial seeds, 53 KB |
| `content/data/village-heritage.json` | 28 KB village history, founding ~1850, temples, festivals, memorial, farmers |
| `public/images/`, `public/thumbs/`, `public/videos/`, `public/audio/` | Optimised media |
| `public/brand/`, `public/logo/`, `public/festivals/` | Brand and festival hero assets |
| R2 bucket `reddivaripalli` | Everything above, plus `community/*` |
| 168 untracked 2026 Jathara files | See `WORKING_TREE_AUDIT.md` § 4 |

---

## 6. How this contract is enforced

Proposed for Phase 1 M1, not yet in place:

1. A screenshot baseline of all 68 routes at 360 / 768 / 1280
2. A render test per route asserting a 200 and a visible `h1`
3. An axe scan per route
4. A test asserting every URL in the current `sitemap.xml` still resolves after any routing change
5. A test asserting all seven JSON-LD blocks still parse on the homepage

Until those exist, this document is the contract and review is the enforcement.
