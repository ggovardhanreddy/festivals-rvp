# Admin Guide

Super Admin URL: **`/admin/`** (also linked as **Super Admin** in the site menu when signed in).

Default username env: `SUPER_ADMIN_USERNAME` (example in `.env.example`: `Govardhan`). Password is the PBKDF2 hash in `ADMIN_PASSWORD_HASH`.

## Sign in

1. Open `/admin/` or `/login/` admin form ([`AdminLoginForm`](../components/auth/AdminLoginForm.tsx))
2. POST `/api/admin/login` with username + password
3. Session cookie `rvp_admin` (HttpOnly, Secure, SameSite=Strict, 24h)

Generate hash locally:

```bash
npm run admin-hash -- "your-strong-password"
```

Paste into Cloudflare Pages secrets (and local `.env.local` for tooling).

## Edit Mode (Members)

When the Super Admin session is active, the header shows **Enter Edit Mode**:

- Toggles `sessionStorage` key `rvp-edit-mode`
- Enables inline member create/edit/reorder/archive/photo on `/members/` without opening the full hub
- Turns off automatically if the admin session ends

See [`lib/use-super-admin.ts`](../lib/use-super-admin.ts) and [`components/members/MembersGrid.tsx`](../components/members/MembersGrid.tsx).

## Admin hub tabs (actual UI)

[`components/admin/AdminHub.tsx`](../components/admin/AdminHub.tsx) includes tabs such as:

| Area | What you can do |
|---|---|
| Members | Manage roster; syncs to R2 `community/members.json` |
| Media / R2 | Upload via `/api/media/upload` into allowed categories |
| Directory | Professionals list → R2 |
| Documents | Register / manage panchayat docs (PDFs often under `documents/`) |
| Heritage / Lost & Found | Moderate; approve pending items |
| Settings | Site settings (watermark, download policy, privacy flags, maintenance) |
| Analytics | View recorded hits (admin GET) |
| Backup | Download / restore full community JSON backup |
| Approvals | Pending heritage & lost-found |

**Honest scope notes:**

- Album CMS (festival folders) still uses the **Git** workflow (`content/<YEAR>/…`). Admin API refuses album CMS writes (403).
- Blood donors were **removed in 1.2.0** — ignore older references in numbered docs.
- Some capability strings in `lib/roles.ts` describe intended powers; not every string maps to a separate API route.

## Members via Git (baseline)

1. Edit `content/data/members.json`
2. Run `npm run auth:members` after username-affecting changes
3. Deploy so seed + Fun Fest hashes ship; live R2 may already override members after admin edits

## Events & notifications

1. Edit `content/data/events.json` (festivals use `"category": "festival"`)
2. Client reminders: 2 days before, 1 day before, and day-of for festivals ([NOTIFICATIONS.md](./NOTIFICATIONS.md))
3. User prefs: `/settings/`

## Privacy practices

- Prefer `hideDirectoryContactsByDefault` and consent flags in site settings
- Do not publish phone/email without agreement
- Remove or archive personal records on request

## Launch checklist

- [ ] Mobile + desktop smoke
- [ ] Nav links
- [ ] Gallery loads from R2
- [ ] Fun Fest gated + signed media
- [ ] Super Admin login + Edit Mode
- [ ] Notifications prefs
- [ ] PWA install / update
- [ ] Sitemap / robots
- [ ] Backup download works

## Related

[AUTHENTICATION.md](./AUTHENTICATION.md) · [BACKUP_AND_RESTORE.md](./BACKUP_AND_RESTORE.md) · [MEDIA_MANAGEMENT.md](./MEDIA_MANAGEMENT.md) · [API_REFERENCE.md](./API_REFERENCE.md)
