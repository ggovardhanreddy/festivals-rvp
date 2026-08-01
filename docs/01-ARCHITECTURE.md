# 01 — Architecture

## Overview

RVP Youth is a **static Digital Village Experience** built with Next.js App Router and exported as a static site. There is **no runtime database, upload API, or CMS server**. GitHub is the content system of record.

```text
content/                  ← human-authored media + optional overrides
   ↓ npm run sync
generated/                ← albums.json, sync warnings (build artifact)
public/                   ← optimized images, thumbs, videos, audio, docs, search index
   ↓ next build (output: export)
out/                      ← deployable static site
   ↓ GitHub Actions
Cloudflare Pages / GitHub Pages
```

## Layers

### 1. Content layer (`content/`)

Flat CMS layout:

```text
content/<YEAR>/<album-key>/
  photo.jpg
  clip.mp4
  song.mp3
  note.pdf
  album.json          # optional overrides
```

Album keys are constrained by `lib/cms.ts` (`CMS_ALBUMS`):

- `sankranthi`
- `vinayaka-chavithi`
- `rvp-birthdays`
- `fun-trips`

Years are directories from four-digit folder names. Unknown years may use `Unknown/` during import recovery.

### 2. Sync / pipeline layer (`scripts/`)

| Script | Responsibility |
|---|---|
| `ensure-folders.ts` | Create expected year/album folders |
| `sync-cms.ts` | Scan content, validate media, optimize images, copy video/audio/docs, score covers, write `generated/albums.json` |
| `generate-all.ts` | Search index, sitemap, robots, feed, PWA manifest, brand assets as needed |
| `validate-site.ts` | Pre-deploy quality gate |
| `migrate-cms-layout.ts` | One-time migration helper |

### 3. Domain layer (`lib/`)

- `site.ts` — brand, village identity, navigation, buckets
- `cms.ts` — CMS album constants and helpers
- `content.ts` — typed readers over `generated/albums.json`
- `types.ts` — Album / Media contracts
- `media-formats.ts` — supported extensions and type detection
- `experience.ts` / `village.ts` — 3D and story domain data
- `design-tokens.ts` — TS mirror of CSS tokens

### 4. Presentation layer

- `app/` — routes (App Router, static params)
- `components/` — UI, gallery, media players, experience/3D
- `styles/tokens.css` + `app/globals.css` — design system

### 5. Delivery layer

- Static export to `out/`
- Dual deploy workflows (Cloudflare primary, GitHub Pages mirror)
- CDN caching via Cloudflare Pages

## Data contracts

`Album` contains year, bucket, slug, title, cover, published flag, and `media[]`.

`Media` supports `image | video | audio | document` with file paths, dimensions (when known), dates, favorites, and titles.

UI never reads `content/` at runtime. It only consumes `generated/` + `public/`.

## Feature-based organization

```text
components/
  experience/     # 3D village, Lenis, ambience
  media/          # video / audio / document players
  ui/             # reusable primitives
app/              # route composition
lib/              # domain + adapters
scripts/          # build-time pipelines
```

## SOLID mapping

- **S** — sync script optimizes; generate script indexes; validate script gates
- **O** — new media types extend format maps without rewriting UI shells
- **L** — media players share a consistent presentation contract
- **I** — small typed modules instead of god-objects
- **D** — UI depends on `lib/content` abstractions, not filesystem walks

## Scalability hooks

Architecture already anticipates:

- Additional festivals (new bucket + nav + story chapter)
- Additional villages (identity module + optional multi-tenant content root)
- Historical archives, drone/360 media, VR/AR modes
- Multi-language (copy dictionaries + locale route segments)
- Genealogy / museum exhibitions (new feature folders + generated indexes)

No runtime backend is required for these expansions; prefer build-time generation.
