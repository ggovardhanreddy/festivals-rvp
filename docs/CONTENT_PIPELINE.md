# Content pipeline

How routine updates (members, gallery media, festivals) stay **data-driven** — edit JSON/media, not app code.

Live: [https://www.reddivaripalli.com](https://www.reddivaripalli.com)  
Stack: Next.js static export → Cloudflare Pages + R2 · GitHub Actions deploy · Git folder CMS

---

## Architecture (what already works)

```text
content/data/members.json          ← members seed (Git SSOT)
content/<YEAR>/<album>/…           ← festival media originals (Git CMS)
        │
        ▼  npm run prepare:site  (every build / CI)
ensure-folders → sync-cms → logos → music → member-auth → generate-all → rewrite-albums-r2
        │
        ├─ generated/albums.json   (committed fallback for sparse CI)
        ├─ functions/_data/member-auth*  (Fun Fest hashes from members.json)
        └─ public/version.json, search-index, sitemap, sw.js, lib/build-id.ts
        │
        ▼
next build → out/ → media:strip-local → wrangler pages deploy
        │
        ▼ runtime
R2 MEDIA bucket: gallery/, videos/, festivals/, members/, community/*.json, catalog/albums.json
Pages Functions: /api/community/*, /api/media/*, /api/auth/*, /api/admin/*
```

---

## 1. Members — single source of truth

| Layer | Path | Role |
|---|---|---|
| **Git seed (canonical for builds)** | `content/data/members.json` | Roster imported by Members page, directory enrichment, birthdays helpers, search index, homepage stats, Fun Fest auth generation |
| **Live overlay** | R2 `community/members.json` via `PUT /api/community/members` | Admin Save updates production without a code deploy; client merges with seed (`mergeMemberRosters`) |

**How to edit members**

1. **Preferred for durable / offline / Fun Fest logins:** edit `content/data/members.json` in Git → push `main` → Actions deploy regenerates auth + search index.
2. **Quick live fix:** Admin → Members → Save (writes R2). Photos upload via `/api/media/upload` (`members/` category).
3. After Admin-only R2 edits, sync important changes back into the Git seed when you can, so the next cold build matches production.

**Fun Fest credentials**

- Generated every build by `scripts/generate-member-auth.ts` from **only** `content/data/members.json` (no separate login table).
- Initial password = assigned username (first-name style). Existing hashes are **kept** unless the username changes or you run `npm run auth:members:force`.
- Admin R2 roster changes do **not** by themselves add Fun Fest logins — commit the seed (or force-regenerate after updating the seed).

Constant: `MEMBERS_SEED_PATH` in `lib/members.ts`.

---

## 2. Gallery — Festival → Year → Media

UI: `GalleryHub` (Festival → Year → media). Data: `generated/albums.json` (often rewritten to absolute R2 URLs).

### Adding a festival / year

1. Create `content/<YEAR>/<album>/` where `<album>` is one of the CMS buckets in `lib/cms.ts` (`vinayaka-chavithi`, `sankranthi`, …).
2. Drop images/videos (HEIC/MOV OK locally — sync converts).
3. Optional `metadata.json` for title/cover overrides.
4. Run locally: `npm run sync` → `npm run media:migrate:r2` → push (or push and migrate from a machine with Wrangler auth).
5. **Festival chapter heroes** live at `public/festivals/<folder>/hero.webp` (and R2 `festivals/…`).  
   **Never overwrite `hero.webp` via Admin upload** — the media API rejects protected hero keys.

### Auto gallery from R2 (CI / sparse checkout)

When local media is empty, `scripts/sync-cms.ts` discovery order:

1. Fetch public R2 **`catalog/albums.json`** (written by Admin **Reindex gallery** / `POST /api/media/reindex`)
2. Else list R2 via S3 API if `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` + account id are set
3. Else **preserve** committed `generated/albums.json`

Hero preservation: discovery never treats `festivals/*/hero.webp` as album frames; merge keeps previous festival-hero covers when present.

---

## 3. Media upload pipeline

| Path | When to use | Conversion |
|---|---|---|
| Local import (`npm run admin:api` + Admin “Import folder”) | Bulk HEIC/MOV from disk | HEIC→WebP, video→MP4, originals kept under `originals/` |
| Admin **Upload to R2** | Production browser upload | No Worker-side HEIC convert — prefer WebP/JPEG/MP4; HEIC/MOV stored + optional `originals/` copy |
| `npm run media:migrate:r2` | Push local `public/` derivatives to R2 | Uses Wrangler |

**Structured uploads (discoverable):** set **Year** + **Festival/album** in Admin Media tab so keys look like:

- `gallery/2026/vinayaka-chavithi/<file>`
- `videos/2026/sankranthi/<file>`

Flat `gallery/<timestamp>-file` uploads are **not** auto-indexed into Festival→Year until re-uploaded with year/album or migrated into that layout.

**After upload:** click **Reindex gallery** (`POST /api/media/reindex`) → writes `catalog/albums.json` on R2 → optionally `repository_dispatch` `content-sync` → Actions rebuild/deploy.

Thumbnails: produced by local `sync-cms` (600px WebP). Browser R2 upload does not generate thumbs; reindex will use a thumb key if `gallery/thumbs/…` already exists.

---

## 4. Auto deployment

Workflow: **`.github/workflows/Deploy Cloudflare Pages`** → file `deploy-cloudflare.yml`

| Trigger | Behavior |
|---|---|
| Push to `main` | Validate `content/data/*.json` → `npm run build` (full prepare:site) → strip → `wrangler pages deploy` |
| `workflow_dispatch` | Same (manual) |
| `repository_dispatch` type `content-sync` | Same (Admin reindex / automation) |

Content paths are **not** excluded — any `main` push deploys (including `content/**`, `data/**`, `generated/**`, `public/members/**`).

**Actions secrets**

| Secret | Required | Purpose |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Yes | Pages deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Account + optional R2 list |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Optional | Live R2 list during sync when catalog missing |
| `R2_BUCKET` | Optional | Default `reddivaripalli` |

**Variable:** `NEXT_PUBLIC_R2_PUBLIC_URL`

**Pages Function secrets (dashboard / wrangler):** `ADMIN_*`, `MEMBER_SESSION_SECRET`, `MEDIA_SIGNING_SECRET`, `R2_PUBLIC_BASE`, optional `GITHUB_DISPATCH_TOKEN` + `GITHUB_REPO` for Admin-triggered deploys.

Version: `public/version.json` + footer “Build …” (`lib/build-id.ts`).

---

## 5. Admin vs Git — what is automatic

| Change | Automatic after… | Still needs |
|---|---|---|
| Edit `content/data/members.json` + push | Deploy: auth, search, seed pages | — |
| Admin Save members (R2) | Live merge on site | Git seed update for Fun Fest / cold builds |
| Git `content/<YEAR>/<album>/` + migrate R2 + push | Gallery via albums.json | Local sync + R2 migrate when adding binaries |
| Admin R2 upload with year/album + Reindex | `catalog/albums.json`; deploy if dispatch configured | Structured path; WebP/MP4 preferred |
| Festival `hero.webp` | — | Git / intentional R2 put only (API blocks overwrite) |
| Events / other `content/data/*.json` | Deploy on push | — |

---

## 6. Backup / restore

- **Community JSON:** Admin → Backup tab (see [BACKUP_AND_RESTORE.md](./BACKUP_AND_RESTORE.md)).
- **Album CMS:** Git history + committed `generated/albums.json`.
- **Media binaries:** R2 bucket (enable versioning in Cloudflare if desired); local `content/` / `originals/` remain the offline master for many albums.
- **Catalog:** R2 `catalog/albums.json` after reindex.

---

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)
- [GALLERY_GUIDE.md](./GALLERY_GUIDE.md) · [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) · [AUTHENTICATION.md](./AUTHENTICATION.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md) · [API_REFERENCE.md](./API_REFERENCE.md) · [DATABASE.md](./DATABASE.md)

## Honest limitations

- Workers **cannot** HEIC→WebP; use local import or export JPEG/WebP before Admin upload.
- Flat Admin uploads without year/album are not Festival→Year indexed until reindexed from structured keys.
- Fun Fest auth tracks the **Git seed**, not R2-only members.
- Without `catalog/albums.json` and without R2 list secrets, CI **preserves** the last committed `generated/albums.json` (does not invent new albums from thin air).
