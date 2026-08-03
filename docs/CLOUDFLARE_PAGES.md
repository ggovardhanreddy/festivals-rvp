# Cloudflare Pages

## Project

| Setting | Value |
|---|---|
| Project name | `festivals-rvp` |
| Build output | `out` (`pages_build_output_dir` in `wrangler.toml`) |
| Compatibility date | `2025-01-01` |
| Preview / default host | https://festivals-rvp.pages.dev |
| Canonical host | https://www.reddivaripalli.com |

## Deploy mechanism

This repo deploys via **GitHub Actions + Wrangler**, not Cloudflare’s native Git build:

```bash
npx wrangler pages deploy out --project-name=festivals-rvp --commit-dirty=true
```

Local equivalent: `npm run deploy:cf`.

Disable Pages → Settings → Builds **Git integration** to prevent a second deploy path.

## Functions & middleware

Deployed alongside the static `out/` tree from the `functions/` directory:

- [`functions/_middleware.ts`](../functions/_middleware.ts) — host canonicalization + Fun Fest gate
- [`functions/api/**`](../functions/api/) — admin, auth, community, media

## Domain / DNS (Hostinger → Pages)

Primary spelling: **reddi**varipalli (with **i**).

Typical DNS:

| Type | Name | Target |
|---|---|---|
| CNAME | `www` | `festivals-rvp.pages.dev` |
| CNAME/ALIAS | `@` | `festivals-rvp.pages.dev` |

Attach both apex and www in the Pages custom domains UI. SSL activates after DNS propagates.

Redirects:

- Middleware: `*.pages.dev` → `www.reddivaripalli.com` (301)
- `_redirects`: apex HTTP/HTTPS → www; removed `/blood-donors` → `/`

## Headers

Static rules in `public/_headers` ship with the export (caching / security headers as committed).

## Environment & bindings

Configure in Pages → Settings:

- Environment variables / secrets listed in [DEPLOYMENT.md](./DEPLOYMENT.md)
- R2 binding **`MEDIA`** → `reddivaripalli` (preview uses same bucket per `wrangler.toml`)

## Size constraint

Cloudflare Pages has a **25 MiB per-file** limit. Large media must live on R2; `media:strip-local` keeps deploy artifacts small.

## Related

[DEPLOYMENT.md](./DEPLOYMENT.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md) · [API_REFERENCE.md](./API_REFERENCE.md)
