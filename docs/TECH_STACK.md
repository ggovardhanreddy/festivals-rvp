# Tech Stack

Derived from `package.json` (version **1.2.0**) and project config.

## Runtime & framework

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.12** | App Router, `output: "export"` static site |
| UI | **React 19.2.8** / **React DOM 19.2.8** | Client components for admin, gallery, PWA |
| Language | **TypeScript 5** | `npm run typecheck` |
| Styling | **Tailwind CSS 4** + `@tailwindcss/postcss` | Tokens in `styles/tokens.css`, `lib/design-tokens.ts` |
| Hosting | **Cloudflare Pages** | Project `festivals-rvp`, output dir `out` |
| Edge APIs | **Cloudflare Pages Functions** | `functions/api/**`, `functions/_middleware.ts` |
| Object storage | **Cloudflare R2** | Bucket `reddivaripalli`, binding `MEDIA` |
| CLI | **Wrangler ^4.118.0** | Deploy + R2 tooling |

## Frontend libraries

| Package | Role |
|---|---|
| `framer-motion` | UI motion |
| `gsap` / `@gsap/react` | Animation sequences |
| `three` / `@react-three/fiber` / `@react-three/drei` | 3D village experience |
| `lenis` | Smooth scrolling |
| `lucide-react` | Icons |
| `next-themes` | Theme switching |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Class composition |
| `exifr` | EXIF during CMS sync (optional in CI) |
| `sharp` | Image optimization in Node scripts |

## Tooling

| Tool | Purpose |
|---|---|
| `tsx` | Run TypeScript scripts |
| `eslint` + `eslint-config-next` | Lint |
| `prettier` | Format |
| Node **22** | CI (`actions/setup-node`) |

## Build / CMS scripts (high level)

| Script | Purpose |
|---|---|
| `prepare:site` | Folders, CMS sync, logos, music, member-auth, generate indexes, rewrite album URLs for R2 |
| `sync` / `generate` / `validate` / `test` | Content pipeline & quality gates |
| `media:migrate:r2` / `media:strip-local` | R2 upload + slim Pages artifact |
| `deploy:cf` | Build → strip → `wrangler pages deploy` |
| `auth:members` | PBKDF2 Fun Fest credential generation |

## Explicit non-choices

- **No SQL database** — JSON in Git + R2 community collections
- **No Next.js server runtime in production** — static `out/` + Pages Functions only
- **Images unoptimized by Next** — `images: { unoptimized: true }` (Sharp used in scripts instead)

## Related

[ARCHITECTURE.md](./ARCHITECTURE.md) · [INSTALLATION.md](./INSTALLATION.md) · [CLOUDFLARE_PAGES.md](./CLOUDFLARE_PAGES.md)
