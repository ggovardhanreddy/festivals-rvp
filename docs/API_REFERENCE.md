# API Reference

All routes are **Cloudflare Pages Functions** under `functions/api/`. They require the production/preview Pages deployment with bindings (not available on pure `next dev` without Wrangler).

CORS: reflect request origin; credentials allowed. JSON `content-type: application/json` unless streaming media.

---

## Admin — `/api/admin/*`

Source: [`functions/api/admin/[[route]].ts`](../functions/api/admin/[[route]].ts)

| Method | Path | Auth | Body / notes | Response |
|---|---|---|---|---|
| GET | `/api/admin/session` | Cookie optional | — | `{ ok, role, username }` |
| POST | `/api/admin/login` | None | `{ username, password }` | `{ ok, role, username }` + `Set-Cookie: rvp_admin=…` |
| POST | `/api/admin/logout` | — | — | `{ ok: true }` clears cookie |
| * | other | — | — | **403** — album CMS via Git; community via `/api/community/*` |

Errors: `503` if secrets missing; `401` invalid credentials; `400` bad JSON.

---

## Auth (Fun Fest) — `/api/auth/*`

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/login` | `{ username, password }` | `{ ok, session }` + `rvp_member` cookie; or `401` |
| GET | `/api/auth/session` | — | Session payload or guest |
| POST | `/api/auth/logout` | — | Clears cookie |
| OPTIONS | any | — | CORS preflight |

---

## Community — `/api/community/:collection`

Source: [`functions/api/community/[[route]].ts`](../functions/api/community/[[route]].ts)

**Collections:** `directory` · `members` · `lost-found` · `panchayat-docs` · `heritage` · `site-settings` · `analytics` · `audit`

| Method | Auth | Behavior |
|---|---|---|
| GET | Public (filtered) | Returns `{ items, source }` or settings; approval collections hide non-approved unless `?admin=1` **and** admin cookie |
| POST | Varies | Append/upsert `item`; `lost-found`/`heritage` set `pending` for non-admin; `directory`/`members`/`panchayat-docs` require admin; `analytics` accepts `{ hit }`; `audit` requires admin |
| PUT | Admin | Replace `{ items }` or `{ settings }` |
| DELETE | Admin | `?id=` remove item |

`site-settings`: GET returns defaults if empty; PUT requires admin.

---

## Media — `/api/media/*`

Source: [`functions/api/media/[[route]].ts`](../functions/api/media/[[route]].ts)

Requires R2 binding `MEDIA` (else `503`).

### `POST /api/media/upload`

- Auth: **admin** cookie
- `multipart/form-data`: `file`, `category`, optional `originalName`, `width`, `height`, `duration`, **`year`**, **`album`** / `bucket`, `person`, `preserveOriginal`
- When `year` + `album` are set (gallery/videos/funfest), key is structured: `gallery/{year}/{album}/…` (discoverable by reindex)
- Rejects protected `hero.webp` keys (festival/brand heroes)
- HEIC/MOV: stored as-is; optional `originals/` paired copy — Workers do not convert formats
- Categories: see [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md)
- Response: `{ ok, key, publicUrl, private, size, mime, originalKey, note, next, … }`

### `POST /api/media/reindex`

- Auth: **admin** cookie
- Lists R2 `gallery/`, `videos/`, `audio/`, `funfest/` via binding
- Writes `catalog/albums.json` (+ `catalog/albums.array.json`)
- Optional JSON body `{ "dispatch": true }` → GitHub `repository_dispatch` `content-sync` when `GITHUB_DISPATCH_TOKEN` is configured
- Does **not** modify festival hero objects
- Response: `{ ok, catalogKey, albums, media, objects, github, … }`

### `GET /api/media/sign?key=`

- Private keys require admin **or** member session
- Returns `{ url, exp }` — signed object URL (~15 minutes)

### `GET /api/media/object?key=&exp=&sig=`

- Streams object body from R2
- Private keys require valid signature + expiry
- Cache-Control: private short for private; long immutable for public

---

## Related

[AUTHENTICATION.md](./AUTHENTICATION.md) · [DATABASE.md](./DATABASE.md) · [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md)
