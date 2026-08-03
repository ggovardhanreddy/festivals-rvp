# Development Setup

## Environment variables

Copy [`.env.example`](../.env.example) → `.env.local`. Variables used by the project:

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD_HASH` | Super Admin PBKDF2 hash (`npm run admin-hash -- "password"`) |
| `SUPER_ADMIN_USERNAME` | Username (default `Govardhan`) |
| `ADMIN_SESSION_SECRET` | HMAC for `rvp_admin` cookie |
| `MEMBER_SESSION_SECRET` | HMAC for `rvp_member` (falls back to admin secret) |
| `ADMIN_API_PORT` | Local admin API port (default `8788`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for sitemap/OG (prod: `https://www.reddivaripalli.com`) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search Console meta |
| `NEXT_PUBLIC_BASE_PATH` | GitHub Pages only (`/festivals-rvp`); empty for Cloudflare |
| `R2_BUCKET` | Bucket name for tooling |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public R2 base (build-time URL rewrite + strip-local) |
| `R2_PUBLIC_BASE` | Same base for Functions upload responses |
| `MEDIA_SIGNING_SECRET` | Signed private media URLs |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_ENDPOINT` | Optional S3 API for migration scripts |
| `R2_MIGRATE_DRY` / `R2_MIGRATE_CONCURRENCY` | Migration tuning |
| `MEMBER_AUTH_FORCE` | Force regenerate Fun Fest hashes |
| `CMS_FORCE_MEDIA` / `CMS_READ_EXIF` | Sync behavior |

## Everyday commands

| Command | Purpose |
|---|---|
| `npm run dev` | `sync` then `next dev` |
| `npm run sync` | Ensure folders + CMS sync |
| `npm run generate` | Search index, sitemap, feed, manifest |
| `npm run prepare:site` | Full pre-build asset pipeline |
| `npm run build` | `prepare:site` + `next build` |
| `npm run validate` | Pre-deploy quality gate |
| `npm run test` | Smoke tests |
| `npm run typecheck` / `lint` / `format` | Quality |
| `npm run auth:members` | Generate Fun Fest auth artifacts |
| `npm run admin-hash -- "…"` | Hash Super Admin password |
| `npm run import:folder` / `ingest` / `import:google` | Media import helpers |
| `npm run media:migrate:r2` | Upload local media to R2 |
| `npm run media:strip-local` | Slim `out/` before Pages deploy |
| `npm run deploy:cf` | Local production deploy to Pages |

## Content layout for developers

```text
content/
  <YEAR>/
    sankranthi|vinayaka-chavithi|…|rvp-birthdays|fun-trips/
  data/
    members.json, events.json, developments.json, …
generated/
  albums.json, albums.r2.json, …
public/
  images/, thumbs/, videos/, members/, festivals/, sw.js, version.json
functions/
  api/, _middleware.ts, _data/member-auth*
```

## Tips

- Prefer editing seeds in `content/data/` for Git-tracked baseline; Super Admin overwrites live R2 collections in production.
- After roster changes, run `npm run auth:members` so Fun Fest credentials stay aligned.
- Do not mix GitHub Pages `BASE_PATH` builds with Cloudflare deploy artifacts.

## Related

[INSTALLATION.md](./INSTALLATION.md) · [AUTHENTICATION.md](./AUTHENTICATION.md) · [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)
