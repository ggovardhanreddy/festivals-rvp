# Search Architecture

**Status:** model, matcher and safety guard implemented in Phase 1A. The UI
still uses the existing `/search/` page; wiring it to the new matcher is the
next step.

## Document model

`lib/search/schema.ts`:

```
id · title · description · url · section · language · keywords · content
image? · category? · level? · date? · source? · lastVerified? · weight?
```

One shape every section emits into. Adding Learn or Agriculture later means
producing `SearchDoc`s, not rewriting search.

## Matching

`lib/search/query.ts` scores in weight order: exact title (100) → title prefix
(60) → title contains (40) → keyword (25) → description (12) → content (6),
falling back to token overlap (3 per token). `doc.weight` multiplies, so a
member outranks a photo of them.

## Telugu

`lib/search/normalize.ts`:

- **NFC, not NFKD.** NFKD splits Telugu syllables into base letters plus
  combining vowel signs, which then get reordered.
- The keep-set includes `\p{M}`. Telugu vowel signs are category Mn, not
  Letter — a `\p{L}`-only filter silently deletes them and turns రామాలయం into
  ర మ లయ. This was a real bug, caught by a test.
- Character bigrams for Telugu runs, since Telugu has no whitespace-friendly
  stemmer.
- A hand-checked transliteration table (Ramalayam ↔ రామాలయం) applied as a
  **ranking boost, never a filter**, so a wrong pair costs ordering rather than
  hiding a correct result.

## Safety

`isIndexable()` refuses `gated` and `admin` sections and any URL under
`/admin/`, `/login/`, `/chat/` or `/fun-trips/`. Asserted twice: a unit test on
the predicate, and an E2E test that fetches the built `search-index.json` and
checks it contains no private paths.

## No search library

The index gzips to 25 KB and a scored scan over ~700 documents runs in under a
millisecond. Pagefind or similar becomes worth its weight past a few thousand
documents; because everything goes through `SearchDoc`, that swap is a matcher
change, not a content migration.

Minifying the index is **not** worth doing — it is pretty-printed, but gzipped
that costs about 500 bytes. The real cost is parsing 357 KB of JSON on a cheap
phone, which sharding fixes and minification does not.

## Honest empty results

Searching "Java" returns **zero results** until Phase 3 adds real courses.
A unit test asserts this. Returning a plausible-looking placeholder would be
fabricated content.
