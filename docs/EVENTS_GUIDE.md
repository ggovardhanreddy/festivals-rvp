# Events Guide

## Data source

Events are defined in [`content/data/events.json`](../content/data/events.json) and baked into the static build (not the R2 community API).

Shape ([`lib/types.ts`](../lib/types.ts) `SiteEvent`):

| Field | Notes |
|---|---|
| `id` | Stable id |
| `title` | Display name |
| `date` / `endDate` | ISO dates |
| `description` | Short copy |
| `category` | `festival` \| `village` \| `birthday` \| `other` |
| `slug` | Optional festival route (e.g. `ugadi`) |
| `image` | Optional cover path |
| `reminderDaysBefore` | Default 7 for countdown reminders |
| `recurring` | Hint for annual festivals |

## Public UI

- **`/events/`** — events listing
- Festival category items link to chapter routes when `slug` is set

## Reminders

Built client-side by [`lib/notifications.ts`](../lib/notifications.ts):

| Kind | When |
|---|---|
| Festival day | During event window |
| Festival −1 day | Tomorrow banner |
| Festival −2 days | “2 days left” |
| Non-festival events | Day-of, −1 day, and countdown within `reminderDaysBefore` |

Users toggle categories under `/settings/`.

## Editing workflow

1. Update `content/data/events.json`
2. Commit + push (or local `npm run prepare:site` / `build`)
3. No Super Admin “events API” today — Git is the CMS for this file

Announcements live in `content/data/announcements.json` (important ones appear in the notification center).

## Related

[NOTIFICATIONS.md](./NOTIFICATIONS.md) · [FESTIVALS_GUIDE.md](./FESTIVALS_GUIDE.md)
