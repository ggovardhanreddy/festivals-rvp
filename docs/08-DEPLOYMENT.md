# 08 — Deployment

## Targets

| Target | URL | Workflow |
|---|---|---|
| Custom domain (primary) | https://www.reddivaripalli.com | Hostinger DNS → Cloudflare Pages |
| Cloudflare Pages | https://festivals-rvp.pages.dev | `.github/workflows/deploy-cloudflare.yml` |
| GitHub Pages (mirror) | https://ggovardhanreddy.github.io/festivals-rvp/ | `.github/workflows/deploy.yml` |

Deploy branch: **`main`**.

## Automatic pipeline

```text
Git push to main
  → Deploy Cloudflare Pages (fast path)
       checkout (depth 1) + npm ci (cached)
       → npm run build
       → npm run media:strip-local
       → wrangler pages deploy out --project-name=festivals-rvp
  → Deploy GitHub Pages (mirror, optional)
Pull requests
  → CI (lint, typecheck, prepare:site, validate, test, build)
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

| Variable | Cloudflare / custom domain | GitHub Pages |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `""` | `/festivals-rvp` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.reddivaripalli.com` | `https://ggovardhanreddy.github.io/festivals-rvp` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | repo variable | repo variable |
| `CMS_READ_EXIF` | `0` in deploy (PR CI can opt in) | `0` |

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
