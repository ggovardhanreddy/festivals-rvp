# 10 — Testing & Quality Gates

## Quality gates (mandatory before deploy)

Automatically verify:

1. TypeScript (`npm run typecheck`)
2. ESLint (`npm run lint`)
3. Production build succeeds (`next build` / `npm run build`)
4. Media sync completes with warnings-only failures for bad files
5. Search index generates
6. Timeline / year data generates
7. `npm run validate` passes (required assets, no duplicate routes, content layout sanity)
8. No missing critical brand/PWA/SEO assets

Optional local checks:

- Responsive smoke at mobile / tablet / desktop widths
- Keyboard pass on nav, search, lightbox, hotspots
- Reduced-motion spot check
- Lighthouse on production URL after deploy

## Validation script

`scripts/validate-site.ts` fails the process on critical errors and prints warnings for softer issues (empty albums, unexpected folders, missing individual media samples).

## Media validation

Handled primarily in `sync-cms.ts`:

- Unsupported formats → warn + skip
- Corrupt images/videos → warn + skip
- Duplicate filenames → warn + skip
- Optimize failures → warn + fallback/skip path

## Manual QA checklist

- [ ] Home cinematic hero loads (3D or fallback)
- [ ] Each bucket hub renders albums
- [ ] Album pages show images/video/audio/docs correctly
- [ ] Search returns expected titles
- [ ] Timeline lists years
- [ ] About shows village name + full address
- [ ] Footer shows address line
- [ ] No broken primary nav links
- [ ] Dark/light theme readable
- [ ] GitHub Pages base path assets resolve when testing that target

## Lighthouse targets

Aim for production scores at or above:

- Performance ≥ 95 (static pages; 3D route may vary by device)
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

Investigate regressions after large media imports or dependency upgrades.

## Browser matrix

Current stable:

- Chrome
- Edge
- Firefox
- Safari

Unsupported features must degrade gracefully (see progressive enhancement docs).
