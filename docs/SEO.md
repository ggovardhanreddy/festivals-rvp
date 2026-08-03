# SEO

## Canonical site

- Primary: **https://www.reddivaripalli.com**
- Apex redirects to www (`public/_redirects`)
- Pages.dev redirects to www (`functions/_middleware.ts`)

Set `NEXT_PUBLIC_SITE_URL` accordingly for sitemap / RSS / Open Graph generation.

## Metadata source

Identity and keyword targeting live in [`lib/site.ts`](../lib/site.ts):

- `SEO_TITLE`, `SEO_DESCRIPTION`, `SEO_KEYWORDS`
- Village name variants for local discovery (Reddivaripalli, Kondreddigaripalli, Sambepalle, YSR Kadapa, etc.)

Root layout (`app/layout.tsx`) applies site-wide metadata and structured data (WebSite, Organization, Place, BreadcrumbList, ImageObject patterns as implemented).

## Generated artifacts

`npm run generate` / `prepare:site` writes:

| File | Role |
|---|---|
| `public/sitemap.xml` | URL list |
| `public/robots.txt` | Crawl rules |
| `public/feed.xml` | RSS/Atom-style feed |
| `public/search-index.json` | Client search |

## Search Console

Optional verification:

1. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (HTML tag content)
2. Or place verification file from `public/google-site-verification.txt.example`

## Media / OG

Prefer R2-rewritten absolute URLs for logos and OG images after `rewrite-albums-r2` / public R2 base is set. 1.2.0 fixed JSON-LD logo double-prefixing against the R2 domain.

## Related

[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) · [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
