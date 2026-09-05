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

## Correcting or removing a person (Phase 1)

Anyone can ask for their listing to be corrected or removed. The People page
carries the request address, and there are two mechanisms behind it. Which one
to use depends on whether the person should still appear at all.

**Archive** — the person stays in the roster but is no longer published. Set
`archived: true` on the record, in `content/data/members.json` or through the
admin Members tab. They keep their id, so nothing that references them breaks,
and they can be restored by clearing the flag.

**Retire** — the person is removed from the published site entirely. Add their
id to `content/data/members-removed.json`. This list is enforced in one place,
`publishedMembers()` in `lib/member-stats.ts`, which is what every page counts
and lists from, and it is also applied when the R2 overlay is merged — so a
retired id cannot come back through an admin save.

Retiring is the stronger of the two: it survives a roster re-import, because the
id is refused rather than merely absent.

### What is never published

`phone`, `email`, `bloodGroup` and `address` may be recorded for the admin's
use, but the community API strips them from every non-admin response
(`PUBLIC_REDACTED_FIELDS` in `functions/api/community/[[route]].ts`). The
committed roster carries none of them today, and `npm run validate` warns if one
appears, so this stays true rather than depending on the field being left blank.

### Counts

Never write a member number into a page or a translation string. Every figure
comes from `lib/people-stats.ts`, which reports two separate populations: the
member roster (`roster.total`, plus the three group counts) and the family-tree
records (`tree.people`, `tree.adapaduchulu`). They are different sets of people
and must be labelled differently — describing both as "the directory" is what
made the site appear to contradict itself.
