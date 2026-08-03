# Installation

## Prerequisites

- **Node.js 22** (matches CI)
- **npm** (lockfile: `package-lock.json`)
- Optional: **ffmpeg** for local video conversion during CMS sync
- Optional: **Cloudflare account** + Wrangler login for deploy / R2
- Optional: **Google Chrome** if rendering Mermaid diagrams with `@mermaid-js/mermaid-cli`

## Clone and install

```bash
git clone https://github.com/ggovardhanreddy/festivals-rvp.git
cd festivals-rvp
cp .env.example .env.local
npm install
```

Fill `.env.local` as needed (see [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)). Never commit secrets.

## First local run

```bash
npm run sync
npm run dev
```

Open the URL printed by Next.js (typically `http://localhost:3000`).

Pages Functions (auth, community, media APIs) run on Cloudflare. Locally, static pages work; API-backed Super Admin / Fun Fest / R2 features need either:

- Deployed preview/production with bindings, or
- Local Wrangler Pages / Functions emulation (advanced; not required for gallery CMS work)

Local admin import helper: `npm run admin:api` (script `scripts/admin-server.ts`, port from `ADMIN_API_PORT`, default `8788`).

## Verify install

```bash
npm run typecheck
npm run lint
npm run validate
npm run test
```

## Related

[DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) · [TECH_STACK.md](./TECH_STACK.md)
