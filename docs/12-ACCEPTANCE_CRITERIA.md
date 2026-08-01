# 12 — Acceptance Criteria

The Digital Village Experience for **Kondreddigaripalli (Reddivaripalli)** is complete only when all items below are true.

## Build & deploy

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run prepare:site` completes
- [ ] `npm run validate` passes
- [ ] Production static build succeeds
- [ ] Cloudflare Pages deployment from `main` succeeds (primary)
- [ ] GitHub Pages mirror deploys or is intentionally documented as secondary

## Product correctness

- [ ] Website is fully responsive (mobile → desktop)
- [ ] All galleries render correctly
- [ ] Images, videos, and audio display/play correctly
- [ ] Documents are reachable when present
- [ ] Year detection works automatically from `content/`
- [ ] Album detection works automatically for known buckets
- [ ] Search works
- [ ] Timeline works
- [ ] Village identity and address appear on About + Footer
- [ ] 3D experience works with graceful fallbacks

## Quality

- [ ] Lighthouse targets achieved on key static routes (see Testing doc)
- [ ] Accessibility targets toward WCAG 2.2 AA met for primary flows
- [ ] No critical bugs remain
- [ ] Media pipeline warns on bad files instead of crashing
- [ ] Design tokens centralize visual constants

## Documentation

- [ ] `/docs` package complete (`00`–`12`)
- [ ] Root docs complete: README, CONTRIBUTING, CHANGELOG, DEPLOYMENT, CONTENT_GUIDE, TROUBLESHOOTING, LICENSE

## Final objective check

The live site feels like a **premium Digital Village Experience** — cinematic, fast, accessible, maintainable — deployable via GitHub and Cloudflare Pages without paid infrastructure.
