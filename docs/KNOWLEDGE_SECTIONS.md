# Sanatana Dharma, Telugu Culture & the resource collector

The site's knowledge section. Replaces the education/learning concept entirely.

- **/dharma/** — Sanatana Dharma, the Vedas, the Upanishads, the Gita (18
  chapter pages), Ramayanam, Mahabharatam, the Puranas, slokas and devotional
  music
- **/telugu-culture/** — literature, poetry, stories, spiritual literature, Sri Sri
- **/spiritual-heritage/** — Reddivaripalli's own: Sri Ramalayam, the jatharas,
  local bhajans, elders' memories
- **/government/** — the existing official citizen-services directory, unchanged

Two kinds of content live here, and they have opposite trust properties:

| | Curated (`lib/dharma/`) | Collected (`lib/resources/`) |
|---|---|---|
| Written by | Hand, reviewed, committed | The collector, this morning |
| Changes | When someone edits it | Every run |
| Trust | High — a Gita chapter is a fixed fact | None until an admin reads it |
| Renders | Always | Only at `status: "published"` |

---

## The rule that shapes everything

Of roughly fourteen sources examined on 31 August 2026, **one** grants a
licence we can host under: **Telugu Wikisource** (CC BY-SA 4.0). Everything
else is link-only or embed-only.

So no verse is reproduced on this site. The pages give a text's name, length,
divisions and subject in original prose, and send the reader to a source that
has the verses lawfully. That is not a limitation to work around — for most of
these publishers it is the only lawful arrangement, and the source block on
every page states each one's position openly.

### Where things stand

| Source | Position |
|---|---|
| **Telugu Wikisource** | **CC BY-SA 4.0 — hostable.** Potana's Bhagavatam, Andhra Vishnu Puranam, Bhagavad Gita, Vishnu Sahasranama. ShareAlike is viral. |
| TTD / Tirumala | "All Rights Reserved." ~4,000 free-to-read Telugu titles — the best catalogue for this audience. Deep-link. **Worth writing for permission.** |
| Andhra Bharati | No terms at all, and mixes public-domain classics with in-copyright authors unlabelled. Link only. |
| sanskritdocuments.org | Copying permitted for personal study, explicitly not to "promote your own web-site". Its "Telugu" is Sanskrit in Telugu script. |
| Gita Supersite | No terms, no licence, no robots.txt. Its eleven "languages" are scripts; translations are Hindi and English only. |
| vedabase.io | © Bhaktivedanta Book Trust, all rights reserved. |
| sacred-texts.com, annamayya.org | **Serve `Disallow: /` to our crawler by name.** `method: "manual"` — we honour that rather than route around it. |
| SVBC TTD (YouTube) | Embed via YouTube's player. Never download. |
| archive.org | A host, not a rights clearinghouse. Per-item only. |

### ⚠️ Wikisource is not proof of public domain

It carries Sri Sri's *Maha Prasthanam* in full, which it is not entitled to do —
he died in 1983 and his work is protected in India until 2044. Wikisource can
only pass on rights it holds. **Check the author's death year independently
before reusing anything from it.**

---

## Copyright, in the form this project needs it

India protects a published literary work for the author's lifetime plus sixty
years from the end of the year of death (Copyright Act 1957, s.22). There is
**no renewal system** and registration is optional, so the year of death is the
entire test — the American question "was it renewed?" has no application.
`isPublicDomainInIndia()` in `lib/dharma/types.ts` is that rule, and
`tests/unit/dharma.test.ts` checks every author in the table against it.

**Free to publish in full** (died 1965 or earlier): Annamayya (1503), Nannayya,
Tikkana, Errana, Potana, Molla, Vemana, Ramadasu (c. 1688), Tyagaraja (1847),
Gurajada Apparao (1915), Kandukuri Veeresalingam (1919).

**Still in copyright** — and the three most often assumed otherwise:

| Author | Died | Free from |
|---|---|---|
| Gurram Jashuva | 1971 | 1 Jan 2032 |
| Viswanatha Satyanarayana | 1976 | 1 Jan 2037 |
| Devulapalli Krishnasastri | 1980 | 1 Jan 2041 |
| **Sri Sri** | **1983** | **1 Jan 2044** |

### Sri Sri

The page carries his dates, life, bibliography, awards, original criticism and
links — and **no line of his poetry**, until 1 January 2044. Note that
s.52(1)(a)(i)'s "private or personal use" does not cover publishing on a public
website; that is the commonest misreading of Indian fair dealing. Short
attributed quotations inside genuine critical discussion are permitted under
s.52(1)(a)(ii).

To carry his work sooner, write to **Visalaandhra Publishing House, Hyderabad**,
his publisher of record.

### Devotional music — three copyrights stack

1. The **composition** — often 15th century, free.
2. Any **20th-century musical setting** — a fresh work, 60 years past its
   arranger's death.
3. The **sound recording** — s.27, 60 years from publication, owned by the label.
   Performers' rights add 50 years (s.38).

M. S. Subbulakshmi's 1979 Annamayya album is protected until the end of **2039**
even though Annamayya died in 1503. So: embed YouTube, never download.

**The one clean path to free devotional audio is to record it here.** Village
singers performing a public-domain composition, released under a CC licence —
every layer free or ours, and openly-licensed Telugu devotional audio barely
exists.

---

## The collector

The engine from the previous round, repointed. §17's forbidden subjects —
agriculture, education, coaching, jobs, careers, kids learning, competitive
exams — **have no category key in `lib/resources/taxonomy.ts`**, so a resource
cannot be filed under one even if a source served it. That is cheaper and more
reliable than a blocklist.

```
.github/workflows/collect-resources.yml   (cron: 6-hourly / daily / weekly / monthly)
  → scripts/collect-resources.ts → lib/collector/pipeline.ts
      discover → CHECK PERMISSION → download or link → dedupe
      → extract metadata → categorise → quality checks → status
  → ClamAV (only if files were downloaded) → resources:validate
  → commit → gh workflow run deploy.yml
```

**No paid AI, per §20.** Categorisation is weighted keyword scoring over title,
description and extracted text, with the source's own categories as a prior. The
matches are recorded on each resource, so a decision can be read rather than
guessed at. Nothing is sent to an API.

**§19's cheap-update rules** are in `lib/collector/fetcher.ts`: conditional
requests with ETag and If-Modified-Since, HEAD before GET, content hashing, one
request at a time per host with a 2-second floor, and no retry on a 4xx.

### Scheduled runs are off until you turn them on

Set the repository variable `RESOURCE_COLLECTOR_ENABLED` to `true`
(Settings → Actions → Variables). Until then scheduled runs exit immediately and
say so. Manual dispatch always works — start with a dry run.

### Nothing auto-publishes

Every source has `autoPublish: false`. Collected material lands at `new` or
`needs-review`. Scripture that nobody has read must not appear on a village
temple's website.

---

## Running it

```bash
npm run resources:collect -- --dry-run          # see what would be collected
npm run resources:collect -- --source wikisource-te --dry-run
npm run resources:validate                      # catalog integrity; runs in CI
```

Most of these hosts are unreachable from sandboxed environments. A dry run
reporting every source as failing is usually a network story — the GitHub
Actions runner has open internet and is where a real run belongs.

## Files

| Path | What it is |
|---|---|
| `lib/dharma/` | The curated library: types, verified sources, Sanatana Dharma, the scriptures, Telugu culture and authors |
| `content/dharma/sources.md` | The quoted licence sentence for every source |
| `content/resources/sources.json` | The collector's approved source registry |
| `lib/resources/`, `lib/collector/` | The collector's model and engine |
| `components/dharma/` | Knowledge pages, source list, hubs, Gita chapters, spiritual heritage |
| `tests/unit/dharma.test.ts` | 35 tests, most of them on the copyright rules |

## Retired in this redesign

`/learn/`, `/careers/`, `/students/`, `/agriculture/`, `/farmers/`, `/kids/`
(12 routes), `/play/` (7 games), `/english/`, `/it/`, `/engineering/`,
`/digital-skills/`, and the "planned / coming soon" pages. All 301 to the
nearest relevant section in `public/_redirects` — §1 asked for removal rather
than empty pages, and §26 for no broken menu items.

## Known limits

- **Almost no machine-readable feeds exist.** sanskritdocuments has RSS,
  archive.org has per-collection RSS, YouTube has channel Atom. Everything else
  is an HTML index.
- **The pages carry no verses**, by design. A reader wanting the text follows a
  source link. If TTD grants permission that changes for a large part of the
  library at once.
- **`/dharma/` and `/telugu-culture/` have no Telugu version** yet — the pages
  carry Telugu titles and labels throughout, but the prose is English. That is
  the largest remaining gap for the intended audience.
- ~20 KB of dead CSS remains from the removed kids, games and learning sections.
