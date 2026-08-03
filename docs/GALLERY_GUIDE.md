# Gallery Guide

## Public gallery

Route: **`/gallery/`** — albums grouped by **year → festival**, showing cover, name, year, and media count (1.2.0).

Annual archive: **`/years/`** and `/years/<YEAR>/`.

Festival / birthday / Fun Fest deep links come from [`lib/site.ts`](../lib/site.ts) `albumHref()`.

## GitHub-as-CMS layout

```text
content/
  <YEAR>/
    sankranthi/
    vinayaka-chavithi/
    varalakshmi-vratam/   # when used
    sri-rama-navami/
    mathamma-jathara/
    devapatlamma-jathara/
    ugadi/ deepavali/ dasara/  # as present
    rvp-birthdays/
    fun-trips/
```

Drop media into the album folder, commit, push to `main`. Actions sync/optimize/build/deploy.

Optional `album.json` overrides title, description, cover, publish flag.

## Supported media (pipeline)

Images, video, audio, documents — see `lib/media-formats.ts` and root [CONTENT_GUIDE.md](../CONTENT_GUIDE.md).

## Build artifacts

| File | Role |
|---|---|
| `generated/albums.json` | Album index after sync |
| `generated/albums.r2.json` | R2-oriented companion |
| `generated/sync-warnings.json` | Skipped/corrupt files |

`scripts/rewrite-albums-r2.ts` rewrites public paths to R2 when `NEXT_PUBLIC_R2_PUBLIC_URL` is set.

## Fun Fest media

- Stored under private R2 prefixes (`funfest/`, paths containing `fun-trips/`)
- Browser uses signed URLs via `/api/media/sign` (member or admin session)
- 1.2.0 fixed covers/tiles using signed R2 URLs after local strip

## Adding media without Git (admin)

Super Admin → Media tab → `/api/media/upload`. This places objects in R2 categories; linking them into year albums for the public gallery still typically requires CMS folder sync / album JSON updates. Treat admin upload as best for portraits, docs, and ad-hoc assets unless you also update album metadata.

## Related

[MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md) · [FESTIVALS_GUIDE.md](./FESTIVALS_GUIDE.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md)
