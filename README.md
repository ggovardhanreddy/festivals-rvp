# RVP Youth — Digital Village Experience

A premium cinematic heritage archive for **Kondreddigaripalli (Reddivaripalli)** — not a photo gallery, blog, or portfolio.

| | |
|---|---|
| Village | Kondreddigaripalli (Reddivaripalli) |
| Address | Devepatla (P), Sambepalli (M), Annamayya Dist, PIN 516215 |
| Brand | RVP Youth |
| Repo | https://github.com/ggovardhanreddy/festivals-rvp |
| Live site | https://www.reddivaripalli.com |
| Cloudflare Pages | https://festivals-rvp.pages.dev |
| GitHub Pages | https://ggovardhanreddy.github.io/festivals-rvp/ |

## GitHub is the CMS

Manage media in the repository:

```text
content/<YEAR>/sankranthi/
content/<YEAR>/vinayaka-chavithi/
content/<YEAR>/rvp-birthdays/
content/<YEAR>/fun-trips/
```

Push to `main` → Actions sync, optimize, validate, build, and deploy.

Guides: [CONTENT_GUIDE.md](./CONTENT_GUIDE.md) · [CONTENT.md](./CONTENT.md)

## Stack

Next.js App Router · TypeScript · Tailwind · Sharp · Framer Motion · GSAP · Three.js / R3F · Lenis · Cloudflare Pages

## Local development

```bash
npm install
npm run sync
npm run dev
```

| Command | Purpose |
|---|---|
| `npm run sync` | Scan `content/`, optimize media, write `generated/albums.json` |
| `npm run generate` | Search index, sitemap, feed, manifest |
| `npm run validate` | Pre-deploy quality gate |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Full production build |

## Documentation

Governance and engineering docs live in [`/docs`](./docs):

- [00 Master Prompt](./docs/00-MASTER_PROMPT.md)
- [01 Architecture](./docs/01-ARCHITECTURE.md)
- [02 Design System](./docs/02-DESIGN_SYSTEM.md)
- [03 UI/UX](./docs/03-UI_UX.md)
- [04 Animations](./docs/04-ANIMATIONS.md)
- [05 3D Experience](./docs/05-3D_EXPERIENCE.md)
- [06 Gallery](./docs/06-GALLERY.md)
- [07 Media Pipeline](./docs/07-MEDIA_PIPELINE.md)
- [08 Deployment](./docs/08-DEPLOYMENT.md)
- [09 Coding Standards](./docs/09-CODING_STANDARDS.md)
- [10 Testing](./docs/10-TESTING.md)
- [11 Future Roadmap](./docs/11-FUTURE_ROADMAP.md)
- [12 Acceptance Criteria](./docs/12-ACCEPTANCE_CRITERIA.md)

Operator docs: [CONTRIBUTING](./CONTRIBUTING.md) · [DEPLOYMENT](./DEPLOYMENT.md) · [TROUBLESHOOTING](./TROUBLESHOOTING.md) · [CHANGELOG](./CHANGELOG.md) · [LICENSE](./LICENSE)

## Design tokens

Visual constants are centralized in `styles/tokens.css` (CSS) and `lib/design-tokens.ts` (TS). Do not hardcode colors, radii, shadows, or motion values in features.

## Quality gates

Deployments run typecheck, lint, sync, validate, and production build. Validation failures block deploy.

## License

Software: MIT — see [LICENSE](./LICENSE). Heritage media remains community-owned.
