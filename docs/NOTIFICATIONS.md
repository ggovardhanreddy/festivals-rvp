# Notifications

## Model

In-app notifications are **computed on the client** from baked/seed data + prefs — not pushed from a server worker.

Source: [`lib/notifications.ts`](../lib/notifications.ts).

### Kinds

`birthday` · `event-reminder` · `event-day` · `festival-reminder` · `festival-day` · `development` · `announcement`

### Preference keys

Stored in `localStorage` under `rvp-notification-prefs`:

`birthdays` · `festivals` · `events` · `developments` · `announcements` (all default **true**).

UI: **`/settings/`**. Permission ask marker: `rvp-notification-permission-asked`. Optional browser `Notification` permission for richer prompts when the UI requests it.

## Festival / event timing

| Offset | Festival | Other events |
|---|---|---|
| Day of | Popup + banner | Popup |
| −1 day | “Tomorrow” popup | Reminder popup |
| −2 days | Festival-only popup | — |
| Within `reminderDaysBefore` | — | Non-popup countdown items |

## Birthdays

Members whose DOB month-day matches today get a birthday notification (age line when computable). Links to `/members/`.

## Developments & announcements

- Developments: active statuses or recent milestones (~21 days)
- Announcements: items with `important: true` from `content/data/announcements.json`

## Partial / honest limits

- No Cloudflare Queues / Web Push service is implemented in this repo
- Offline users see whatever was last computed after data load
- Emoji in notification titles are present in current code

## Related

[EVENTS_GUIDE.md](./EVENTS_GUIDE.md) · [PWA.md](./PWA.md) · [MEMBER_GUIDE.md](./MEMBER_GUIDE.md)
