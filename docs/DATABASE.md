# Database

There is **no SQL database**. Persistence is:

1. **Git JSON / folders** — CMS + seed data
2. **Cloudflare R2 JSON** — live community collections
3. **Build artifacts** — `generated/*.json` committed or produced in CI
4. **Browser storage** — prefs / UI session mirrors

## Git seed files (`content/data/`)

| File | Used for |
|---|---|
| `members.json` | Roster seed + Fun Fest auth generation |
| `directory.json` | Village professionals seed |
| `events.json` | Events / festival calendar |
| `developments.json` | Village projects |
| `announcements.json` | Important notices |
| `heritage.json` | Heritage seed |
| `lost-found.json` | Lost & Found seed |
| `panchayat-docs.json` | Documents seed |
| `site-settings.json` | Watermark / privacy defaults |
| `suggestions.json` | Suggestions seed |
| `member-photo-map.json` | Photo mapping helper |

## R2 community store

Path pattern: `community/<collection>.json` via binding `MEDIA`.

Collections ([`functions/api/community/[[route]].ts`](../functions/api/community/[[route]].ts)):

| Collection | Shape notes |
|---|---|
| `directory` | `{ items: [...] }` |
| `members` | `{ items: [...] }` |
| `lost-found` | items; public filter `status === approved` |
| `panchayat-docs` | admin write |
| `heritage` | items; public filter approved |
| `site-settings` | object / settings map |
| `analytics` | `{ hits: [...] }` capped (~5000) |
| `audit` | `{ items: [...] }` capped (~1000) |

When R2 is empty, clients fall back to seed data via [`lib/use-community.ts`](../lib/use-community.ts) / community helpers.

## Album index

| Artifact | Role |
|---|---|
| `generated/albums.json` | Primary album catalog |
| `content/hashes.json` / `phashes.json` | Dedup indexes |
| `generated/r2-migration.json` | Migration bookkeeping |

## Member model (high level)

See `Member` in [`lib/types.ts`](../lib/types.ts): `id`, `name`, `photo`, `dob`, `group` (`legacy` \| `core` \| `nextgen`), `designation`, memorial/status fields, optional contact/social.

## Related

[API_REFERENCE.md](./API_REFERENCE.md) · [BACKUP_AND_RESTORE.md](./BACKUP_AND_RESTORE.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)
