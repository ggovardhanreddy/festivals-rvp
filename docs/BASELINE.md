# Baseline — Measured, Not Assumed

**Date:** 2026-08-28
**Tree:** `main @ 2b8fed1` **plus the 209 uncommitted changes** (the working tree as it
stands, not the last commit)
**Rule applied:** nothing below is reported as passing unless the command was actually
run and its exit code observed.

---

## 1. How this was measured

The device's `node_modules` contains macOS `arm64` native binaries (`sharp`, `esbuild`,
`@next/swc`). The analysis environment is Linux `aarch64`, so those binaries cannot
execute and `npm ci` on the device kept being terminated.

Rather than reinstall over the working `node_modules` — which would have broken the
local macOS development setup — the audit took a **read-only snapshot** of the source
into an isolated sandbox, installed dependencies there, and ran the commands.

The snapshot mirrored the exclusions in `.github/workflows/deploy-cloudflare.yml`
(`sparse-checkout`): no `node_modules`, `.next`, `out`, `.git`, `originals`, `review`,
`inbox`, and no media binaries under `public/` or `content/`. **This is the same shape
CI builds from**, so the results are representative of a CI run rather than of a local
build with all media present.

### Environment

| | Sandbox | Your machine |
|---|---|---|
| OS | Linux aarch64 | macOS arm64 |
| Node | v22.22.2 | v22.23.2 (device VM); confirm your host with `node -v` |
| npm | 10.9.7 | 10.9.8 |
| Install | `npm ci` from committed `package-lock.json`, 488 packages, 29 s | — |
| Package manager | npm (lockfile v3) | npm |

**Caveat to re-verify locally:** because media binaries were excluded, any check that
inspects actual image or video files behaves differently. This affects exactly one
result (§ 5, validate warnings) and is flagged there.

---

## 2. Results

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | **0** | **PASS** |
| `npm run lint` | **1** | **FAIL** — 1 error, 3 warnings |
| `npm test` | **0** | **PASS** — 8 assertions |
| `npm run validate` | **0** | **PASS** — 26 warnings |
| `npm run build` | **1** | **FAIL** — network only; see § 6 |
| `npx next build` (fonts stubbed) | **0** | **PASS** — 70 pages in 31 s |

---

## 3. `npm run typecheck` — PASS

```
> tsc --noEmit
(no output)
exit 0
```

**Important qualifier.** `tsconfig.json` sets `"exclude": ["node_modules", "functions"]`.
This green result covers `app/`, `components/`, `lib/`, `scripts/` and `styles/`. It
does **not** cover the 2,273 lines under `functions/` — the authentication, session,
upload and community-write code. See § 8 for the proposed fix.

---

## 4. `npm run lint` — FAIL

```
> eslint .

/components/events/TeluguCalendar.tsx
  174:13  warning  The attribute aria-pressed is not supported by the role gridcell
                   jsx-a11y/role-supports-aria-props

/components/members/MemberEditPanel.tsx
  24:44  warning  'member' is defined but never used   @typescript-eslint/no-unused-vars

/components/members/MembersGrid.tsx
  24:10  warning  'withBase' is defined but never used @typescript-eslint/no-unused-vars

/functions/api/community/[[route]].ts
  243:20  error  'source' is never reassigned. Use 'const' instead   prefer-const

✖ 4 problems (1 error, 3 warnings)
exit 1
```

**This is the most consequential finding in the baseline.** `ci.yml` runs `npm run lint`
before anything else; a non-zero exit fails the job. **The working tree as it stands
cannot pass CI and therefore cannot be deployed.**

The error is introduced by the uncommitted work — `git show HEAD:functions/api/community/[[route]].ts`
does not contain the construct. It is a one-line fix. Details and the fix are in
`WORKING_TREE_AUDIT.md` § 5.

Note also that ESLint **does** lint `functions/`, even though TypeScript does not. That
is why a server-side issue surfaces here and not in typecheck.

---

## 5. `npm test` — PASS

```
> tsx scripts/smoke-test.ts
Running smoke tests…
  ✓ village identity is configured
  ✓ CMS albums match site buckets
  ✓ content years are valid directories
  ✓ generated albums load and have media when present
  ✓ required generated public assets exist
  ✓ no duplicate album routes
  ✓ Fun Fest paths stay on signed media API
  ✓ opaque UUID media titles are hidden from UI labels
Smoke tests passed.
exit 0
```

Eight assertions over configuration invariants. No component, integration, E2E,
accessibility or visual test exists. **0 of 68 built routes has any automated check.**

## `npm run validate` — PASS with 26 warnings

```
> tsx scripts/validate-site.ts
Running site validation…
WARN: Non-year folder in content/: _oversized
WARN: Non-year folder in content/: data
WARN: Missing media file referenced by album: /videos/2026/fun-trips/…mp4
… 23 further "Missing media file" warnings, all under fun-trips
Validation passed (26 warning(s), 21 albums, 12 years).
exit 0
```

The two `Non-year folder` warnings are benign — `_oversized` and `data` are legitimate
directories the check does not know about.

**The 24 "missing media" warnings need re-verification on your machine.** They are all
Fun Fest paths, and Fun Fest media is intentionally stripped from local `public/` and
served signed from R2 — so they are probably pre-existing and correct behaviour. But
the snapshot also excluded media, so this audit cannot fully distinguish "stripped by
design" from "missing because of the snapshot". Run `npm run validate` locally and
compare; if the same 24 appear, they are real and expected.

---

## 6. `npm run build` — FAIL (environment, not code)

```
> npm run build
… prepare:site completed: ensure-folders, sync-cms, sync-community-seeds,
  generate-logo-system, generate-ambient-music, generate-member-auth,
  generate-all, rewrite-albums-r2 — all succeeded
  "Generated SEO assets for 21 RVP Youth albums."
  "albums.json → R2 URLs (…r2.dev, 21 albums)"

▲ Next.js 16.2.12 (Turbopack)
> Build error occurred
Error: Turbopack build failed with 2 errors:
next/font: error: Failed to fetch `Playfair Display` from Google Fonts.
next/font: error: Failed to fetch `Poppins` from Google Fonts.
exit 1  (37 s)
```

The analysis sandbox's egress allowlist does not include `fonts.googleapis.com`
(confirmed: `curl` to that host returns no response, while `registry.npmjs.org`
returns 200). **This is a sandbox restriction, not a repository defect.**

To confirm nothing else was wrong, the two `next/font/google` calls in `app/layout.tsx`
were replaced with inert stubs in the sandbox copy only, and the build re-run:

```
> npx next build
✓ Compiled successfully in 12.4s
  Running TypeScript … Finished TypeScript in 14.2s
✓ Generating static pages using 1 worker (70/70) in 2.5s
  Finalizing page optimization …
exit 0  (31 s)
```

**Zero build warnings.** The build is otherwise clean.

### A real finding hidden in that failure

`next/font/google` fetches from Google Fonts **at build time**. The production build
therefore has a hard network dependency on `fonts.googleapis.com`. If Google Fonts is
unreachable during a CI run, the deploy fails. This is worth knowing before the Telugu
font work — self-hosting the font files removes the dependency entirely.

Also observed: the build logs `- Environments: .env.local`, confirming Next reads that
file during a local build. It is correctly gitignored and has never been committed.

---

## 7. Bundle observations

From the existing `out/` on the device (production build with real fonts) and confirmed
against the sandbox build. Both raw and gzipped are given, because gzip flatters the
site over the wire while raw bytes are what a low-end phone must parse. Cloudflare
serves brotli, which is slightly better than these gzip figures.

| Metric | Raw | Gzipped |
|---|---|---|
| `out/` total | 40 MB | — |
| `out/_next/` | 2.8 MB | — |
| Homepage HTML | 869 KB | 96 KB |
| Homepage JS — 13 chunks | 988 KB | 316 KB |
| Site CSS — one file, every route | 172 KB | 33 KB |
| Largest lazy chunk (Three.js / R3F) | 881 KB | — |
| Total JS in `out/_next` | 2,327 KB | — |
| `/years/` HTML | 542 KB | — |
| `/gallery/` HTML | 417 KB | — |
| `public/search-index.json` | 357 KB | 25 KB |
| Static HTML pages | 68 | — |

### The dominant cost

`app/page.tsx` calls `allMedia()`, filters to non-Fun-Fest images, and passes the whole
array to `HomeBelowFold` → `HomeGallery`, which renders 5 featured plus 19 more.

| | |
|---|---|
| Media objects serialised into the homepage | **507** |
| Media objects the homepage renders | **24** |

Each is a `MediaWithAlbum`, so the album object is repeated on every item. That single
data-flow choice accounts for most of the 869 KB. `/years/` and `/gallery/` have the
same cause. `app/[...slug]/page.tsx` already contains a `slimAlbumForClient()` helper
that does half of this job — it just is not applied on these paths.

### Things the measurement corrected

- **Minifying `search-index.json` is not worth doing.** It is pretty-printed with
  two-space indent, but gzipped that costs about 500 bytes. The cost is parsing 357 KB
  of JSON on a cheap phone, which sharding fixes and minification does not.
- **Three.js is already lazy.** The 881 KB chunk is referenced by no HTML file; it loads
  only when `InteractiveVillageMap` mounts `VillageCanvas` through `next/dynamic`.
- **Vanta is already gated on mobile** via `useAllowHeavyEffects()` in
  `lib/mobile-shell.ts`. It is not gated on `prefers-reduced-motion` or Save-Data.

---

## 8. Server typechecking — decision

### Problem

`tsconfig.json` excludes `functions/`. Removing the exclusion is not safe: Pages
Functions run on the Workers runtime, not in the browser or Node. They reference
`R2Bucket`, `KVNamespace` and other Cloudflare globals that the Next.js `tsconfig`
does not declare, and `next build` would then try to typecheck them under DOM/Node
libs and fail.

### Decision: a second, separate tsconfig

Add `tsconfig.functions.json`, leaving `tsconfig.json` untouched so the Next build is
unaffected:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "WebWorker"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["@cloudflare/workers-types"],
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["functions/**/*.ts", "lib/media-pipeline/**/*.ts", "lib/r2-catalog.ts", "lib/cms.ts"]
}
```

The `include` list must cover the `lib/` modules the Functions import — `functions/api/media/[[route]].ts`
imports `lib/r2-catalog`, `lib/cms` and `lib/media-pipeline/*`, so those are compiled in
both configurations.

Then:

```json
"typecheck": "tsc --noEmit && tsc --noEmit -p tsconfig.functions.json"
```

### Cost

One dev dependency: `@cloudflare/workers-types`. The alternative is hand-writing the
ambient declarations, which is more code to maintain for no benefit — `wrangler` is
already a dependency, so this stays within the Cloudflare toolchain.

### Expected outcome

Unknown until run. The Functions have never been typechecked, so **expect errors on the
first run.** They should be fixed as a separate, reviewed commit — not folded into the
config change.

---

## 9. Reproducing this baseline

On your machine, from a clean tree:

```bash
node -v && npm -v
npm ci
npm run typecheck
npm run lint
npm test
npm run validate
npm run build
du -sh out && find out -name '*.js' -path '*_next*' -printf '%s\n' | awk '{s+=$1} END {print s}'
```

Record the results here and note any divergence from § 2. In particular, confirm
whether the 24 validate warnings appear on a tree with full media present.
