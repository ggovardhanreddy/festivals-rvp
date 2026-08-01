# Festivals RVP

A private, static family memory archive for festivals, trips, videos, documents and photographs. Built with Next.js App Router and exported for Cloudflare Pages—no database or paid API.

## Local development

```bash
npm install
npm run sample-data
npm run optimize
npm run generate
npm run dev
```

The site runs on `http://localhost:3000`; the local-only administrator service runs on port `8788`. If `.env.local` does not exist, create credentials with `npm run admin-hash change-me-govardhan`, then replace that temporary password.

## Content

Albums use `content/<year>/<Category>/<Album>/metadata.json`, `originals/` (private source files), and generated `public/images/` and `public/thumbs/`. Put files in `originals/`, update metadata, then run `npm run optimize && npm run generate`.

## Commands

- `prepare:site` creates folders; `ingest` checks ZIPs in `inbox/`.
- `import` and `import-google` describe local import workflows.
- `optimize` creates derivatives; `generate` writes search, feed, and sitemap.
- `publish` stages locally only; it never pushes or configures remotes.
- `admin-hash <password>` stores HMAC credentials in `.env.local`.

## Deploy

`npm run build` creates `out/` for Cloudflare Pages. The default URL is `https://festivals-rvp.pages.dev`; set `NEXT_PUBLIC_SITE_URL` after configuring a custom Cloudflare DNS domain. The included GitHub workflow requires `CLOUDFLARE_API_TOKEN`.

## Privacy

Images have no download controls and the gallery discourages right-click and drag interactions, but browser-visible files cannot be technically impossible to save. Keep originals under `content/**/originals/` and only publish derivatives safe to display.
