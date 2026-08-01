# Troubleshooting

## Build fails in GitHub Actions

1. Open the failed workflow log
2. Check which gate failed: lint, typecheck, sync, validate, or next build
3. Reproduce locally with the same commands
4. Fix and push again — do not deploy broken `out/`

## `npm run validate` fails

Common causes:

- Missing `generated/albums.json` → run `npm run sync`
- Missing `public/search-index.json` or brand assets → run `npm run generate` / `prepare:site`
- Duplicate album routes → rename conflicting folders/slugs

## Images missing on the site

- Confirm files are under `content/<YEAR>/<album>/`
- Confirm the album key is one of the four supported buckets
- Run `npm run sync` and check `generated/sync-warnings.json`
- Corrupt/unsupported files are skipped with warnings

## Videos have no poster / conversion skipped

Install ffmpeg locally and in CI (workflows already install it on Ubuntu runners).

## 3D hero is blank or heavy

- Reduced motion may show the ready/fallback path
- Low-power mode simplifies the scene
- Confirm `/brand/og-banner.jpg` exists for fallback
- Check browser WebGL availability

## Cloudflare deploy step fails

- Verify `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets
- Confirm the Pages project name is `festivals-rvp`
- Ensure the build produced an `out/` directory

## GitHub Pages assets 404

GitHub Pages requires `NEXT_PUBLIC_BASE_PATH=/festivals-rvp`. Cloudflare uses an empty base path. Do not mix the two build outputs.

## Sync feels stuck

- Previously, re-encoding AVIF sources could hang — sync skips `.avif` as source inputs
- Large first-time imports are slow; subsequent syncs are incremental
- Local EXIF reads are optional; CI sets `CMS_READ_EXIF=1`

## Need more detail

See `/docs`, especially Media Pipeline, Deployment, and Testing documents.
