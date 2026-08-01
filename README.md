# RVP Youth — Digital Village Experience

A premium interactive heritage archive for village festivals, birthdays, and journeys.
It should feel like a digital museum — not a generic gallery.

- **Brand:** RVP Youth
- **Repo:** https://github.com/ggovardhanreddy/festivals-rvp
- **GitHub Pages:** https://ggovardhanreddy.github.io/festivals-rvp/
- **Cloudflare Pages:** https://festivals-rvp.pages.dev

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Three.js · React Three Fiber · Drei · Lenis · Framer Motion · GSAP · Sharp · Cloudflare Pages + GitHub Pages

The homepage opens as a **cinematic 3D village experience** (stylized low-poly scene, camera fly-tos, optional muted ambience). Low-power devices and `prefers-reduced-motion` get graceful 2D fallbacks.

## Quick start

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD_HASH + secrets
npm run dev                  # Next + local admin API on :8788
```

## Import photos

Default source (mandatory):

```text
/Users/govardhan.reddy.g.94gmail.com/Downloads/Fest
```

```bash
npm run import:folder
npm run optimize
npm run generate
```

Exact duplicates are skipped (SHA-256). Near-duplicates go to `review/near-duplicates/`.

Publish only after confirmation:

```bash
npm run publish -- --confirm
```

## Content layout

Years are discovered automatically (never hardcoded):

```text
content/<YEAR>/Festivals/sankranthi/
content/<YEAR>/Festivals/vinayaka-chavithi/
content/<YEAR>/Birthdays/<person>/
content/<YEAR>/Trips/fun-trips/
```

Public media:

```text
public/images/<YEAR>/<bucket>/
public/thumbs/<YEAR>/<bucket>/
```

Buckets: `sankranthi` · `vinayaka-chavithi` · `rvp-birthdays` · `fun-trips`

## Admin

- Single administrator (local studio only)
- Visitors are read-only
- Production Cloudflare admin route cannot write/upload
- Local API: `http://127.0.0.1:8788` while `npm run dev` runs

Generate password hash:

```bash
npm run admin-hash -- "your-password"
```

## Deploy

| Host             | Workflow                                  | Base path        | URL       |
| ---------------- | ----------------------------------------- | ---------------- | --------- |
| GitHub Pages     | `.github/workflows/deploy.yml`            | `/festivals-rvp` | github.io |
| Cloudflare Pages | `.github/workflows/deploy-cloudflare.yml` | ``               | pages.dev |

Cloudflare secrets required: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

CI checks lint + Prettier on PRs (`.github/workflows/ci.yml`).

## Scripts

| Command                        | Purpose                                     |
| ------------------------------ | ------------------------------------------- |
| `npm run import:folder`        | Scan Fest folder, EXIF, albums, dedupe      |
| `npm run optimize`             | WebP/AVIF + thumbs + blur placeholders      |
| `npm run generate`             | Search index, sitemap, feed, service worker |
| `npm run brand:assets`         | Icons + OG banner from SVG marks            |
| `npm run publish -- --confirm` | Commit & push published site                |

## Environment

See [`.env.example`](.env.example):

- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_BASE_PATH`
