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

## Custom domain (Hostinger → Cloudflare Pages)

Primary URL: **https://www.reddivaripalli.com**  
(Registered spelling is **reddi**varipalli — with an **i**.)

In Hostinger → Domains → `reddivaripalli.com` → DNS / DNS Zone:

1. **Delete** Hostinger parking records that point `@` / `www` to `2.57.91.91` (or any parking A/CNAME).
2. **Add**:

| Type | Name | Target / value | TTL |
|---|---|---|---|
| CNAME | `www` | `festivals-rvp.pages.dev` | Auto / 300 |
| CNAME or ALIAS | `@` | `festivals-rvp.pages.dev` | Auto / 300 |

If Hostinger blocks CNAME on `@`, use their **ALIAS/ANAME** for the root, or only set `www` first (site will work at www).

Both `www.reddivaripalli.com` and `reddivaripalli.com` are attached to the `festivals-rvp` Pages project. SSL becomes Active after DNS is correct.

## Manual deploy

```bash
npm ci
export NEXT_PUBLIC_SITE_URL=https://www.reddivaripalli.com
export NEXT_PUBLIC_BASE_PATH=
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
