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

### Auth error `10000` / `Invalid access token [code: 9109]`

Wrangler OAuth (`npx wrangler login`) works for **local** `npm run deploy:cf`, but GitHub Actions needs a **durable API token** in `CLOUDFLARE_API_TOKEN`. OAuth tokens cannot create API tokens via API (403), so create one in the dashboard:

1. Open [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token**
2. Use template **Edit Cloudflare Workers**, or custom permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Account Settings** → **Read**
3. Account Resources → include this account (`CLOUDFLARE_ACCOUNT_ID`)
4. Create → copy the token once
5. From the repo root:

```bash
gh secret set CLOUDFLARE_API_TOKEN
# paste token, Enter
gh secret set CLOUDFLARE_ACCOUNT_ID -b "9e9bfe3d5a15e0ddee2e6270e74f6f40"
gh workflow run "Production Deploy"
```

6. Confirm the run is green: `gh run list --workflow=deploy.yml --limit 3`

### Other deploy failures

- Project name must be `festivals-rvp`
- Confirm `out/` exists and is under size limits (media on R2)
- Local fallback while the secret is broken: `npm run deploy:cf` (uses wrangler OAuth)

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
