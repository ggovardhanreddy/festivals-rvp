# Security Incident Record — Phase 0

**Opened:** 2026-08-28
**Baseline commit:** `main @ 2b8fed1`
**Status:** Documented. **No remediation performed.** Awaiting approval.
**Author:** Phase 0 audit

> This document records what was found. Nothing in it has been fixed. No credentials
> have been rotated, no secrets changed, no history rewritten. Every item below is
> still live as of the timestamp above.

---

## 1. Summary

| # | Finding | Severity | Exposure |
|---|---|---|---|
| S-1 | 37 Fun Fest member credentials committed to a **public** GitHub repository | **Critical** | Public since 2026-08-03 |
| S-2 | Hardcoded session-secret fallback `rvp-funfest-dev-secret` in 3 server files | **Critical** | Public; exploitable only if env secrets are unset |
| S-3 | Server code (`functions/`) excluded from TypeScript checking | High | 2,273 lines of auth/upload code unverified |
| S-4 | CSP permits `'unsafe-inline'` scripts and two third-party CDNs | Medium | Reduces XSS protection |
| S-5 | Infrastructure identifiers committed (R2 public bucket URL, KV namespace id) | Low | Not secrets, but aid enumeration |
| S-6 | Personal data of named villagers published without a recorded consent trail | Medium | Editorial choice; needs process, not a fix |

`.env.local` has **never** been committed. Verified: the only env file in the entire
history of all 106 commits is `.env.example`, which contains placeholders only.

---

## 2. S-1 — Public member credentials

### What is exposed

Two tracked files:

- `functions/_data/member-auth.json`
- `functions/_data/member-auth-data.ts` (compiled from the JSON, imported by the Pages Function)

Each record contains:

```
memberId, username, name, passwordHash ("pbkdf2:<salt>:<hash>"), updatedAt
```

**37 member accounts.** Usernames and their corresponding hashes sit in the same
file, in the same record.

### Why the hashing does not save this

`scripts/generate-member-auth.ts` line 3:

```
Initial password = case-sensitive username.
```

and line 73:

```ts
passwordHash: hashPassword(username)
```

Any account whose password has never been changed can be confirmed offline by
hashing the username in the same record with the salt in the same record. PBKDF2 at
100,000 iterations makes brute-forcing an *unknown* password slow; it does nothing
when the plaintext is printed beside the hash.

Whether any member has changed their password since is unknown — the file records
`updatedAt` but not whether the value is still the generated default. All 37
`updatedAt` values are `2026-08-02T16:03:46Z`, one second apart, which is the
signature of a single generation run. **Treat all 37 as compromised.**

### Confirmed publicly readable

The repository `github.com/ggovardhanreddy/festivals-rvp` is public. The file
`functions/_data/member-auth.json` was fetched over the public web during this audit
and returned its contents.

### Exposure window

| | |
|---|---|
| First committed | `6c403c9` — "Release 1.1.0: community portal, R2 media, Super Admin, members directory." |
| Date | 2026-08-03 |
| Commits since | 74 |
| Commits touching `member-auth.json` | 15 |
| Commits touching `member-auth-data.ts` | 4 |
| Accounts affected | 37 |

Because the file has been rewritten 15 times, **removing it from the current tree does
not remove it from history.** See `GIT_HISTORY_CLEANUP.md`.

### What Fun Fest access grants

A valid member session (`rvp_member` cookie, 7-day TTL) grants:

- The `/fun-trips/` gallery pages
- Signed URLs for private Fun Fest media via `/api/media/sign`
- Object streaming via `/api/media/object`
- The `/chat/` page (note: chat is `localStorage`-only, so no other member's messages are readable)

It does **not** grant admin rights. Admin is a separate credential (`ADMIN_PASSWORD_HASH`,
set as a Cloudflare Pages secret, not in the repo).

### Recommended remediation — NOT YET PERFORMED

Order matters. Steps 1–2 close the hole; 3–5 prevent recurrence.

1. **Rotate `MEMBER_SESSION_SECRET`** in Cloudflare Pages → Settings → Environment
   variables. This invalidates every existing `rvp_member` cookie immediately and is
   the single fastest containment action.
2. **Set new per-member passwords.** Do not regenerate from usernames. Generate random
   passphrases, distribute them out of band (in person or by direct message), and never
   commit them.
3. **Move the credential store out of git.** Options, in order of preference:
   - Cloudflare KV (`RATE_LIMIT` namespace already exists; add a `MEMBER_AUTH` namespace)
   - An R2 object under `auth/members.json`, read by the Function like `community/*.json` already is
   - A Pages secret holding the whole JSON, if the roster stays small
4. **Add both files to `.gitignore`** and remove them from the working tree.
5. **Purge from history** — see `GIT_HISTORY_CLEANUP.md`. Requires explicit approval.

### Interim mitigation if rotation must wait

Setting `MEMBER_SESSION_SECRET` to a fresh value is a one-field change in the Cloudflare
dashboard and requires no deploy. It should be done regardless of when the fuller
remediation happens.

---

## 3. S-2 — Hardcoded session-secret fallback

The literal `"rvp-funfest-dev-secret"` appears in three places, in both `HEAD` and the
working tree:

| File | Line (HEAD) | Line (working tree) |
|---|---|---|
| `functions/_middleware.ts` | 58 | 73 |
| `functions/api/auth/_shared.ts` | 95 | 95 |
| `functions/api/media/[[route]].ts` | 278 | 251 |

All three follow the same pattern:

```ts
env.MEMBER_SESSION_SECRET || env.ADMIN_SESSION_SECRET || "rvp-funfest-dev-secret"
```

### Why this matters

If both `MEMBER_SESSION_SECRET` and `ADMIN_SESSION_SECRET` are ever unset on a
deployment — a new preview environment, a misconfigured branch deploy, a secret
accidentally cleared — the signing key becomes a string published on GitHub. Anyone can
then mint a valid member cookie with a forged payload and read private Fun Fest media.

The code **fails open**. It should fail closed.

### Recommended remediation — NOT YET PERFORMED

Replace the fallback with an explicit failure:

```ts
const secret = env.MEMBER_SESSION_SECRET || env.ADMIN_SESSION_SECRET;
if (!secret) return json({ error: "Server not configured" }, 503);
```

`functions/api/admin/[[route]].ts` already does exactly this for the admin path
(`if (!env.ADMIN_SESSION_SECRET) return null`), so the safe pattern already exists in
the codebase and only needs applying consistently.

Note this must ship **together with** confirming the secrets are set in production,
or the Fun Fest area will return 503.

---

## 4. S-3 — Server code is not typechecked

`tsconfig.json`:

```json
"exclude": ["node_modules", "functions"]
```

`npm run typecheck` therefore never inspects the 2,273 lines under `functions/` that
handle authentication, session verification, media upload, R2 writes and the community
API. Confirmed by running the command — it passes, and it passes without reading any of
that code.

See `ARCHITECTURE.md` § "Server typechecking decision" for the proposed fix.

---

## 5. S-4 — Content Security Policy

`public/_headers`:

```
script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'
           https://cdn.jsdelivr.net https://cdnjs.cloudflare.com
```

`'unsafe-inline'` is required by the inline theme-bootstrap script in `app/layout.tsx`.
The two CDN entries are required by `components/vanta/VantaBackground.tsx`, which loads
Vanta effect bundles from `cdn.jsdelivr.net` at runtime.

This cannot be tightened without either nonce-ing the inline script (possible) or
removing the Vanta CDN dependency (a visual change). Deferred; recorded here so the
constraint is not forgotten.

Everything else in the header set is sound: HSTS with preload, `nosniff`,
`X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `base-uri 'self'`,
and a `Permissions-Policy` that scopes geolocation to same-origin and disables
microphone and camera.

---

## 6. S-5 — Committed infrastructure identifiers

Not secrets, but they are public and they narrow an attacker's search:

| Identifier | Location |
|---|---|
| `https://pub-f2609804d6a040368903177488b01d2d.r2.dev` | `lib/media-url.ts:12`, `functions/_middleware.ts:21`, `.github/workflows/deploy-cloudflare.yml:54` |
| KV namespace id `624eb2d060674aa586550f67487e5adb` | `wrangler.toml:14-15` |
| `SUPER_ADMIN_USERNAME=Govardhan` | `.env.example`, and as the default in `functions/_lib/admin-auth.ts` |
| Google Search Console token | `public/googled76649c26b0af13c.txt`, `functions/_middleware.ts` |

The R2 public URL is intentionally public — media is served from it. The KV id is not
usable without account credentials. The admin username being known reduces the login to
a single-factor password guess, which the KV rate limiter (5 failures / 15 minutes)
partly compensates for.

**No action required.** Recorded for completeness.

---

## 7. S-6 — Personal data

`content/data/members.json` (37 people) and `content/data/directory.json` publish real
names, professions, designations and photographs of identifiable private individuals,
including doctors and government employees. `content/data/village-heritage.json`
(28 KB) includes farmer names and memorial entries.

This is a legitimate and deliberate choice for a village community archive, and it is
not being flagged as a defect. It becomes a process gap as the platform grows into
student achievements, farmer profiles and a children's area.

**Recommended before Phase 5:** a written consent record per published individual, and
a visible takedown route. Not a Phase 0 action.

---

## 8. Incident handling notes

### Something this audit created and then removed

To run the baseline build in an isolated environment, this audit created a temporary
snapshot archive at `.tmp/rvp-baseline.tgz`. That archive inadvertently included a copy
of `.env.local`. It was zeroed and deleted, and the extracted copy in the analysis
sandbox was destroyed. `.tmp/` is gitignored, so it was never at risk of being
committed. No secret left the machine or the analysis sandbox. Recorded here for
completeness rather than because it changed the risk picture.

### What has NOT been done

- No credential rotated
- No password reset
- No secret changed
- No git history rewritten
- No file deleted from the repository
- No code modified

---

## 9. Open questions for the owner

1. Approve rotation of `MEMBER_SESSION_SECRET`? This signs out every Fun Fest member.
2. How will 37 new passwords be distributed? (In person, WhatsApp direct message, other?)
3. Approve moving the credential store to KV or R2?
4. Approve git history rewrite? See `GIT_HISTORY_CLEANUP.md` for what it costs.
5. Has any member reported unexpected access to Fun Fest content? (No evidence of abuse
   was found, but nothing in the current setup logs member logins, so absence of
   evidence is weak here — see `functions/_lib/audit.ts`, which records admin actions only.)
