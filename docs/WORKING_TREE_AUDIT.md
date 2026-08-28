# Working Tree Audit — 209 Uncommitted Changes

**Date:** 2026-08-28
**Baseline:** `main @ 2b8fed1`
**Total:** 209 entries — 33 modified, 1 deleted, 175 untracked
**Status:** Categorised. **Nothing has been discarded, reset, stashed or committed.**

> Note: this audit itself adds files under `docs/`. After Phase 0 the untracked count
> rises by the number of documents created. Those additions are listed in § 7 so the
> change in the number is never mistaken for movement in your work.

---

## 1. Verdict first

The working tree is **not** a pile of accidental edits. It is one coherent, nearly
complete body of work with a clear theme:

> R2-backed community collections, shared admin authentication with bearer-token
> support for a native app, silent PWA updates, an edge proxy for member photos, and
> the 2026 Devapatlamma Jathara photo set.

It matches the direction of the last few commits on `main` (`e8cf378 Fix Members blank
load on iOS/Android PWA`, `8cda16d Add Devapatlamma Jathara 2026 photos`).

**Recommendation: keep all of it.** One lint error must be fixed before it can be
committed (§ 5). Nothing here should be deleted.

---

## 2. Categories

| Category | Count | Recommendation |
|---|---|---|
| A — Intended feature work (source) | 26 | **Keep.** Commit as a feature set |
| B — New files completing that work | 7 | **Keep.** Required by category A |
| C — Real content (2026 Jathara media) | 168 | **Keep.** Irreplaceable village photos |
| D — Build artefacts, regenerated every build | 5 | **Keep**, but see § 6 — they should arguably not be tracked at all |
| E — Documentation updates | 3 | **Keep.** They describe category A |
| F — Editor / tooling config | 1 | **Decide.** `.cursor/` — personal preference |
| G — Secrets | 0 | Nothing to do |
| H — Accidental or unexplained | 0 | Nothing found |

**No secrets are introduced by any change in the working tree.** A pattern scan across
the full diff and every untracked source file found only references to environment
variable *names*, never values.

---

## 3. Category A — Intended feature work (26 modified files)

### A1 · Community API moves to R2 with git seed fallback

| File | Change |
|---|---|
| `functions/api/community/[[route]].ts` | +126/−… — seed-and-self-heal, approval collections, admin-write gating |
| `functions/_data/community-seeds.ts` | **new**, 24 KB — git seed baked in for the Function |
| `scripts/sync-community-seeds.ts` | **new** — generates the above from `content/data/*.json` |
| `lib/community.ts` | +2 |
| `lib/use-community.ts` | +31/−… — client hook aligned to the new response shape |
| `package.json` | 1 line — adds `sync-community-seeds` to `prepare:site` |

**Why it matters:** this is what makes the community collections survive an empty R2
bucket. It closes a real failure mode.

### A2 · Shared admin auth + bearer tokens

| File | Change |
|---|---|
| `functions/_lib/admin-auth.ts` | **new** — extracted `hmacSign`, `verifyAdminToken`, `mintAdminToken`, `resolveAdminSession` |
| `functions/_lib/audit.ts` | **new** — append-only admin audit log |
| `functions/api/admin/[[route]].ts` | −88 net — duplicated crypto removed, now imports the shared module |
| `functions/api/media/[[route]].ts` | −67 net — same consolidation |

Login now also returns `{ token, expiresAt }` so a native client can send
`Authorization: Bearer`. `docs/AUTHENTICATION.md` in this same working tree references
`ios/VillageSuperAdmin/` — an iOS app that does not exist in this repository. Worth
confirming whether it lives elsewhere.

**This is a net reduction of ~155 lines with no loss of function.** Good work; keep it.

### A3 · Member photo edge proxy

| File | Change |
|---|---|
| `functions/_middleware.ts` | +52 — serves `/members/*.webp` from R2 as a same-origin 200 instead of a redirect |
| `lib/member-image.ts` | +10 |
| `lib/media-url.ts` | +13 |
| `lib/member-stats.ts` | +1 |
| `components/members/MembersGrid.tsx`, `MemberEditPanel.tsx`, `admin/MembersManager.tsx` | small |

The middleware comment explains it: *"Old PWAs still request `/members/*.webp`;
redirects break under the SW."* This is a fix for a live bug affecting installed apps.

### A4 · Silent PWA updates

| File | Change |
|---|---|
| `components/pwa/ServiceWorkerManager.tsx` | −30/+… — prompt replaced with silent apply |
| `components/pwa/UpdateAvailablePrompt.tsx` | **deleted** (105 lines) |
| `lib/pwa-update.ts` | +18 |
| `public/sw.js` | +7 |
| `app/globals.css` | −27 — the prompt's styles, with the comment "Update prompts removed — PWA refreshes silently" |

**The single deletion in the working tree is here.** It is deliberate: the component is
no longer referenced by anything. Verified — no import of `UpdateAvailablePrompt`
remains.

### A5 · Live calendar bridge

| File | Change |
|---|---|
| `lib/live-calendar.tsx` | **new** |
| `components/calendar/LiveCalendarBridge.tsx` | **new** |
| `components/Providers.tsx` | +12 — mounts the bridge with member/event/announcement seeds |
| `components/events/EventsBirthdaysHub.tsx` | +25 |
| `components/home/TodayBirthdays.tsx`, `UpcomingBirthdays.tsx`, `HomeBelowFold.tsx` | small |
| `lib/types.ts` | +10 |

### A6 · Miscellaneous

| File | Change |
|---|---|
| `components/SiteHeader.tsx` | +10 |
| `scripts/generate-all.ts` | +5 — sitemap gains `lastmod` and `priority` |
| `.gitignore` | +5 — iOS / Xcode ignore rules |

---

## 4. Category C — 168 untracked media files

| | |
|---|---|
| `public/images/2026/devapatlamma-jathara/` | 112 files |
| `public/thumbs/2026/devapatlamma-jathara/` | 56 files |
| Total size | 17.8 MB |
| Format | `.webp`, UUID-named (matches the existing media pipeline convention) |

These are optimised outputs from `scripts/sync-cms.ts` for the 2026 Devapatlamma
Jathara. The album is already live — `generated/albums.json` and `public/sitemap.xml`
both reference `/devapatlamma-jathara/2026/`.

**These are village photographs. Do not delete them under any circumstance.**

Note that they belong in R2, not in git: the deploy workflow's sparse checkout
explicitly excludes `public/images/**` and `public/thumbs/**`, and
`npm run media:migrate:r2` exists for exactly this. Committing them to git works but
adds 17.8 MB to a repository whose `.git` is already 2.1 GB.

**Suggested:** run `npm run media:migrate:r2` to push them to R2, then decide whether to
commit the local copies. Either way, keep the files until they are confirmed in R2.

---

## 5. Blocker — the working tree currently fails lint

Measured, not assumed. `npm run lint` on the working tree:

```
functions/api/community/[[route]].ts
  243:20  error  'source' is never reassigned. Use 'const' instead  prefer-const

✖ 4 problems (1 error, 3 warnings)
```

The offending line:

```ts
let { items, source } = await readItemsWithSeed(env, collection);
```

`items` is reassigned four lines later; `source` never is. The construct does not exist
in the `HEAD` version of this file, so **this error is introduced by the uncommitted
work**.

**Consequence:** `.github/workflows/ci.yml` runs `npm run lint` and fails the build on a
non-zero exit. As it stands, this working tree cannot pass CI.

**Fix:** one line —

```ts
const { items: seeded, source } = await readItemsWithSeed(env, collection);
let items = seeded;
```

The three warnings do not fail the build but should be cleaned in the same commit:

| File | Warning |
|---|---|
| `components/events/TeluguCalendar.tsx:174` | `aria-pressed` not supported by role `gridcell` — a real accessibility defect |
| `components/members/MemberEditPanel.tsx:24` | unused `member` |
| `components/members/MembersGrid.tsx:24` | unused `withBase` |

---

## 6. Category D — build artefacts tracked in git

| File | Why it changed |
|---|---|
| `public/version.json` | `buildId` `mseja2yt` → `msewyq1b`, timestamp |
| `lib/build-id.ts` | same build id, auto-generated |
| `public/sw.js` | cache name embeds the build id |
| `public/sitemap.xml` | regenerated; also gains `lastmod`/`priority` from the A6 change |
| `functions/_data/member-auth.json` | **only** the `generatedAt` timestamp changed — no credential changed |

These are outputs of `npm run build`, committed to the repository. That means every
local build dirties the tree, which is a large part of why 209 accumulated.

**Observation, not a Phase 0 action:** these four artefacts are regenerated by
`prepare:site` on every CI run before deploy, so tracking them adds churn without
adding value. `generated/*` is already gitignored with an exception for `albums.json`;
the same treatment would suit these. Raise in Phase 1.

---

## 7. Category F — `.cursor/`

One untracked directory, 4 KB, Cursor editor configuration. Personal tooling preference.
Either commit it or add `.cursor/` to `.gitignore`. **Your call — no impact either way.**

---

## 8. Files added by this Phase 0 audit

New, untracked, created by the audit itself:

```
docs/SECURITY_INCIDENT.md
docs/GIT_HISTORY_CLEANUP.md
docs/WORKING_TREE_AUDIT.md
docs/BASELINE.md
docs/BACKUP_AND_RECOVERY.md
docs/PRESERVED_FEATURES.md
docs/CLIENT_COMPONENT_AUDIT.md
docs/ROUTE_MIGRATION.md
docs/DESIGN_SYSTEM.md
docs/MOBILE_UI_ARCHITECTURE.md
docs/IMPLEMENTATION_ROADMAP.md
```

`docs/ARCHITECTURE.md` already existed and was **appended to**, not replaced. Its
original content is intact above the appended section.

No other file in the repository was modified by this audit.

---

## 9. Proposed commit sequence — REQUIRES APPROVAL

Six commits, each independently revertable, in dependency order:

| # | Scope | Files |
|---|---|---|
| 1 | Fix the lint error and three warnings | 4 files |
| 2 | Shared admin auth + audit log + bearer tokens | `functions/_lib/*`, `functions/api/admin`, `functions/api/media`, `docs/AUTHENTICATION.md`, `docs/API_REFERENCE.md` |
| 3 | R2 community collections with git seed | `functions/api/community`, `functions/_data/community-seeds.ts`, `scripts/sync-community-seeds.ts`, `lib/community.ts`, `lib/use-community.ts`, `package.json` |
| 4 | Member photo edge proxy | `functions/_middleware.ts`, `lib/member-image.ts`, `lib/media-url.ts`, `lib/member-stats.ts`, 3 components |
| 5 | Silent PWA update + live calendar bridge | PWA files, `lib/live-calendar.tsx`, `components/calendar/`, `Providers.tsx`, events/home components, `app/globals.css`, `docs/PWA.md` |
| 6 | 2026 Devapatlamma Jathara media + regenerated artefacts | 168 media files, `sitemap.xml`, `version.json`, `build-id.ts`, `sw.js`, `.gitignore` |

After each commit: `npm run typecheck && npm run lint && npm test && npm run validate`.
After commit 6: full build and a preview deploy before `main`.

**Nothing will be committed until you approve this split.**
