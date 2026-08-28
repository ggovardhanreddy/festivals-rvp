# Children's library — adding real content

Stories, Rhymes, Science, Educational Videos and Digital Skills are built and
routed. What they hold is a JSON file each. Nothing about the pages has to
change when the first real story arrives — that is the point of shipping the
structure before the content.

## Where content lives

```
content/typed/story/<slug>.json
content/typed/rhyme/<slug>.json
content/typed/science-topic/<slug>.json
content/typed/video/<slug>.json
content/typed/course/<slug>.json      # Digital Skills lessons
```

`npm run content:validate` checks every file against `lib/content/schema.ts`
and fails the build on anything malformed. An empty directory is a pass.

## Status is the switch

```
published                 renders as content
draft                     "Written, not published yet."
awaiting-permission       "Waiting on material we have permission to publish."
awaiting-teacher-review   "Waiting on review by a teacher."
coming-soon / planned     generic, use the specific ones instead
```

Only `published` ever renders. Everything else renders the reason, and the
reasons are named after the real blocker on purpose: a parent who reads
*"waiting on recordings from the village"* learns something true and might be
the person who fixes it. *"Coming soon"* teaches them nothing.

## Permission is enforced, not assumed

Every audio and video asset carries a `permission` block:

```json
"audio": {
  "type": "audio",
  "provider": "r2",
  "src": "audio/rhymes/chandamama.m4a",
  "captions": "/captions/chandamama.vtt",
  "permission": { "grantedBy": "G. Lakshmi Devi", "grantedOn": "2026-09-14" }
}
```

`isPlayable()` refuses to render a player without a named person and a date —
checked at render time, not only in CI, because that is the last thing standing
between a village recording and the open internet. The songs and stories belong
to the people who sing and tell them; a recording nobody agreed to publish is
not ours to put online.

`provider: "r2"` is a recording we host. `provider: "youtube"` is an embed and
loads only after a click, so nothing is fetched — and no third party is told
about a visitor — until someone actually presses play.

## A worked example

```json
{
  "kind": "story",
  "id": "story-mathamma-01",
  "slug": "mathamma-jathara-telling",
  "status": "published",
  "language": ["te", "en"],
  "title": { "en": "How the Jathara began", "te": "జాతర ఎలా మొదలైంది" },
  "description": { "en": "As told by …", "te": "…" },
  "body": { "te": "…", "en": "…" },
  "ageGroup": ["8-10"],
  "readingMinutes": 4,
  "provenance": {
    "source": "Told by G. Ramesh Kumar Reddy, recorded 2026-09-02",
    "sourceUrl": "https://www.reddivaripalli.com/heritage/",
    "reviewer": "G. Uma Maheshwar Reddy",
    "lastVerified": "2026-09-02"
  }
}
```

Provenance is required on stories, rhymes and science topics. "Traditional"
with nobody behind it is not a source — a folk tale has a person who told it,
and naming them is both more accurate and better manners.

## Letters and sounds

`/kids/alphabet/` needs no content files. It reads `lib/kids/alphabet.ts` —
26 Latin letters and the aksharamala as it is taught, 16 achchulu and 36
hallulu — and speaks through the browser's own `speechSynthesis`.

`lib/speech.ts` will not substitute an English voice for Telugu. Where a device
has no Telugu voice, the page renders an explanation instead of a speaker
button. A child learning to read must not be taught a wrong sound, and voice
availability is a device fact rather than a site fact — the same page has
Telugu speech on one phone and not on another.

To replace synthesis with real recordings later, add an `audio` asset per
letter and prefer it in `AlphabetPlayer`; the rest of the component is unchanged.

## Adding a section

1. Write the JSON. Start with `"status": "draft"`.
2. `npm run content:validate`.
3. Flip to `"published"` when the permission and the review are genuinely done.
4. `npm run generate` — published items enter the search index; held-back ones
   deliberately do not, because search must not promise what a page cannot give.

## What not to do

Do not fill an empty section to make it look finished. The empty states are
finished design, not placeholders: they are honest, they say what is missing
and why, and two of them ask the reader for exactly the thing that is needed.
A fabricated village story or an invented teacher approval would be worse than
an empty page, and harder to undo.
