# Media Management

## Pipelines

### A. Git CMS (album galleries)

1. Place files under `content/<YEAR>/<bucket>/`
2. `npm run sync` / `prepare:site` → optimize into `public/images|thumbs|videos|…` + `generated/albums.json`
3. `npm run media:migrate:r2` uploads binaries to bucket `reddivaripalli`
4. Deploy with `NEXT_PUBLIC_R2_PUBLIC_URL` so HTML references R2 and `media:strip-local` drops local blobs from `out/`

Import helpers:

| Script | Purpose |
|---|---|
| `npm run import:folder` | Folder import |
| `npm run ingest` | Zip ingest |
| `npm run import:google` | Google takeout-style import |
| `npm run admin:api` | Local admin import server |

### B. Super Admin upload

`POST /api/media/upload` → `category/<timestamp>-filename` in R2. Prefer WebP/MP4 for web. HEIC/MOV often need local conversion first.

### C. Private Fun Fest / documents

Serve via signed `/api/media/object` URLs. Gallery tiles after 1.2.0 expect signed URLs when local paths were stripped.

## URL resolution

Helpers: [`lib/media-url.ts`](../lib/media-url.ts), [`lib/use-media-url.ts`](../lib/use-media-url.ts), [`lib/media-src.ts`](../lib/media-src.ts).

## Strip-local rules

[`scripts/strip-local-media.ts`](../scripts/strip-local-media.ts):

- Runs only when `NEXT_PUBLIC_R2_PUBLIC_URL` is set
- Removes media-only directories from `out/`
- Strips media extensions inside route folders but **keeps HTML** (critical for `/members/`)

## Dedup & quality

Sync maintains `content/hashes.json`, `content/phashes.json`, cover quality scoring, and `generated/sync-warnings.json` for corrupt/unsupported inputs (warn, don’t crash).

## Related

[CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · [GALLERY_GUIDE.md](./GALLERY_GUIDE.md) · [API_REFERENCE.md](./API_REFERENCE.md) · [docs/07-MEDIA_PIPELINE.md](./07-MEDIA_PIPELINE.md)
