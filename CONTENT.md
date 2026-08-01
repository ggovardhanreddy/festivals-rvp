# GitHub CMS — Content Guide

GitHub is the only content management system for **RVP Youth**.

- No website upload UI
- No backend / database / FTP
- Visitors only see the polished museum experience

## Folder layout

```text
content/
├── 2026/
│   ├── sankranthi/
│   ├── vinayaka-chavithi/
│   ├── rvp-birthdays/
│   └── fun-trips/
└── …
```

Years are detected automatically. Album folders must use exactly those four names.

## Supported media

### Images
JPG, JPEG, PNG, GIF, WEBP, HEIC/HEIF, TIFF, BMP, SVG, ICO, JXL (when tooling supports it)

Build output: optimized WebP + AVIF (when possible), thumbnails, blur placeholders.

### Videos
MP4, MOV, WEBM, M4V, OGV

MKV / AVI / WMV / FLV convert to MP4 during build **if ffmpeg is available** in CI; otherwise a warning is written to `generated/sync-warnings.json`.

### Audio
MP3, WAV, AAC, M4A, FLAC, OGG, OPUS

Custom player + mini player while browsing.

### Documents
PDF (inline preview), TXT, MD (open/download)

## Administrator workflow

1. Open the GitHub repo
2. Go to `content/<YEAR>/<ALBUM>/`
3. Upload files
4. Commit to `main`
5. Wait for GitHub Actions → Cloudflare Pages  
   (or open Cloudflare Pages → Retry deployment)

No code changes. No manual JSON. Media lists are generated on build.

## Optional metadata

Add `metadata.json` in an album folder only if you want to override title/story/cover/`published`. Media discovery stays automatic.

## Local commands

```bash
npm run sync      # scan content + optimize + albums.json
npm run generate  # search/sitemap/PWA
npm run build     # full production build
```

Set `CMS_READ_EXIF=1` to read EXIF dates during sync (slower).
