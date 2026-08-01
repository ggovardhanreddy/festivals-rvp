# Festivals RVP / RVP Memories

A private, read-only family archive for Govardhan Reddy. The public site is a static Next.js export designed for GitHub and Cloudflare Pages—no database, account provider, or paid API is required.

## URL and deployment

The default production URL is `https://festivals-rvp.pages.dev`. Set `NEXT_PUBLIC_SITE_URL` to that URL in your build environment. A custom domain can be connected later in Cloudflare Pages through DNS; no domain purchase is required by this repository.

1. Create a GitHub repository for this folder and push it.
2. In Cloudflare Pages, connect the GitHub repository and use `npm run build` with `out` as the output directory, or enable the included GitHub Pages deployment workflow.
3. Add `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` as Cloudflare secrets if you enable the admin Function.

## Local setup

```bash
npm install
npm run admin-hash
# Copy its two lines into .env.local
npm run sample-data
npm run optimize
npm run generate
npm run dev
```

The site runs on port 3000; the local administrator API runs on port 8788. The administrator is **Govardhan Reddy**. Generate a password hash with `npm run admin-hash "your-password"`; never commit `.env.local`.

## ZIP workflow

1. Put ZIP files exported from a camera or Google Takeout in `inbox/`.
2. Run `npm run ingest`. It extracts files, detects EXIF dates where present, puts originals under `originals/<year>/Unsorted/<zip>/`, deduplicates by SHA-256 within the ingest, and removes its temporary workspace.
3. Run `npm run optimize && npm run generate`.
4. Review generated media and metadata, then run `npm run publish` when ready. `npm run ingest -- --publish` runs the final publish step automatically.

Public optimized images live under `public/images/` and `public/thumbs/`; original source media is intentionally git-ignored. Album metadata is stored at `content/<year>/<Category>/<Album>/metadata.json` and is detected by scanning folders at build time.

## Administration and security

The dashboard is at `/admin/`; local sessions use signed HMAC, `HttpOnly`, `SameSite=Strict` cookies. Static sites cannot safely mutate the repository in production, so the Cloudflare Function refuses remote archive writes by default. Manage source content locally, review it, and publish via Git—the secure workflow for a static personal archive. Visitors have no download controls, while browser-level saving cannot be completely prevented on any public web page.

Scripts: `optimize`, `ingest`, `import`, `import:google`, `generate`, `publish`, `admin-hash`, `sample-data`, and `ensure-folders`.
