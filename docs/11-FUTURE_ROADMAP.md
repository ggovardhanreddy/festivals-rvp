# 11 — Future Roadmap

The architecture must absorb new capabilities **without major refactoring**. Prefer additive modules, generated indexes, and progressive enhancement.

## Near-term

- Richer album storytelling pages (chapter text + media)
- Stronger automated alt-text heuristics
- Cover scoring using perceptual quality when EXIF/dimensions available
- Expanded empty/error coverage on every data view
- Contributor templates for `album.json`

## Media expansions

- Drone video collections
- 360° photos and videos
- Timed audio tours per hotspot
- Document exhibitions (PDF magazines, invitations)

## Immersive expansions

- VR mode (WebXR) behind capability checks
- AR landmark overlays on supported devices
- Seasonal village weather/festival scene skins

## Knowledge expansions

- Interactive historical timeline with eras
- Multi-language Telugu / English UI strings
- Optional village genealogy module
- Digital museum exhibitions (curated thematic routes)

## Multi-village readiness

Extract identity (`lib/site.ts` village constants + story modules) so additional villages can share the engine with separate content roots and brand tokens.

## Platform expansions

- Optional private preview deployments per PR
- Content lint bot commenting on missing years/albums
- Offline-first PWA cache strategies tuned per media type

## Non-goals

- Paid SaaS CMS dependency
- Required custom server for core browsing
- Turning the product into a generic social photo network
