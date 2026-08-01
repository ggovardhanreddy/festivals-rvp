# Festivals RVP / RVP Memories

A private, read-only family archive for **Govardhan Reddy**. Visitors can browse; only the administrator can import and publish.

- **Repo:** https://github.com/ggovardhanreddy/festivals-rvp  
- **Live site:** https://ggovardhanreddy.github.io/festivals-rvp/

## Local photos import (no ZIP required)

Photos can live anywhere on your computer (for example `~/Downloads`). The importer recursively scans subfolders.

```bash
npm run import:folder -- --dir "~/Downloads/FamilyPhotos"
```

Options:

```bash
npm run import:folder -- --dir "~/Downloads" --category festivals --album diwali-2026
npm run import:folder -- --dir "~/Pictures" --no-originals
```

Supported files: JPG, JPEG, PNG, HEIC, WEBP, AVIF, GIF, MP4, MOV, WEBM, MKV.

For every file the importer:

1. Reads EXIF capture date (falls back to file modified time, then `Unknown` year)
2. Creates year + category folders under `public/images/` (`festivals`, `family`, `trips`, `birthdays`, `misc`)
3. Skips SHA-256 duplicates (never overwrites)
4. Builds WebP (+ AVIF when possible) and thumbnails
5. Optionally keeps originals in git-ignored `originals/`
6. Updates album metadata, search index, sitemap, RSS / timeline inputs

**Import does not commit or deploy.** After you review locally:

```bash
npm run publish -- --confirm
```

That commits, pushes to **your** `ggovardhanreddy/festivals-rvp` repo, and triggers GitHub Actions deploy.

## Administrator UI

```bash
npm install
npm run admin-hash "your-password"   # paste lines into .env.local
npm run dev                          # site :3000 + admin API :8788
```

Open `/admin`, sign in as Govardhan Reddy, paste a local folder path, import, review, then **Confirm & publish**.

## ZIP ingest (optional)

Google Takeout ZIPs can still go in `inbox/` and run with `npm run ingest`. Prefer `import:folder` for normal local photos.

## Deployment

Pushing to `main` on `ggovardhanreddy/festivals-rvp` runs `.github/workflows/deploy.yml` (GitHub Pages).

To use Cloudflare Pages later: connect the same GitHub repo, build command `npm run build`, output directory `out`. Leave `NEXT_PUBLIC_BASE_PATH` empty for a root `*.pages.dev` URL.
