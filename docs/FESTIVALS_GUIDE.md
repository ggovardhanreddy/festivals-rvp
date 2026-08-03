# Festivals Guide

## Culture festivals

Defined in [`lib/festivals.ts`](../lib/festivals.ts) `CULTURE_FESTIVALS`:

| Key / slug | Title |
|---|---|
| `vinayaka-chavithi` | Vinayaka Chavithi |
| `varalakshmi-vratam` | Varalakshmi Vratam |
| `sankranthi` (folder `sankranti`) | Sankranti |
| `sri-rama-navami` | Sri Rama Navami |
| `mathamma-jathara` | Mathamma Jathara |
| `devapatlamma-jathara` | Devapatlamma Jathara |
| `ugadi` | Ugadi |
| `deepavali` | Deepavali |
| `dasara` | Dasara |

Plus CMS buckets **`rvp-birthdays`** and **`fun-trips`** (Fun Fest) in [`lib/site.ts`](../lib/site.ts) `BUCKETS`.

## Chapter pages

Public routes: `/<festival-slug>/` and year albums `/<slug>/<year>/` (see `albumHref`).

Hero assets: `/festivals/<folder>/hero.webp` (version query `FESTIVAL_ASSET_VERSION`). Fun Fest locked hero: `/brand/funfest-hero-locked.webp`.

## Calendar linkage

Festival dates for notifications/events are maintained in `content/data/events.json` with `"category": "festival"` and matching `slug`.

## Adding a new festival year album

1. Create `content/<YEAR>/<bucket>/` and add media
2. Optional `album.json`
3. `npm run sync` locally or push to `main`
4. Ensure media migrated to R2 for production

Adding an entirely new festival **chapter** requires code updates in `lib/festivals.ts`, routes/nav, and usually hero assets — not only a folder drop.

## Related

[GALLERY_GUIDE.md](./GALLERY_GUIDE.md) · [EVENTS_GUIDE.md](./EVENTS_GUIDE.md) · [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)
