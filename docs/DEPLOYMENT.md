# Deployment

Primary production target: **Cloudflare Pages** project `festivals-rvp` → **https://www.reddivaripalli.com**.

## Automatic (recommended)

Push to **`main`** runs [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — "Production Deploy", the only workflow that publishes production:

1. Sparse checkout (excludes heavy media already on R2)
2. `npm ci`
3. Validate: content JSON, `npm run lint`, `npm run typecheck`, `npm run test:unit`, required Pages secrets
4. `npm run build`
5. `npm run media:strip-local` and `npm run pages:fix-assets`
6. Verify: `npm run validate` and `npm test`
7. `npx wrangler pages deploy out --project-name=festivals-rvp --commit-dirty=true`
8. `npm run seo:indexnow` (non-blocking)

Env in workflow:

- `NEXT_PUBLIC_SITE_URL=https://www.reddivaripalli.com`
- `NEXT_PUBLIC_BASE_PATH=""`
- `NEXT_PUBLIC_R2_PUBLIC_URL` from repo variable (fallback public `r2.dev` URL in workflow)
- `CMS_READ_EXIF=0`

Keep **Cloudflare Pages Git integration disabled** so Actions is the only deployer (avoids double deploys).

### Pull request CI

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) — "PR Checks": lint →
typecheck → unit tests → `npm run build` → validate → smoke test. It never
deploys, and it runs only on `pull_request`, so a commit is never built twice.

## Manual deploy

```bash
npm ci
# .env.local: NEXT_PUBLIC_SITE_URL + NEXT_PUBLIC_R2_PUBLIC_URL
npm run typecheck && npm run lint && npm run test && npm run validate
npm run deploy:cf
```

`deploy:cf` = `build` → `media:strip-local` → `wrangler pages deploy out --project-name=festivals-rvp --commit-dirty=true`.

With fresh media upload: `npm run deploy:cf:r2` (`media:migrate:r2` then `deploy:cf`).

## GitHub repository secrets / variables

| Kind | Name | Purpose |
|---|---|---|
| Secret | `CLOUDFLARE_API_TOKEN` | Durable Pages deploy token (not wrangler OAuth) |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Account scope |
| Variable | `NEXT_PUBLIC_R2_PUBLIC_URL` | Build rewrite + strip-local |

If Actions fails with `Invalid access token [code: 9109]`, recreate the API token (Pages Edit + Account Settings Read) and `gh secret set CLOUDFLARE_API_TOKEN`. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#auth-error-10000--invalid-access-token-code-9109). Local deploys can use `npx wrangler login` + `npm run deploy:cf` in the meantime.

## Cloudflare Pages secrets (production Functions)

| Secret | Purpose |
|---|---|
| `ADMIN_PASSWORD_HASH` | Super Admin password (pbkdf2, 100k iterations) |
| `SUPER_ADMIN_USERNAME` | Super Admin username |
| `ADMIN_SESSION_SECRET` | Admin session HMAC |
| `MEMBER_SESSION_SECRET` | Fun Fest session HMAC (optional) |
| `R2_PUBLIC_BASE` | Public base for upload responses |
| `MEDIA_SIGNING_SECRET` | Private media signing |

Binding: **R2** `MEDIA` → bucket `reddivaripalli` (see [`wrangler.toml`](../wrangler.toml)).

## Custom domain

See [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md). DNS typically points Hostinger zone to `festivals-rvp.pages.dev`. Middleware 301s `festivals-rvp.pages.dev` → `www.reddivaripalli.com`. `public/_redirects` forces apex → www.

## Do not deploy if

- TypeScript, ESLint, validate, or production build fails

## Related

[CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
