# 08 — Deployment

## Targets

| Target | URL | Workflow |
|---|---|---|
| Cloudflare Pages (primary) | https://festivals-rvp.pages.dev | `.github/workflows/deploy-cloudflare.yml` |
| GitHub Pages (mirror) | https://ggovardhanreddy.github.io/festivals-rvp/ | `.github/workflows/deploy.yml` |

Deploy branch: **`main`**.

## Automatic pipeline

```text
Git push to main
  → checkout + npm ci
  → install ffmpeg
  → typecheck + lint
  → prepare:site (sync + generate)
  → validate
  → next build (static export to out/)
  → deploy
```

If any quality gate fails, deployment must not proceed.

## Required secrets (Cloudflare)

Repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Project name: `festivals-rvp`.

## Environment variables

| Variable | Cloudflare | GitHub Pages |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `""` | `/festivals-rvp` |
| `NEXT_PUBLIC_SITE_URL` | `https://festivals-rvp.pages.dev` | `https://ggovardhanreddy.github.io/festivals-rvp` |
| `CMS_READ_EXIF` | `1` in CI | `1` in CI |

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
