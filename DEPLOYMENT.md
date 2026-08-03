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

## Manual deploy (Cloudflare Pages + R2)

```bash
npm ci
# Ensure .env.local has NEXT_PUBLIC_SITE_URL + NEXT_PUBLIC_R2_PUBLIC_URL
npm run typecheck
npm run lint
npm run test
npm run validate
npm run deploy:cf
```

`deploy:cf` runs `prepare:site` + `next build`, strips local media folders from `out/` when R2 is configured (keeps `out/members/index.html`), then `wrangler pages deploy`.

### Pages secrets (production)

| Secret | Purpose |
|---|---|
| `ADMIN_PASSWORD_HASH` | Super Admin password (pbkdf2, 100k iterations) |
| `SUPER_ADMIN_USERNAME` | Super Admin username |
| `ADMIN_SESSION_SECRET` | Admin session HMAC |
| `MEMBER_SESSION_SECRET` | Fun Fest session HMAC (optional fallback) |
| `R2_PUBLIC_BASE` | Public R2 base for upload responses |
| `MEDIA_SIGNING_SECRET` | Signed private media URLs |

Binding: R2 bucket `MEDIA` → `reddivaripalli` (see `wrangler.toml`).

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
