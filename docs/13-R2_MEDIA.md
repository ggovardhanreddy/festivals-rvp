# Cloudflare R2 Media Storage

The site is hosted on **Cloudflare Pages**. Large media (gallery, videos, audio, documents) lives in **Cloudflare R2**, not in the Git / Pages deployment bundle.

## Bucket

| Setting | Value |
|---|---|
| Bucket name | `reddivaripalli` |
| Binding | `MEDIA` (see `wrangler.toml`) |
| Public URL | set via `NEXT_PUBLIC_R2_PUBLIC_URL` / `R2_PUBLIC_BASE` |

Enable public access (one-time):

```bash
npx wrangler r2 bucket dev-url enable reddivaripalli --force
# Optional production custom domain (zone must be on Cloudflare):
# npx wrangler r2 bucket domain add reddivaripalli --domain media.reddivaripalli.com --zone-id <ZONE_ID>
```

## Folder layout in the bucket

| R2 prefix | Source (local) | Notes |
|---|---|---|
| `logos/` | `public/logo/` | App icons, favicons |
| `hero/` | `public/brand/` | Festival heroes, aerials |
| `gallery/` | `public/images/` | Album photos |
| `gallery/thumbs/` | `public/thumbs/` | Thumbnails |
| `videos/` | `public/videos/` (non Fun Fest) | Public festival videos |
| `funfest/` | Fun Fest videos / images / thumbs | **Private** — signed URLs only |
| `audio/` | `public/audio/` | Ambient / album audio |
| `documents/` | `public/docs/` | **Private** docs |
| `members/` | `public/members/` | Member photos |
| `festivals/` | `public/festivals/` | Festival chapter heroes |
| `events/` | (uploads) | Event cover uploads |
| `birthdays/` | (uploads) | Birthday media uploads |
| `developments/` | (uploads) | Development project media |

## Environment variables

See `.env.example`. Never commit real credentials.

| Variable | Purpose |
|---|---|
| `R2_BUCKET` | Bucket name (`reddivaripalli`) |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public base URL (build-time, no trailing slash) |
| `R2_PUBLIC_BASE` | Same URL for Pages Functions upload responses |
| `MEDIA_SIGNING_SECRET` | HMAC secret for private signed URLs |
| `ADMIN_*` / `MEMBER_*` | Auth for upload + Fun Fest |

Set production secrets:

```bash
npx wrangler pages secret put R2_PUBLIC_BASE --project-name=festivals-rvp
npx wrangler pages secret put MEDIA_SIGNING_SECRET --project-name=festivals-rvp
npx wrangler pages secret put ADMIN_SESSION_SECRET --project-name=festivals-rvp
npx wrangler pages secret put MEMBER_SESSION_SECRET --project-name=festivals-rvp
```

## Media processing (local CMS)

`npm run sync` still converts HEIC→WebP, builds thumbs, and optimizes videos into `public/`. Then migrate to R2:

```bash
npm run media:migrate:r2:dry   # list keys
npm run media:migrate:r2       # upload + rewrite albums.json
```

The migrate script is resumable (writes `generated/r2-migration.json`) and concurrent (`R2_MIGRATE_CONCURRENCY`, default 8).

## Admin upload API

`POST /api/media/upload` (admin session) stores files in R2 with progress UI in `/admin/`.

`GET /api/media/sign?key=` returns a short-lived URL for **private** keys (`funfest/`, `documents/`) for signed-in members or admins.

## Deploy without shipping gigabytes

```bash
export NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
npm run deploy:cf
```

`deploy:cf` builds the site, strips heavy `out/images|videos|thumbs|audio|members|festivals` folders when R2 is configured, and deploys the Pages shell.

## Private content

Fun Fest and documents:

- Not listed on the public R2 CDN path for clients (signed `/api/media/*` only)
- Fun Fest HTML routes require member login (`rvp_member` cookie, HMAC-verified)
- Member password hashes live in `functions/_data/member-auth.json`

## After a successful migration

1. Confirm gallery images/videos load from the R2 domain
2. Confirm Fun Fest still requires login + signed media
3. Optionally stop committing large binaries under `public/images` and `public/videos` (keep `content/` as the CMS source of truth)
