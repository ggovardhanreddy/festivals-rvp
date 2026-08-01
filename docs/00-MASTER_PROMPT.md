# 00 — Master Prompt & Project Charter

## Identity

**RVP Youth** is a premium **Digital Village Experience** for **Kondreddigaripalli (Reddivaripalli)**.

| Field | Value |
|---|---|
| Village | Kondreddigaripalli (also known as Reddivaripalli) |
| Post | Devepatla (P) |
| Mandal | Sambepalli (M) |
| District | Annamayya Dist |
| Pincode | 516215 |
| State | Andhra Pradesh, India |
| Brand | RVP Youth |
| Repository | `festivals-rvp` |
| Administrator | Govardhan Reddy |
| Primary deploy | Cloudflare Pages (`main`) |
| Mirror deploy | GitHub Pages |

This project is **not** a photo gallery, blog, or portfolio. Every product decision must reinforce cinematic storytelling of village history, traditions, celebrations, and memories.

## Priority order

When requirements conflict, apply this order:

1. This governance package (`/docs` + root operational docs)
2. Performance, accessibility, and deployability on free Cloudflare/GitHub infrastructure
3. Premium UI, motion, and 3D progressive enhancement
4. Feature breadth

## Non-negotiable principles

- **Performance** — static export, optimized media, progressive enhancement
- **Accessibility** — WCAG 2.2 AA target
- **Scalability** — new years, albums, festivals, villages without rewrite
- **Maintainability** — feature folders, typed modules, no dead code
- **Premium UI** — design tokens, restrained cinematic motion
- **Clean architecture** — content → sync → generated data → UI
- **Long-term support** — GitHub-as-CMS, no paid backend required

## Product surface

1. Cinematic 3D village hero with reduced-motion / low-power fallbacks
2. Festival & memory albums (Sankranthi, Vinayaka Chavithi, RVP Birthdays, Fun Trips)
3. Universal media (images, video, audio, documents)
4. Search, timeline, village story, interactive map, memory wall
5. GitHub folder CMS under `content/<YEAR>/<album>/`

## Engineering charter

Implement enterprise practices: SOLID, Clean Architecture, DRY, KISS, composition over inheritance, strong TypeScript, modular feature organization, consistent naming.

Never ship placeholder code, dummy implementations, TODO comments, dead code, unused components, or duplicate logic.

## Success definition

The project is complete only when build and deployment succeed, galleries and media render correctly, year/album detection and search/timeline work, Lighthouse and accessibility targets are met, documentation is complete, and no critical bugs remain.

See [12-ACCEPTANCE_CRITERIA.md](./12-ACCEPTANCE_CRITERIA.md).
