# Changelog

All notable changes to the Reddivaripalli Village Portal are documented here.

Format inspired by [Keep a Changelog](https://keepachangelog.com/). Versioning follows the app `package.json` semver.

The root [CHANGELOG.md](../CHANGELOG.md) is mirrored for operators; prefer updating **both** (or this file as canonical docs copy) on release.

## [1.2.0] — 2026-08-03

### Fixed

- Fun Fest media after deploy: album covers and tiles use signed R2 URLs instead of stripped local paths
- Fun Fest login trims username/password and clears field errors while typing
- Sticky header scroll offset so homepage sections are not hidden under the nav
- JSON-LD logo URLs no longer double-prefix the R2 public domain

### Changed

- Homepage hero shows Reddivaripalli address stack over Vanta Birds with a stronger logo watermark
- Gallery hub groups albums by year, then festival, with cover / name / year / media count
- Removed Blood Donor directory (nav, footer, routes, admin, search, community API); redirects added

## [1.1.8] — 2026-08-03

### Changed

- Synced committed build id and service worker cache with production 1.1.8 deploy

## [1.1.7] — 2026-08-03

### Added

- Subtle site-wide logo watermark

### Changed

- Single corner watermark treatment; glossy logo / hero watermark polish in adjacent commits

## [1.1.6] — 2026-08-03

### Changed

- Directory roster adjustment (e.g. D Raja Reddy → Other Professionals)

## [1.1.5] — 2026-08-03

### Changed

- Generated assets refresh; drop duplicate Timeline drawer link
- Nav/footer/home cleanup; government profession matching refinements

### Fixed

- Mobile/PWA page loads stuck blank after drawer navigation

## [1.1.0] — 2026-08-03

### Added

- Official Gram Panchayat framing with Annual Archive, Heritage, Village Directory, Lost & Found, Panchayat Documents
- Community data API on Cloudflare Pages Functions + R2 JSON stores
- Super Admin dashboard (`/admin/`) with username/password login, members manager, media, moderation
- Super Admin Edit Mode for inline member management
- Members directory refresh: designations, category badges, memorials, search/filters, statistics, View Profile
- Cloudflare R2 media pipeline with deploy-time local media strip (preserves route HTML)
- PWA install prompt and service worker update flow
- Notification center: festivals, birthdays, developments, browser permission flow
- Fun Fest member authentication via Pages Functions

### Fixed

- Members page HTML removed by over-aggressive media strip
- Super Admin login Worker 1101 (PBKDF2 iterations)
- Member cards stuck at opacity 0 when scroll animation never fired
- Member photos rewritten to R2 public URLs at build time

### Changed

- Member categories are community roles (Legacy / Core / Next Generation), not age bands

## [1.0.0] — 2026-08-01

### Added

- Premium Digital Village Experience for Kondreddigaripalli (Reddivaripalli)
- Cinematic 3D village hero with reduced-motion and low-power fallbacks
- GitHub-as-CMS under `content/<YEAR>/<album>/`
- Universal media support (images, video, audio, documents)
- Search index, timeline, interactive map, village story
- Design tokens and reusable UI primitives
- Pre-deploy validator and CI quality gates
- Dual deploy: Cloudflare Pages (primary) + GitHub Pages (mirror)
- Initial `/docs` governance package

---

## Unreleased

Track upcoming work here using Added / Changed / Fixed / Removed.
