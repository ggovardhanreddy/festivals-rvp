# Developments Guide

## Purpose

The **Developments** section tracks village projects with status, stages, and milestones — e.g. **Sri Ramalayam Reconstruction**.

Route: **`/developments/`**.

## Data source

[`content/data/developments.json`](../content/data/developments.json) (static seed at build time).

Typical fields (see [`lib/types.ts`](../lib/types.ts) / helpers in `lib/developments.ts`, `lib/development-status.ts`):

| Field | Role |
|---|---|
| `id`, `title`, `description` | Project identity |
| `status` | e.g. `critical-decision`, `under-construction`, `ongoing`, … |
| `startDate` | Project start |
| `currentStage` / `stages[]` | Pipeline labels |
| `images[]` | Media paths |
| `milestones[]` | `{ date, title, description }` |

## Notifications

Active projects surface in the notification center when status is critical/under-construction/ongoing, or the latest milestone is within ~21 days ([`lib/notifications.ts`](../lib/notifications.ts)).

## Editing workflow

1. Edit `content/data/developments.json`
2. Commit + deploy

There is no R2 community collection for developments today — Git is authoritative. Admin media category `developments` can store uploaded assets in R2; wire paths into the JSON as needed.

## Related

[EVENTS_GUIDE.md](./EVENTS_GUIDE.md) · [NOTIFICATIONS.md](./NOTIFICATIONS.md) · [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
