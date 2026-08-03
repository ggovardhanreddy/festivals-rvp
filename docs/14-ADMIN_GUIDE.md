# Admin Guide — Reddivaripalli Gram Panchayat Portal

This site is the **official digital identity** of Reddivaripalli Gram Panchayat, stewarded by RVP Youth. Prefer changes that will still be useful in ten years.

Live admin: `/admin/` (password required)

## Adding members

1. Update `content/data/members.json` (name, DOB, photo, group, designation).
2. Run sync/deploy so photos resolve via Cloudflare R2.
3. Birthdays auto-appear on the homepage and in notifications.

## Uploading media

1. Sign in at `/admin/` → **Media / R2**.
2. Prefer WebP/MP4. For HEIC/MOV, use local import (`npx tsx scripts/admin-server.ts`) then `npm run media:migrate:r2`.
3. Keep albums under year + festival folders so the **Annual Archive** stays clear.

## Managing events & notifications

1. Edit `content/data/events.json` (festivals include `category: "festival"`).
2. Reminders fire automatically: 2 days before, 1 day before, and festival day.
3. Users control prefs under `/settings/`.

## Village Directory & documents

1. **Directory** tab — add/edit/remove professionals; **Save directory** writes to R2.
2. **Documents** — upload PDF to R2 `documents/`, then register the key in the Documents tab.
3. Only publish phone/email when the person agreed (see Privacy).

## Approvals

Use **Approvals** for:

- Lost & Found
- Blood donors
- Heritage submissions

Pending items are not public until approved.

## Privacy

- Blood donors: mobile hidden unless they opt in.
- Settings: hide directory contacts by default; require consent for personal data.
- Hide or remove any personal record immediately if someone requests it.

## Backups & restore

1. **Backup** tab → Download full community backup (JSON).
2. Recommended cadence:
   - Daily incremental after admin edits
   - Weekly full + R2 media check
   - Monthly offline archive + test restore
3. Restore from the same tab using a previous JSON file.
4. Media files live in the R2 bucket separately — keep migration/sync scripts in your ops routine.

## Launch checklist

- [ ] Android, iPhone, tablet, desktop
- [ ] All navigation links
- [ ] Image/video uploads
- [ ] Notifications (birthday/festival)
- [ ] PWA install
- [ ] SEO: sitemap, robots.txt, metadata
- [ ] Backup download works
- [ ] Accessibility basics
- [ ] No console errors on key pages
- [ ] Gallery loads from Cloudflare R2

## Growth note

Community JSON is stored as named collections in R2 (`community/*.json`). New villages/temples/festivals can add collections or scoped keys without rewriting the public app shell.
