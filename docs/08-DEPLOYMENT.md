# 08 — Deployment

## Targets

| Target | URL | Workflow |
|---|---|---|
| Custom domain (primary) | https://www.reddivaripalli.com | Hostinger DNS → Cloudflare Pages |
| Cloudflare Pages | https://festivals-rvp.pages.dev | `.github/workflows/deploy.yml` |

Deploy branch: **`main`**.

## Automatic pipeline

```text
Git push to main
  → Production Deploy (the only production deployer)
       sparse checkout (depth 1) + npm ci (cached)
       → validate: content JSON, lint, typecheck, unit tests, Pages secrets
       → npm run build            (prepare:site + next build, once)
       → npm run media:strip-local && npm run pages:fix-assets
       → verify: npm run validate && npm test
       → wrangler pages deploy out --project-name=festivals-rvp
       → seo:indexnow (non-blocking)
Pull requests
  → PR Checks (lint, typecheck, unit tests, build, validate) — never deploys
```

Keep **Cloudflare Pages Git integration disabled** so only GitHub Actions deploys (avoids double publishes).

## Required secrets (Cloudflare)

Repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Repository variable (recommended for small deploy artifacts):

- `NEXT_PUBLIC_R2_PUBLIC_URL` — public R2 base URL (no trailing slash)

Project name: `festivals-rvp`.

## Environment variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `""` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.reddivaripalli.com` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | repo variable `NEXT_PUBLIC_R2_PUBLIC_URL` (workflow falls back to the public `r2.dev` base) |
| `CMS_READ_EXIF` | `0` |

### Retired: the GitHub Pages mirror

`ggovardhanreddy.github.io/festivals-rvp` was a second copy of the site built by
a `deploy.yml` that ran alongside the Cloudflare deploy on every push. It roughly
doubled Actions minutes (~226 s vs ~88 s per push) and uploaded a ~1.8 GB
`github-pages` artifact each time, because it built without `media:strip-local`.
Nothing links to it, so it was removed. The pages already published there stay
online, frozen at the last mirrored commit; take the site down in
**Settings → Pages** if that frozen copy is not wanted.

### Hostinger DNS

Point the domain at Cloudflare Pages project `festivals-rvp`:

- `www` → CNAME `festivals-rvp.pages.dev`
- `@` → CNAME/ALIAS `festivals-rvp.pages.dev` (or Cloudflare A/AAAA guidance)

## Manual deployment

If automatic deployment is disabled:

### Cloudflare Pages

1. `npm ci`
2. Install ffmpeg locally if videos need posters/conversion
3. `npm run prepare:site && npm run validate && npx next build`
4. Deploy `out/` with Wrangler:

```bash
npx wrangler pages deploy out --project-name=festivals-rvp
```

Or upload `out/` via the Cloudflare dashboard.

### GitHub Pages

1. Build with GitHub Pages env vars above
2. Upload `out/` as a Pages artifact / use Actions `deploy-pages`

## Rollback

Redeploy a previous successful Actions run, or revert `main` to a known-good commit and push.

## Cost posture

Designed for **free-tier** GitHub + Cloudflare Pages hosting. No paid database, object storage, or serverless CMS is required.
