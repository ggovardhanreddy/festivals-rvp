# 07 — Media Pipeline

## Goal

Turn raw drops in `content/` into optimized, validated, searchable public assets — with **warnings instead of hard crashes** for bad files.

## Pipeline stages

```text
ensure folders
  → sync-cms (scan, validate, optimize, copy, score covers)
  → generate-all (search, sitemap, feed, manifest)
  → validate-site (quality gate)
  → next build (static export)
```

## Image processing (Sharp)

Automatically:

- Fix EXIF orientation (when EXIF reading enabled)
- Preserve aspect ratio
- Generate thumbnails
- Generate responsive derivatives
- Emit WebP / AVIF where configured
- Produce blur-friendly lightweight previews
- Support retina via srcset-oriented widths

EXIF full reads can be slow locally. CI sets `CMS_READ_EXIF=1`. Local fast path may use filename/mtime defaults.

Source `.avif` files are not re-encoded as inputs (prevents sync hangs from previously optimized outputs).

## Video / audio / documents

- Videos copied (and optionally converted/poster-extracted when ffmpeg is present)
- Audio copied to `public/audio`
- Documents copied to `public/docs`
- Unsupported formats produce warnings and are skipped

## Validation during sync

Warn on:

- Unsupported formats
- Corrupt / unreadable images or videos
- Missing folders (ensured/created when possible)
- Missing metadata fields (defaults applied)
- Duplicate filenames within an album

Warnings write to `generated/sync-warnings.json` and print to the console. The build continues unless a later quality gate finds critical errors.

## Cover quality scoring

`pickBestCover()` prefers favorites, then larger resolution images.

## Public output layout

```text
public/images/
public/thumbs/
public/videos/
public/audio/
public/docs/
public/search-index.json
```

## Contributor workflow

1. Add media under the correct `content/<YEAR>/<album>/`
2. Commit + push to `main`
3. Actions run sync → optimize → generate → validate → deploy

No browser upload API exists by design.

## Operational tips

- Install ffmpeg in CI for posters/conversion paths
- Keep `generated/` gitignored
- Re-run `npm run sync` after large imports
- Use `npm run validate` before manual deploys
