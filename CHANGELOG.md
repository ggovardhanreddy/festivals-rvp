# Changelog

All notable changes to **RVP Youth — Digital Village Experience** are documented here.

## [1.0.0] — 2026-08-01

### Added

- Premium Digital Village Experience for Kondreddigaripalli (Reddivaripalli)
- Cinematic 3D village hero with reduced-motion and low-power fallbacks
- GitHub-as-CMS flat layout under `content/<YEAR>/<album>/`
- Universal media support (images, video, audio, documents)
- Search index, timeline, interactive map, village story, memory wall
- Central design tokens (`styles/tokens.css`, `lib/design-tokens.ts`)
- Reusable UI primitives including empty, error, and skeleton states
- Pre-deploy validator (`npm run validate`) and CI quality gates
- Cover quality scoring during CMS sync
- Complete `/docs` governance package and root operational docs
- Dual deploy: Cloudflare Pages (primary) + GitHub Pages (mirror)

### Village identity

- Name: Kondreddigaripalli (Reddivaripalli)
- Address: Devepatla (P), Sambepalli (M), Annamayya Dist, PIN 516215

### Notes

- No runtime upload API or database; GitHub remains the CMS
- Media pipeline emits warnings for corrupt/unsupported files instead of crashing
