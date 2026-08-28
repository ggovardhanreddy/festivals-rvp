# Performance

All figures measured from a production build, not estimated. Both raw and
gzipped are given: gzip flatters the site over the wire, while raw bytes are
what a low-end Android phone must parse. Cloudflare serves brotli, slightly
better than these gzip numbers.

## Homepage — the one big win

| | Before | After | Change |
|---|---|---|---|
| HTML raw | 869,746 B | **253,580 B** | **−71%** |
| HTML gzipped | 96,151 B | **29,874 B** | **−69%** |

### Cause

`allMedia()` returns `{ ...media, album }` where `album` is the **full** album,
including `album.media` — the entire array of that album's media. Every item
therefore carried a copy of its whole album:

```
507 image items rendered as 24
38,389 nested media objects serialised
69x amplification
```

### Fix

`lib/media-card.ts` `toMediaCards()` — strips `album.media`, drops server-only
fields (`sha256`, `phash`, `original`, `mime`), and shares one album object per
album. `HomePage` additionally caps at 24 items per album, which is the most
any filter combination can display, so no filter loses results.

Nothing reads `item.album.media` off a `MediaWithAlbum` — verified across
`components/` and `app/`. Album-level consumers receive an `Album` directly and
are untouched.

## A finding worth keeping

**React Flight deduplicates repeated object references.** Slimming an array
that is already shared elsewhere on the same page *increases* the payload,
because the mapped copies are new objects and lose the sharing.

`/vinayaka-chavithi/` went **428 KB → 675 KB** when `Gallery` was fed a slimmed
copy of the same `album.media` array that `AppleBucketStage` already receives.
Reverted. Slimming only pays where the array is genuinely new, as on the
homepage where `allMedia()` constructs fresh wrappers anyway.

## Current state

| Page | Raw | Gzipped |
|---|---|---|
| `/` | 254 KB | 30 KB |
| `/te/` | 257 KB | 30 KB |
| `/gallery/` | 427 KB | 36 KB |
| `/years/` | 555 KB | 72 KB |
| `/vinayaka-chavithi/` | 428 KB | 51 KB |
| CSS (one file, every route) | 180 KB | 34 KB |
| Total JS in `out/_next` | 2.39 MB | — |

## Still to do

| Item | Note |
|---|---|
| `/years/` at 555 KB | Same album-nesting cause; needs the Flight-sharing caveat respected |
| `/gallery/` at 427 KB | `GalleryHub` already gets slimmed albums; remaining weight is the album list itself |
| CSS on every route | 180 KB unsplit. Route-level splitting is a Phase 1B/7 item |
| 122 of 142 client components | 26 have no client-only API at all; see `CLIENT_COMPONENT_AUDIT.md` |
| No CI budget gate | `scripts/check-budgets.ts` is specified but not written |

## Things that were already fine

- **Three.js is lazy.** The 881 KB chunk is referenced by no HTML and loads
  only when the village canvas mounts.
- **Vanta is gated off mobile** via `useAllowHeavyEffects()`. It is not yet
  gated on `prefers-reduced-motion` or Save-Data.
- **The search index gzips to 25 KB.** Minifying it saves ~500 bytes and is not
  worth doing; sharding is what would help.

## Fonts

Self-hosted, 144 KB total across six WOFF2 subsets. This removed a hard
build-time dependency on `fonts.googleapis.com` — `next/font/google` fetches at
build and previously took the whole build down when that host was unreachable.
