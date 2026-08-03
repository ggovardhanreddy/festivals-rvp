# Changelog

All notable changes to **RVP Youth — Digital Village Experience** are documented here.

## [1.4.2] — 2026-08-03

### Fixed

- Fun Fest album slideshow and hero backgrounds now resolve signed `/api/media` URLs (no more unsigned strip-local paths)
- Private media signing no longer falls back to local `/images|/thumbs|/videos` paths that 404 after deploy
- Stale Fun Fest `sessionStorage` is cleared when the member cookie is missing, so the UI cannot look logged-in without media access
- Gallery / slideshow / timeline stop surfacing UUID filenames as primary labels; album timeline shows signed thumbs
- Service worker skips caching `/fun-trips/` and `/funfest/` paths so stale 404/login redirects cannot stick

### Changed

- Fun Fest chapter hero prefers a real album cover after login (signed) instead of only the locked brand plate

## [1.3.2] — 2026-08-03

### Fixed

- Homepage hero title keeps **Reddivaripalli** on a single line (`nowrap` + responsive `clamp`) without mid-word wrap or clipped letters

## [1.3.1] — 2026-08-03

### Fixed

- Homepage hero title no longer truncates **Reddivaripalli** (background-clip / overflow / size)
- Hero address is exactly two lines (Grama Panchayat + Devepatla / Sambepalli / Annamayya / A.P)
- SCROLL cue sits in-flow under the CTA row so it never overlaps Members

### Changed

- PWA `version.json` / service-worker build id bumped — installed clients should see **Update Now**

## [1.3.0] — 2026-08-03

### Fixed

- Fun Fest media after strip-local: slideshows and map tiles now use signed `/api/media` URLs (not stripped local paths)
- Private media signing no longer depends on `NEXT_PUBLIC_R2_PUBLIC_URL`; friendly placeholders replace broken images
- Service worker preserves credentials on `/api/*` fetches so member-signed media keeps working in the PWA

### Changed

- Fun Fest stays visible in nav/footer; click opens a members-only login dialog (username = first name, password matches)
- Public Gallery is festival-first (festival → year → photos/videos) instead of year-first
- Media lightbox adds fullscreen (`F` key) and signed object responses support HEAD/Range for video

## [1.2.0] — 2026-08-03

### Fixed

- Fun Fest media after deploy: album covers and tiles now use signed R2 URLs instead of stripped local paths
- Fun Fest login trims username/password and clears field errors while typing
- Sticky header scroll offset so homepage sections are not hidden under the nav
- JSON-LD logo URLs no longer double-prefix the R2 public domain

### Changed

- Homepage hero shows Reddivaripalli address stack over Vanta Birds with a stronger logo watermark
- Gallery hub groups albums by year, then festival, with cover / name / year / media count
- Removed Blood Donor directory (nav, footer, routes, admin, search, community API)

## [1.1.0] — 2026-08-03

### Added

- Official Gram Panchayat framing with Annual Archive (`/years/`), Heritage, Village Directory, Lost & Found, Blood Donors, and Panchayat Documents
- Community data API on Cloudflare Pages Functions + R2 JSON stores
- Super Admin dashboard (`/admin/`) with username/password login, members manager, media, and community moderation tabs
- Members directory refresh: designations, category badges, memorial recognition, search/filters, live statistics, View Profile modal
- Cloudflare R2 media pipeline (`NEXT_PUBLIC_R2_PUBLIC_URL`) with deploy-time local media strip that preserves route HTML
- PWA install prompt (mobile + menu), service worker update flow
- Fixed Vanta identity backgrounds per route with mobile/low-power fallbacks
- Notification center: festivals, birthdays, developments, browser permission flow
- Fun Fest member authentication via Pages Functions

### Fixed

- Members page deleted during deploy (media strip removed `out/members/` HTML) — now strips portraits only
- Super Admin login Worker 1101 (PBKDF2 iterations exceeded CPU limit)
- Member cards stuck at `opacity: 0` when scroll animation never fired
- Member photos rewritten to R2 public URLs at build time

### Changed

- Members categories are community roles (Legacy Circle / Core / Next Generation), not age bands
- Deploy docs and `.env.example` document Super Admin + R2 secrets

## [1.0.0] — 2026-08-01

### Added

- Premium Digital Village Experience for Kondreddigaripalli (Reddivaripalli)
- Cinematic 3D village hero with reduced-motion and low-power fallbacks
- GitHub-as-CMS flat layout under `content/<YEAR>/<album>/`
- Universal media support (images, video, audio, documents)
- Search index, timeline, interactive map, village story, memory wall
- Central design tokens (`styles/tokens.css`, `lib/design-tokens.ts`)
- Reusable UI primitives including empty, error, and skeleton states
- Pre-deploy validator (`npm run validate`) and CI quality gates
- Cover quality scoring during CMS sync
- Complete `/docs` governance package and root operational docs
- Dual deploy: Cloudflare Pages (primary) + GitHub Pages (mirror)

### Village identity

- Name: Kondreddigaripalli (Reddivaripalli)
- Address: Devepatla (P), Sambepalli (M), Annamayya Dist, PIN 516215

### Notes

- Gallery/media can be served from Cloudflare R2 while GitHub remains the CMS for album folders
- Media pipeline emits warnings for corrupt/unsupported files instead of crashing
