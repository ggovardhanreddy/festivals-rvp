# Troubleshooting

## Build / CI fails

1. Open the failed GitHub Actions log
2. Identify gate: lint, typecheck, `prepare:site`, validate, test, or `next build`
3. Reproduce locally with the same command
4. Fix and push — do not deploy a broken `out/`

## `npm run validate` fails

- Missing `generated/albums.json` → `npm run sync`
- Missing search/sitemap/brand → `npm run generate` / `prepare:site`
- Duplicate album routes → rename conflicting folders/slugs

## Images missing on the live site

- Confirm R2 public URL env/var is set and objects exist in the bucket
- Confirm `media:migrate:r2` ran after new local media
- Check `generated/sync-warnings.json` for skipped files
- Ensure strip-local did not run **without** R2 URLs rewritten into HTML

## Fun Fest media broken after deploy

- Symptom fixed in **1.2.0**: covers/tiles must use **signed** R2 URLs, not stripped local paths
- Confirm member/admin session when requesting `/api/media/sign`
- Confirm `MEDIA_SIGNING_SECRET` / session secrets on Pages

## Super Admin login Worker 1101

- Cause: PBKDF2 iterations too high for Workers CPU
- Fix: hashes must use **100k** iterations (`npm run admin-hash` / member-auth generator)

## Members page missing after deploy

- Older strip deleted `out/members/` HTML — current strip keeps HTML and removes portraits only
- Update to current `scripts/strip-local-media.ts`

## PWA / mobile blank after navigation

- Clear site data / SW caches; ensure latest `sw.js` + `version.json`
- 1.1.x included fixes for drawer navigation blank loads

## Cloudflare deploy step fails

- Check `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
- Project name must be `festivals-rvp`
- Confirm `out/` exists and is under size limits (media on R2)

## GitHub Pages assets 404

- GitHub Pages needs `NEXT_PUBLIC_BASE_PATH=/festivals-rvp`
- Cloudflare uses empty base path — do not mix artifacts

## Community edits not visible

- Confirm admin cookie present (`/api/admin/session`)
- Confirm R2 `MEDIA` binding
- Hard-refresh (community responses use `cache-control: no-store`)

## Canonical / SSL issues

- Apex should 301 to www
- `festivals-rvp.pages.dev` should 301 to www
- Verify Hostinger DNS CNAMEs to Pages

## Related

Root [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [FAQ.md](./FAQ.md)
