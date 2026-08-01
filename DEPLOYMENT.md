# Deployment

Primary documentation lives in [docs/08-DEPLOYMENT.md](./docs/08-DEPLOYMENT.md). This file is the operator quick reference.

## Automatic (recommended)

Push to `main` → GitHub Actions:

1. Typecheck + lint
2. Sync CMS + optimize media + generate indexes
3. Validate site
4. Static export
5. Deploy to **Cloudflare Pages** and **GitHub Pages**

## Cloudflare secrets

Set in the GitHub repository:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Manual deploy

```bash
npm ci
npm run prepare:site
npm run validate
npx next build
npx wrangler pages deploy out --project-name=festivals-rvp
```

For GitHub Pages builds, set:

```bash
export NEXT_PUBLIC_BASE_PATH=/festivals-rvp
export NEXT_PUBLIC_SITE_URL=https://ggovardhanreddy.github.io/festivals-rvp
```

## Do not deploy if

- TypeScript fails
- ESLint fails
- Validate fails
- Production build fails
