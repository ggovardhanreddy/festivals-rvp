# Testing

| Layer | Tool | Command | Covers |
|---|---|---|---|
| Static | eslint, tsc | `npm run lint`, `npm run typecheck` | App **and** Cloudflare Functions |
| Content | tsx | `npm run validate`, `npm run content:validate` | Site invariants, content schemas |
| i18n | tsx | `npm run i18n:check` | Every used key exists; Telugu coverage |
| Unit | vitest | `npm run test:unit` | 41 tests |
| E2E + a11y | Playwright | `npm run test:e2e` | 98 checks, mobile + desktop |
| Smoke | tsx | `npm test` | 8 config assertions |

## Unit (41)

`tests/unit/` — i18n fallback and path helpers, route registry and hreflang
honesty, search normalisation and scoring, media-card payload slimming.

## E2E (98, mobile + desktop)

`tests/e2e/routes.spec.ts` — all 28 public routes render with an `h1`;
homepage has exactly one `h1` and parseable JSON-LD; the `#overview` anchor
contract holds; gallery renders with filters; `robots.txt` and
`search-index.json` exclude private content.

`tests/e2e/i18n.spec.ts` — English at `/`, Telugu at `/te/`, `html lang`
follows the URL, Telugu script actually renders, **computed font-family really
resolves to the Telugu face**, hreflang only where a translation exists, and
the switcher never links to a 404.

`tests/e2e/a11y.spec.ts` — axe on 7 routes at mobile and desktop, failing on
serious or critical; the calendar is a valid ARIA grid; the skip link is the
first focusable element.

## Bugs these tests actually caught

1. `normalize()` deleted Telugu vowel signs — `\p{M}` missing from the keep-set.
2. Two sitewide WCAG AA contrast failures (`.footer-build` 3.18:1,
   `.festival-card-badge` 3.99:1).
3. Two `h1` elements on the homepage after the Phase 1B hero landed.
4. Closed drawer and sheet left focusable links in the tab order
   (`aria-hidden-focus`), putting a nav link ahead of the skip link.

## Known-quality tests

`routes.spec.ts` has a test asserting that **at most two** consent overlays
appear on first visit and that each has a dismiss control. Two is the current
reality and it is a UX defect; the test exists so the number cannot grow
silently and so Phase 1B has a signal to reduce it against.

## Running

```bash
npm ci
npx playwright install chromium   # once
npm run lint && npm run typecheck && npm test && npm run validate
npm run test:unit
npm run build
npm run test:e2e                  # serves out/ on :4321
```

`PLAYWRIGHT_CHROMIUM_PATH` overrides the browser binary where a CI image ships
a mismatched Chromium.
