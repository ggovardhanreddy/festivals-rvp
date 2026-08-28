# Route Migration — Preserving Every Existing URL

**Created:** Phase 0, 2026-08-28
**Status:** IMPLEMENTED in Phase 1A/1B. See the status column below.
**Target:** English at `/`, Telugu at `/te/`, plus the new platform sections.

---

## 1. The governing rule

> **No URL that resolves today may 404 tomorrow.**

68 static pages are live and indexed. Google has them, people have bookmarked them,
WhatsApp messages link to them, and the installed PWA has some cached. A 404 on any of
them is a regression, not a migration.

Every entry in § 3 is therefore either **unchanged** or **301 redirected**. There is no
third option.

---

## 2. Recommended structure

| Language | Prefix | Rationale |
|---|---|---|
| English | `/` (no prefix) | Every existing URL keeps working with **zero** redirects |
| Telugu | `/te/` | New URL space; nothing to break |

### Why English keeps the root

The alternative — Telugu at `/`, English at `/en/` — requires redirecting all 68
existing URLs and asking Google to re-index the entire site. The SEO cost is real and
the benefit is symbolic.

A better way to serve Telugu-first users without moving the URLs:

- The language toggle is remembered in `localStorage` (`rvp-ui-lang`, already implemented)
- A returning visitor who chose తెలుగు is offered `/te/…` — a client-side redirect on
  first paint, never a server-side one, so crawlers always see the canonical English page
- `hreflang` pairs each English page with its Telugu twin, so Google serves the right
  one to Telugu searchers directly

**This is a decision to confirm, not a fact.** If Telugu at `/` matters more than the
indexing cost, say so and this document changes.

---

## 3. Complete URL map

### 3.1 Existing routes — all unchanged

| Current URL | After migration | Redirect | Telugu twin |
|---|---|---|---|
| `/` | `/` | — | `/te/` |
| `/about/` | `/about/` | — | `/te/about/` |
| `/heritage/` | `/heritage/` | — | `/te/heritage/` |
| `/timeline/` | `/timeline/` | — | `/te/timeline/` |
| `/years/` | `/years/` | — | `/te/years/` |
| `/years/<year>/` | unchanged | — | `/te/years/<year>/` |
| `/gallery/` | `/gallery/` | — | `/te/gallery/` |
| `/members/` | `/members/` | — | `/te/members/` |
| `/events/` | `/events/` | — | `/te/events/` |
| `/directory/` | `/directory/` | — | `/te/directory/` |
| `/developments/` | `/developments/` | — | `/te/developments/` |
| `/suggestions/` | `/suggestions/` | — | `/te/suggestions/` |
| `/lost-found/` | `/lost-found/` | — | `/te/lost-found/` |
| `/documents/` | `/documents/` | — | `/te/documents/` |
| `/contact/` | `/contact/` | — | `/te/contact/` |
| `/search/` | `/search/` | — | `/te/search/` |
| `/settings/` | `/settings/` | — | `/te/settings/` |
| `/privacy/` `/terms/` | unchanged | — | `/te/privacy/` `/te/terms/` |
| `/offline/` | unchanged | — | `/te/offline/` |
| `/rvp-birthdays/` | unchanged | — | `/te/rvp-birthdays/` |
| `/rvp-birthdays/<year>/<album>/` | unchanged | — | Telugu twin optional |
| `/sankranthi/` … `/dasara/` (9 festivals) | unchanged | — | `/te/<festival>/` |
| `/<festival>/<year>/` | unchanged | — | Telugu twin optional |
| `/fun-trips/` `/fun-trips/<year>/` | unchanged | — | not translated (private) |
| `/chat/` `/login/` `/admin/` | unchanged | — | not translated |

**Redirects required for existing content: zero.**

Existing redirects in `public/_redirects` stay exactly as they are:

```
/blood-donors      /  301
/blood-donors/     /  301
/blood-donors/*    /  301
https://reddivaripalli.com/*      https://www.reddivaripalli.com/:splat  301
http://reddivaripalli.com/*       https://www.reddivaripalli.com/:splat  301
http://www.reddivaripalli.com/*   https://www.reddivaripalli.com/:splat  301
```

### 3.2 New platform routes

All new. No collision with anything existing — checked against the full list above.

| Route | Telugu | Phase |
|---|---|---|
| `/learn/` `/learn/<track>/` `/learn/<track>/<course>/` `/learn/<track>/<course>/<lesson>/` | `/te/learn/…` | 3 |
| `/play/` `/play/<game>/` `/play/daily/` | `/te/play/…` | 2 |
| `/kids/` `/kids/<age>/` `/kids/<subject>/` | `/te/kids/…` | 2 |
| `/agriculture/` `/agriculture/<crop>/` `/agriculture/guide/` | `/te/agriculture/…` | 4 |
| `/english/` `/english/<level>/` | `/te/english/…` | 3 |
| `/engineering/` `/engineering/<branch>/` | `/te/engineering/…` | 3 |
| `/it/` `/it/<course>/` | `/te/it/…` | 3 |
| `/careers/` | `/te/careers/` | 3 |
| `/weather/` | `/te/weather/` | 4 |
| `/temples/` | `/te/temples/` | 5 |
| `/services/` `/schemes/` `/digital-skills/` | `/te/…` | 5 |
| `/community/` | `/te/community/` | 5 |
| `/explore/` | `/te/explore/` | 1B |

### 3.3 One naming conflict to decide

`/temples/` is proposed as a new top-level section, while temple content lives today
inside `/heritage/` and `/about/#temples`.

Options:
1. `/temples/` becomes the new home; `/heritage/` stays and cross-links — **recommended**, nothing breaks
2. `/heritage/` 301s to `/temples/` — breaks an indexed URL for no gain

Take option 1.

Similarly `/community/` is new, while `/members/`, `/directory/`, `/events/` and
`/developments/` exist as siblings. `/community/` should be a **hub that links to them**,
not a replacement. No redirects.

---

## 4. Implementation

### 4.1 The routing change this requires

Telugu URLs cannot be delivered by the current `app/[...slug]/page.tsx` catch-all
without a real segment structure. The minimum viable change:

```
app/
├── page.tsx                 # English home — unchanged
├── [...slug]/page.tsx       # English catch-all — unchanged
└── te/
    ├── page.tsx             # Telugu home
    └── [...slug]/page.tsx   # Telugu catch-all
```

This is deliberately the **smallest** change that works. It keeps every existing route
file untouched, so the risk of breaking a live page is close to zero. The two catch-alls
share their page bodies through a common module; only the language context differs.

It is *not* the clean long-term structure — that is a per-section segment tree, and it
belongs in the phase where the section count actually justifies it (Phase 3+). Splitting
the router and adding Telugu at the same time doubles the risk of both.

### 4.2 Static export considerations

- `output: "export"` requires `generateStaticParams()` to enumerate Telugu routes too — the array doubles
- `trailingSlash: true` must hold for `/te/` as well
- Build time roughly doubles: 68 → ~130 pages. Currently 31 s, so this is not a concern
- `dynamicParams = false` means an un-enumerated Telugu path 404s. Every Telugu route must be listed

### 4.3 SEO

Each page emits:

```html
<link rel="alternate" hreflang="en" href="https://www.reddivaripalli.com/about/">
<link rel="alternate" hreflang="te" href="https://www.reddivaripalli.com/te/about/">
<link rel="alternate" hreflang="x-default" href="https://www.reddivaripalli.com/about/">
```

- Canonical is self-referential per language — `/te/about/` canonicalises to itself, never to `/about/`
- `<html lang="te">` on Telugu pages (today it is hard-coded `en`)
- `scripts/generate-all.ts` extends the sitemap with Telugu URLs and `xhtml:link` alternates
- Telugu `title` and `description` per page — these live in `app/[...slug]/page.tsx`'s `pageTitles` object today and must move into the message catalogue
- `robots.txt` needs no change; the existing disallows apply to `/te/` equivalents too, which must be added

### 4.4 PWA

- Service worker cache key must change so installed apps pick up the new routes
- `manifest.webmanifest` `start_url` stays `/`; consider a Telugu manifest later
- `/te/offline/` must be precached alongside `/offline/`

---

## 5. Verification

Before merge:

1. Snapshot every URL in the current `sitemap.xml` — 45 entries
2. After the change, assert each returns 200 — a CI test, not a manual check
3. Assert each Telugu twin returns 200
4. Assert each canonical is self-referential
5. Assert `hreflang` pairs are reciprocal
6. Confirm `/blood-donors` still 301s
7. Re-submit the sitemap to Search Console and watch coverage for two weeks

---

## 6. Rollback

The change is additive: new files under `app/te/`, plus `hreflang` tags on existing
pages. Reverting the commit removes the Telugu tree and restores the previous
`sitemap.xml`. **No existing route is modified, so there is nothing to restore.**

The one non-additive piece is the service worker cache key. Bumping it back is safe;
users get one extra refresh.


---

## 8. Implementation status (Phase 1A/1B)

| Group | Existing URL | Future URL | Status | Redirect | Notes |
|---|---|---|---|---|---|
| Home | `/` | `/` | **live** | none | Telugu twin `/te/` live |
| Village | `/about/` `/heritage/` `/timeline/` `/years/` | unchanged | **live** | none | no Telugu twin yet |
| Media | `/gallery/` `/rvp-birthdays/` `/years/<y>/` | unchanged | **live** | none | |
| Festivals | 9 chapters + `/<y>/` | unchanged | **live** | none | |
| Community | `/members/` `/events/` `/directory/` `/developments/` `/suggestions/` `/lost-found/` `/documents/` `/contact/` | unchanged | **live** | none | |
| Utility | `/search/` `/settings/` `/offline/` `/privacy/` `/terms/` | unchanged | **live** | none | |
| Gated | `/fun-trips/` `/chat/` `/login/` `/admin/` | unchanged | **live** | none | noindex, unchanged |
| Removed | `/blood-donors*` | `/` | **live** | 301 | pre-existing, preserved |
| **Telugu** | — | `/te/` | **new, live** | none | genuine Telugu entry point |
| **Games** | — | `/play/` `/play/{sudoku,memory,maths,word,quiz,daily}/` | **new, live** | none | real playable games |
| **Reserved** | — | `/learn/` `/kids/` `/agriculture/` `/english/` `/engineering/` `/it/` `/careers/` `/temples/` `/community/` `/weather/` `/services/` `/digital-skills/` `/explore/` | **landing only** | none | honest "being built" page naming the phase. No placeholder content |

**Redirects required for existing content: zero.** 68 pages before, 89 after.

`/temples/` and `/community/` are new sections; `/heritage/`, `/members/`,
`/directory/` and `/events/` keep their URLs and are cross-linked rather than
redirected.
