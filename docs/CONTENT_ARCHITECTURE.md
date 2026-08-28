# Content Architecture

**Status:** schemas and the validation gate implemented in Phase 1A.
`content/typed/` does not exist yet — Phases 2–5 add the content.

## Where content lives

| Kind | Store | Why |
|---|---|---|
| Courses, lessons, quizzes, games, crops, guides, schemes, services, temples, heritage, video | **Git `content/`** | Editorial, versioned, reviewable in a PR, zero runtime cost |
| Images, video, documents | **R2** | Unchanged |
| Scores, reports, submissions, moderation, audit | **D1** (Phase 2) | Needs rows and queries |
| Player nickname, progress, badges | **localStorage** | No account required |

Existing `content/data/*.json` seeds keep their own loaders. This is additive;
there is no second competing content system.

## Types

15 types in `lib/content/schema.ts`: course, lesson, quiz, game, video, crop,
agriculture-guide, government-scheme, job, service, temple, heritage-item,
event, news, community-item.

Zod is a **devDependency** — every schema is evaluated at build time by
`scripts/validate-content.ts`, never in the browser. No runtime bytes.

## Provenance is enforced, not requested

```
source · sourceUrl · reviewer · lastVerified · notes?
```

Required on: **crop, agriculture-guide, government-scheme, job, service,
video**. A record without it fails `npm run content:validate`, which fails the
build. `reviewer` may be `null`, which means "not yet reviewed" — explicit
rather than absent.

Agriculture dosages carry their **own separate** provenance block, so a dosage
can never inherit a guide's citation. Chemical, pesticide and fertiliser
amounts are never generated: either the guide cites a specific ICAR / state
department / KVK document, or it says to consult the local KVK.

## Adding a content type

1. Define the schema in `lib/content/schema.ts`.
2. Add it to `ContentSchemas`, and to `REQUIRES_PROVENANCE` if it states facts.
3. Author files under `content/typed/<kind>/*.json`.
4. `npm run content:validate`.
5. Emit `SearchDoc`s from it so it becomes searchable.
