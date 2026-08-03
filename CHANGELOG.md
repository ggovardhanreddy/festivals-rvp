# Changelog

All notable changes to **RVP Youth — Digital Village Experience** are documented here.

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
