# Project Overview

## What this is

The **Reddivaripalli Village Portal** is the official digital home of **Reddivaripalli Gram Panchayat** (village: **Kondreddigaripalli** / Reddivaripalli), stewarded by **RVP Youth**. It preserves festivals, people, developments, and community services so the archive stays useful for years.

| Field | Value |
|---|---|
| Official title | Reddivaripalli Gram Panchayat |
| Village | Kondreddigaripalli (Reddivaripalli) |
| Region | Devapatla · Sambepalle Mandal · YSR Kadapa (Annamayya) · PIN 516215 |
| Stewards | RVP Youth |
| Brand line | Where Every Celebration Becomes a Legacy. |
| Live URL | https://www.reddivaripalli.com |
| App version | 1.2.0 |

Source of identity constants: [`lib/site.ts`](../lib/site.ts).

## Who it serves

| Audience | What they get |
|---|---|
| Public visitors | Home, gallery, festivals, events, directory (public fields), developments, heritage (approved), documents (published), timeline, about |
| Members | Fun Fest private albums (`/fun-trips/`) after login; can submit Lost & Found / heritage (pending approval) |
| Super Admin | `/admin/` dashboard, Edit Mode on Members, R2 uploads, community JSON in R2, approvals, backups |

## What the portal includes today

- **Annual Archive** — year + festival albums from Git `content/`
- **Culture festivals** — chapter pages (Vinayaka Chavithi, Sankranti, Ugadi, Deepavali, Dasara, jatharas, etc.)
- **Gallery hub** — albums grouped by year → festival, covers from R2 when configured
- **Members directory** — Legacy / Core / Next Generation, memorials, stats, View Profile; Super Admin Edit Mode
- **Village Directory** — professionals (Doctors, Teachers, Government Employees, Other Professionals)
- **Events & notifications** — festivals/events from `content/data/events.json`, client-side reminders
- **Developments** — project status + milestones (e.g. Sri Ramalayam)
- **Heritage Archive**, **Lost & Found**, **Panchayat Documents**, **Suggestions**
- **Fun Fest** — members-only trips media (signed / gated)
- **PWA** — installable app shell with service worker + version check
- **Super Admin** — Cloudflare Pages Functions + R2 community stores

## What was removed (1.2.0)

- **Blood Donor** directory, routes, admin tab, and community API collection — bookmarks redirect via `public/_redirects`

## How content is managed

| Content type | Source of truth | Runtime store |
|---|---|---|
| Festival / birthday / Fun Fest albums | Git `content/<YEAR>/<bucket>/` | `generated/albums.json` (+ R2 URLs) |
| Seed JSON (events, developments, announcements, suggestions) | `content/data/*.json` baked into static build | Static |
| Members / directory / heritage / lost-found / docs / settings | Seed JSON + Super Admin writes | R2 `community/*.json` (live) |
| Media binaries | Local `public/` + migrate | R2 bucket `reddivaripalli` |

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) · [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) · [MEMBER_GUIDE.md](./MEMBER_GUIDE.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)
