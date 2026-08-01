# 06 — Gallery

## Role

Galleries present **memories**, not an infinite media dump. Albums are year + festival/journey scoped, with covers chosen for quality and favorites.

## Detection

Build-time sync auto-detects:

- Years from `content/<YEAR>/`
- Albums from known bucket folders
- Media types from extensions (`lib/media-formats.ts`)
- Optional metadata from `album.json` overrides

## Cover selection

When `album.json` does not set `cover`, sync picks the best image using:

1. Favorite flag (strong boost)
2. Resolution area (width × height)

This keeps album cards cinematic without manual cover picking for every folder.

## Media types

| Type | Presentation |
|---|---|
| Image | Responsive optimized assets + lightbox |
| Video | `VideoPlayer` with poster when available |
| Audio | `AudioPlayer` / `AudioDeck` |
| Document | `DocumentCard` download/open affordance |

Gallery filters and search can narrow by type.

## UI building blocks

- `AlbumCard` — cover, title, year, counts
- `AlbumView` — album detail composition
- `Gallery` — media grid
- Lightbox / image viewer patterns
- Empty states when an album or filter returns nothing

## Routing

Static params are generated for bucket hubs, years, and album paths. Duplicate routes fail the validate gate.

## Search & timeline integration

- Search index includes titles, years, buckets, media names
- Timeline aggregates years and album density
- Both regenerate during `npm run generate` / `prepare:site`

## Content quality rules

- Prefer meaningful filenames
- Mark hero shots as favorites in overrides when needed
- Avoid duplicate basenames in the same album folder
- Keep private notices visible where heritage sensitivity applies
