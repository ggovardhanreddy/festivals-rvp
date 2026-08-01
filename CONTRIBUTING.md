# Contributing to RVP Youth

Thank you for helping preserve the Digital Village Experience for **Kondreddigaripalli (Reddivaripalli)**.

## Ways to contribute

1. **Content** — add photos, videos, audio, or documents under `content/`
2. **Engineering** — improve UI, accessibility, performance, pipelines, or docs
3. **QA** — report broken media, routes, or accessibility issues

## Content contributions (most common)

GitHub is the CMS. Do **not** build upload APIs.

```text
content/<YEAR>/<album>/your-file.jpg
```

Albums:

- `sankranthi`
- `vinayaka-chavithi`
- `rvp-birthdays`
- `fun-trips`

Full instructions: [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) and [CONTENT.md](./CONTENT.md).

Workflow:

1. Branch or commit on `main` (content-only pushes to `main` are OK for maintainers)
2. Add media to the correct folder
3. Push
4. Wait for GitHub Actions to sync, validate, build, and deploy

## Engineering setup

```bash
npm install
npm run sync
npm run dev
```

Before opening a PR:

```bash
npm run lint
npm run typecheck
npm run format:check
npm run prepare:site
npm run validate
npx next build
```

## Standards

- Follow [docs/09-CODING_STANDARDS.md](./docs/09-CODING_STANDARDS.md)
- Use design tokens from `styles/tokens.css`
- No placeholders, TODOs, dead code, or dummy implementations
- Prefer small PRs with clear intent
- Update `/docs` when behavior or architecture changes

## Pull request checklist

- [ ] Builds locally
- [ ] Validate gate passes
- [ ] Responsive check done for touched UI
- [ ] Accessibility considered (keyboard, focus, reduced motion)
- [ ] Docs updated when needed

## Code of care

This archive holds family and village memories. Treat media and captions with respect. Do not publish private material without administrator approval (Govardhan Reddy).
