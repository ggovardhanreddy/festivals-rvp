# Progressive Web App (PWA)

## Manifest

Generated/served as [`public/manifest.webmanifest`](../public/manifest.webmanifest):

- `name`: RVP Youth · Reddivaripalli
- `short_name`: RVP Youth
- `display`: `standalone` (with overrides)
- `start_url` / `scope`: `/`
- Icons under `/logo/` and Apple touch icon

Regenerated as part of `npm run generate` / `prepare:site`.

## Service worker

[`public/sw.js`](../public/sw.js):

- Cache name tied to build id (e.g. `rvp-youth-<buildId>`)
- Precache: `/`, `/offline/`, `/version.json`
- Never caches `/api/*`, `version.json`, `sw.js`, `manifest.webmanifest` (network, no-store)
- Cache-first for `/_next/static/`
- Network-first / fallback patterns for navigations (see SW source)
- Messages: `SKIP_WAITING`, `CLEAR_CACHES`

## Version / update flow

[`public/version.json`](../public/version.json) + [`lib/pwa-update.ts`](../lib/pwa-update.ts):

- Clients compare build ids and **silently** apply updates (`applyPwaUpdate`) — no “Update Available” prompt
- Service worker + version polling clear caches and reload automatically
- Community data (members, events, announcements) also silent-refreshes on focus / every 60s

Build id is refreshed during site prepare / deploy alignment (`lib/build-id.ts`).

## Install UX

The app exposes an install prompt on mobile and via the site menu (in-app UI). Offline page route: `/offline/`.

## Known caveats

- Mobile/PWA blank pages after drawer navigation were fixed in 1.1.x — if regressions appear, clear SW caches and hard-reload
- APIs and community JSON are always network-fetched (not offline-authoritative)

## Related

[NOTIFICATIONS.md](./NOTIFICATIONS.md) · [DEPLOYMENT.md](./DEPLOYMENT.md) · [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
