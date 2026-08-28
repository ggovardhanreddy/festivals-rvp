# Implementation Roadmap

**Created:** Phase 0, 2026-08-28
**Status:** Phase 0 complete (documentation only). **Everything below awaits approval.**

Governing rules, applied to every phase:

1. Preserve all working functionality · 2. No rewrite without proof · 3. Prefer
incremental · 4. Reuse components, data and APIs · 5. No unnecessary dependencies ·
6. Free / open source · 7. No mandatory authentication · 8. No automatic agriculture
reminders · 9. No fabricated content · 10. No data removal · 11. Backups before
structural change · 12. Production-safe after every milestone.

---

## Phase 0 — Stabilisation · **DOCUMENTATION COMPLETE**

### What was done

Investigation and documentation only. **No code was modified, no credential rotated, no
file deleted, no history rewritten.**

| Deliverable | Contents |
|---|---|
| [SECURITY_INCIDENT.md](./SECURITY_INCIDENT.md) | 6 findings; 37 credentials exposed since 2026-08-03; remediation order |
| [GIT_HISTORY_CLEANUP.md](./GIT_HISTORY_CLEANUP.md) | 3 options with consequences; rewrite commands, unrun |
| [WORKING_TREE_AUDIT.md](./WORKING_TREE_AUDIT.md) | All 209 changes categorised; nothing discarded; 6-commit split proposed |
| [BASELINE.md](./BASELINE.md) | Real command results; lint **fails**; build clean apart from a sandbox network limit |
| [BACKUP_AND_RECOVERY.md](./BACKUP_AND_RECOVERY.md) | R2 has **no backup** — the largest data risk |
| [PRESERVED_FEATURES.md](./PRESERVED_FEATURES.md) | The preservation contract: 68 routes, 13 hard-won fixes |
| [CLIENT_COMPONENT_AUDIT.md](./CLIENT_COMPONENT_AUDIT.md) | 122 client components; 37 addressable |
| [ROUTE_MIGRATION.md](./ROUTE_MIGRATION.md) | Every existing URL unchanged; zero redirects needed |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Phase 0 addendum appended; original preserved |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Tokens, typography, logo brief, components |
| [MOBILE_UI_ARCHITECTURE.md](./MOBILE_UI_ARCHITECTURE.md) | Mobile-first spec |
| IMPLEMENTATION_ROADMAP.md | This file |

### Phase 0 remediation — approved but NOT YET EXECUTED

Nothing in this list has been done. Each needs a yes.

| # | Action | Reversible | Blocks |
|---|---|---|---|
| 0.1 | Rotate `MEMBER_SESSION_SECRET` in Cloudflare | Yes | — |
| 0.2 | Generate 37 new passwords, distribute out of band | Yes | 0.1 |
| 0.3 | Move credential store to KV or R2; `.gitignore` the files | Yes | 0.2 |
| 0.4 | Remove the `rvp-funfest-dev-secret` fallback in 3 files; fail closed | Yes | 0.1 |
| 0.5 | Fix the lint error + 3 warnings | Yes | — |
| 0.6 | Commit the 209 changes as 6 commits | Yes | 0.5 |
| 0.7 | Take the backups: git tag, mirror, R2 community snapshot, R2 media sync | Yes | — |
| 0.8 | Add `tsconfig.functions.json` + `@cloudflare/workers-types`; fix what surfaces | Yes | 0.6 |
| 0.9 | *(Optional)* Git history rewrite | **No** | 0.1–0.4 |

**Order matters.** 0.1 is the fastest containment and needs no deploy. 0.5 must precede
0.6 because CI currently fails. 0.7 must precede everything structural.

**Exit criteria:** lint green · typecheck green including `functions/` · tests green ·
build green · working tree clean · backups verified · secrets rotated · live site
unchanged in behaviour.

---

## Phase 1A — Routing + i18n

Telugu becomes a real language with real URLs.

| Workstream | Summary |
|---|---|
| Test harness first | Vitest, Playwright, axe. Route render tests, screenshot baseline for all 68 routes at 360/768/1280. Rule 12 cannot be demonstrated without this |
| Telugu route tree | `app/te/` mirroring the catch-all. **Additive** — no existing route file touched. Zero redirects |
| Message catalogue | Typed keys, namespaces, `te → en → literal` fallback. CI gate fails on a missing key |
| String extraction | ~293 hard-coded literals, migrated one component tree at a time |
| Telugu typography | Noto Sans Telugu, self-hosted, subset. Also self-host Playfair and Poppins to remove the build-time Google Fonts dependency |
| SEO | `hreflang` pairs, self-referential canonicals per language, `<html lang>`, Telugu sitemap entries |

**Dependencies:** 3 dev-only (`vitest`, `@playwright/test`, `@axe-core/playwright`) plus
`@cloudflare/workers-types` from 0.8. **Zero runtime dependencies.** No i18n library.

**Database:** none.

**Risk:** medium. The Telugu tree is additive so existing URLs cannot break; the real
risk is the string extraction touching many files at once. Mitigated by migrating per
component tree with the English literal as the fallback.

**Exit:** every existing URL still resolves · Telugu twins resolve · `lang` switches ·
Telugu renders in Noto Sans Telugu, verified by computed style · screenshot baseline green.

---

## Phase 1B — Brand, design system, homepage, mobile, search

| Workstream | Summary |
|---|---|
| Logo system | Symbol legible at 16 px; horizontal, compact, symbol-only, favicon, touch icon, social banner |
| Token extension | New semantic tokens; sync the CSS/TS radius mismatch; `--text-scale` |
| Stylesheet split | `globals.css` → base/layout/components/motion/pages. **Pure move — accepted only if compiled CSS is byte-identical**, then changes separately |
| Component library | 7 primitives → ~30. Existing seven extended, not rewritten |
| Desktop homepage | Hero → search → doors → explore → today → learning → games → agriculture → community → heritage |
| Mobile homepage | Per `MOBILE_UI_ARCHITECTURE.md`. Short hero, search first, 5-item bottom nav, More sheet |
| Universal search | Typed `SearchDoc` schema, scored matcher, Telugu bigrams, transliteration boost, sharding wired |
| Performance | Serialise only what renders — the 507→40 fix. Route CSS. Extend the effects gate to reduced-motion and Save-Data. Budget gate in CI |
| Accessibility | Text-size control, contrast pass, motion audit, axe green on all routes |

**Risk:** the highest of any phase — it is the visible redesign. Mitigated by the Phase 1A
screenshot baseline, by the byte-identical CSS rule, and by carrying the 13 hard-won
mobile fixes **verbatim** rather than reimplementing them.

**One decision needed:** `HomeHero.tsx` and `lib/site.ts` both state the hero is
*permanently locked* to Vanta Birds. The redesign puts search and doors on that surface.
Work within the lock, or lift it?

**Exit:** homepage HTML < 150 KB raw · homepage JS < 220 KB gzipped · per-route CSS <
60 KB · zero serious/critical axe violations · all 68 routes visually reviewed.

---

## Phase 2 — Kids and Games

Highest delight, lowest risk: no external data, no accuracy exposure.

Reusable quiz engine and game shell · nickname entry, local progress · Sudoku, memory,
maths, word and vocabulary games, science/geography/GK quizzes · points, levels, badges,
streaks · daily challenge seeded by date · Kids World with age bands and curated content
only.

**D1 arrives here** for aggregate counters and the reports queue. Player progress stays
in `localStorage` — no account, ever.

**Guardrails:** no chat, no open recommendation feed, no data collection beyond a
nickname, no gambling mechanics, no purchases, no manipulative engagement loops.

---

## Phase 3 — Learning

Course / lesson / quiz schema and the build-time indexer · "start from zero" tracks with
prerequisites · English beginner → intermediate → advanced with Telugu explanations · IT
and Engineering tracks · Career centre · progress and badges in local storage.

This is where the content layer proves itself, and where the per-section route tree
finally earns its keep — **the proof for rule 2 arrives here**, not earlier.

---

## Phase 4 — Agriculture and Weather

Slowest and most reviewed, because the accuracy risk is real.

Crop database with **mandatory provenance** — a guide without `source`, `sourceUrl`,
`reviewer` and `lastVerified` fails the build · deterministic on-demand guidance over
crop × stage × season × water × weather · Telugu-first content reviewed by someone who
farms locally · weather via Open-Meteo, village default, no precise coordinate storage.

**Hard rules enforced at review:** no automatic reminders, ever. No generated pesticide,
fertiliser or chemical dosages, ever. Image analysis returns "possible matches, get this
confirmed", never a diagnosis.

**Blocker:** Phase 4 does not start without a named local reviewer.

---

## Phase 5 — Community, Civic, Easy Mode

Temples and heritage expanded with audio, slokas and bilingual explanations ·
achievements with moderation · local services and emergency contacts, verified only ·
government schemes with eligibility, documents, official source and last-verified date ·
digital literacy and scam awareness · **Easy Mode** — large type, large targets, Telugu,
read-aloud · "Report incorrect information" on every content page with an admin queue.

Mostly upgrades to what already exists.

---

## Phase 6 — AI and Voice

Optional layer. **The platform must work fully with it switched off.**

Voice input and read-aloud via the Web Speech API, feature-detected · "Ask
Reddivaripalli" as retrieval over platform content, always showing sources · refuses
rather than guesses when nothing is retrieved · local, non-personal recommendations from
device activity only.

---

## Phase 7 — Production hardening

Continuous, not a final sprint.

Security review and tightened CSP (possible once the Vanta CDN dependency is resolved) ·
rate limiting on every write path · performance and accessibility budgets in CI · SEO for
both languages · a **tested** backup restore · content verification sweep with every
factual record re-checked and dated.

---

## Sequence at a glance

```
Phase 0  ██ documentation complete · remediation awaiting approval
   │
   ├── 0.1 rotate secret ──── 0.2 new passwords ──── 0.3 move store
   ├── 0.5 fix lint ───────── 0.6 commit 209 ─────── 0.8 typecheck functions
   └── 0.7 backups (do first)
   │
Phase 1A  routing + i18n          ← test harness lands here
Phase 1B  brand + design + homepage + mobile + search
Phase 2   kids + games            ← D1 arrives
Phase 3   learning                ← route tree earns its keep
Phase 4   agriculture + weather   ← needs a named reviewer
Phase 5   community + civic + easy mode
Phase 6   ai + voice              ← optional
Phase 7   hardening               ← continuous
```

---

## Decisions required before Phase 1A

| # | Decision | Recommendation |
|---|---|---|
| 1 | Approve Phase 0 remediation 0.1–0.8? | Yes. 0.1 and 0.7 today |
| 2 | How are 37 new passwords distributed? | In person or direct message. Never committed |
| 3 | Approve the 6-commit split of the 209 files? | Yes, after the one-line lint fix |
| 4 | Git history rewrite — Option A, B or C? | **A** (leave history, rotate instead). B is optional hygiene |
| 5 | English at `/`, Telugu at `/te/`? | Yes. The reverse costs a full re-index for a symbolic gain |
| 6 | Is the Vanta homepage hero lock lifted? | Needed before Phase 1B |
| 7 | Approve 4 dev dependencies, 0 runtime? | Yes. Rule 12 is otherwise unverifiable |
| 8 | Who reviews agriculture content locally? | Needed before Phase 4 |
| 9 | Where is `ios/VillageSuperAdmin/`? | Referenced in docs and `.gitignore`, absent from the repo |
| 10 | Commit the 168 Jathara media, or migrate to R2 first? | R2 first — `.git` is already 2.1 GB |

**Phase 1A does not start until these are answered.**
