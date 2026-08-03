# Cloudflare R2

Large gallery/video/audio/document files are stored in **Cloudflare R2**. Pages hosts the app shell only.

## Bucket

| Setting | Value |
|---|---|
| Bucket name | `reddivaripalli` |
| Binding | `MEDIA` ([`wrangler.toml`](../wrangler.toml)) |
| Public base | `NEXT_PUBLIC_R2_PUBLIC_URL` / `R2_PUBLIC_BASE` |

Enable public access (one-time):

```bash
npx wrangler r2 bucket create reddivaripalli   # if needed
npx wrangler r2 bucket dev-url enable reddivaripalli --force
# Optional custom domain (zone on Cloudflare):
# npx wrangler r2 bucket domain add reddivaripalli --domain media.reddivaripalli.com --zone-id <ZONE_ID>
```

CI currently falls back to a known public `r2.dev` URL when the repo variable is unset (see `deploy-cloudflare.yml`). Prefer setting `vars.NEXT_PUBLIC_R2_PUBLIC_URL` explicitly.

## Object prefixes

| R2 prefix | Typical source | Notes |
|---|---|---|
| `logos/` | `public/logo/` | Icons / favicons |
| `hero/` | `public/brand/` | Heroes / aerials |
| `gallery/` | `public/images/` | Album photos |
| `gallery/thumbs/` | `public/thumbs/` | Thumbnails |
| `videos/` | public festival videos | Public |
| `funfest/` | Fun Fest media | **Private** — signed URLs |
| `audio/` | `public/audio/` | Ambient / album audio |
| `documents/` | `public/docs/` | **Private** |
| `members/` | `public/members/` | Portraits |
| `festivals/` | `public/festivals/` | Chapter heroes |
| `events/` / `birthdays/` / `developments/` | Admin uploads | Categories in media API |
| `community/*.json` | Community API | Live JSON stores |

Categories accepted by upload API: `logos`, `hero`, `gallery`, `events`, `birthdays`, `members`, `developments`, `funfest`, `videos`, `audio`, `documents` ([`lib/r2-storage.ts`](../lib/r2-storage.ts)).

## Migration & strip

```bash
npm run media:migrate:r2:dry   # dry run
npm run media:migrate:r2       # upload
npm run media:strip-local      # after build, if NEXT_PUBLIC_R2_PUBLIC_URL set
```

Strip removes media-only dirs from `out/` (`images`, `videos`, `thumbs`, `audio`, `docs`, `festivals`) and media extensions inside route folders, **without** deleting route HTML.

## Private vs public

Private keys (Fun Fest / documents / `/private/`) require admin or member session to **sign**, and a valid signature to **stream** (`/api/media/sign`, `/api/media/object`).

## CORS

Reference file: `public/r2-cors.json` (apply via Cloudflare dashboard / Wrangler as needed for browser uploads).

## Related

[MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md) · [API_REFERENCE.md](./API_REFERENCE.md) · [docs/13-R2_MEDIA.md](./13-R2_MEDIA.md)
