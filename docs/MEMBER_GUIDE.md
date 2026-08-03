# Member Guide

## Fun Fest access

**Fun Fest** (`/fun-trips/`) is members-only. Middleware redirects unauthenticated browsers to `/login/?next=…`.

### Credentials

- Username = case-sensitive first significant name derived from the roster (e.g. `M Rajesh` → `Rajesh`; duplicates get initials/suffixes — see [`lib/auth.ts`](../lib/auth.ts))
- Initial password = **same as username** (hashed with PBKDF2 into `functions/_data/member-auth*`)
- Login trims username/password (1.2.0)

Login API: `POST /api/auth/login` → cookie `rvp_member` (HttpOnly, Secure, SameSite=Lax, 7 days).

Client also keeps a sessionStorage mirror (`rvp-member-session`) for UI.

### Sign out

`POST /api/auth/logout` clears the cookie.

## What members can do

| Capability | Status |
|---|---|
| View public site | Yes |
| Access Fun Fest albums / private media (signed) | Yes when session valid |
| Submit Lost & Found / Heritage | Yes — items land as `pending` until Super Admin approves |
| Submit suggestions | Public suggestions page (seed / UI) |
| Edit public directory / members / docs | **No** — admin only |
| Upload to R2 media API | **No** — admin cookie required |

Role matrix: [`lib/roles.ts`](../lib/roles.ts).

## Notification preferences

Visit `/settings/` to toggle birthdays, festivals, events, developments, announcements (stored in `localStorage`).

## Troubleshooting login

- Usernames/passwords are **case-sensitive**
- Ensure production has `MEMBER_SESSION_SECRET` or `ADMIN_SESSION_SECRET` set (dev fallback exists in code but must not be relied on in production)
- After roster renames, Super Admin / steward should regenerate auth with `npm run auth:members`

## Related

[AUTHENTICATION.md](./AUTHENTICATION.md) · [GALLERY_GUIDE.md](./GALLERY_GUIDE.md) · [SECURITY.md](./SECURITY.md)
