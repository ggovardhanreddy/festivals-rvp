# Authentication

Two independent cookie sessions exist.

## Super Admin

| Item | Value |
|---|---|
| Endpoints | `POST /api/admin/login`, `GET /api/admin/session`, `POST /api/admin/logout` |
| Cookie | `rvp_admin` |
| Cookie flags | HttpOnly; Secure; SameSite=**Strict**; Path=/; Max-Age=86400 |
| Password | `ADMIN_PASSWORD_HASH` = `pbkdf2:<salt>:<hash>` at **100,000** iterations |
| Username | `SUPER_ADMIN_USERNAME` (case-insensitive compare); default `Govardhan` |
| Payload | `{ sub, role: "super-admin", exp }` + HMAC via `ADMIN_SESSION_SECRET` |

Implementation: [`functions/api/admin/[[route]].ts`](../functions/api/admin/[[route]].ts).

**Workers note:** iterations must stay at 100k — higher values previously caused Worker error **1101** (CPU limit).

## Fun Fest member

| Item | Value |
|---|---|
| Endpoints | `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout` |
| Cookie | `rvp_member` |
| Cookie flags | HttpOnly; Secure; SameSite=**Lax**; 7 days |
| Roster hashes | `functions/_data/member-auth-data.ts` (from `npm run auth:members`) |
| Initial password | Equals username (case-sensitive) |
| Secret | `MEMBER_SESSION_SECRET` \|\| `ADMIN_SESSION_SECRET` \|\| dev fallback |

Shared crypto helpers: [`functions/api/auth/_shared.ts`](../functions/api/auth/_shared.ts).

Username derivation: [`lib/auth.ts`](../lib/auth.ts) `memberUsername` / `assignMemberUsernames`.

## Route protection

[`functions/_middleware.ts`](../functions/_middleware.ts) redirects unauthenticated requests under `/fun-trips/` to `/login/?next=…`.

Private media signing also accepts either admin or member cookies ([`functions/api/media/[[route]].ts`](../functions/api/media/[[route]].ts)).

## Client helpers

- Admin: [`lib/use-super-admin.ts`](../lib/use-super-admin.ts), `RequireAdmin`
- Member: `readSession` / `writeSession` in `lib/auth.ts` (sessionStorage UI mirror)

## Regenerating member auth

```bash
npm run auth:members          # incremental
npm run auth:members:force    # MEMBER_AUTH_FORCE=1 rewrite hashes
```

## Related

[SECURITY.md](./SECURITY.md) · [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) · [MEMBER_GUIDE.md](./MEMBER_GUIDE.md)
