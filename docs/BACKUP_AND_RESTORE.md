# Backup and Restore

## Community JSON (Super Admin)

In `/admin/` → **Backup** tab ([`BackupPanel`](../components/admin/AdminHub.tsx)):

1. **Download full community backup** — aggregates live R2 collections into a dated JSON file (`reddivaripalli-backup-YYYY-MM-DD.json`)
2. **Restore** — upload a previous JSON to write collections back via the community API

Recommended cadence (from the UI copy):

| Cadence | Action |
|---|---|
| Daily | Download community backup after admin edits |
| Weekly | Full backup + confirm R2 media inventory |
| Monthly | Offline archive copy + test restore |

## What the backup covers

- R2 `community/*.json` collections (members, directory, heritage, lost-found, docs, settings, analytics/audit as implemented by the panel)
- **Does not** replace album CMS folders in Git
- **Does not** dump every media binary — media lives separately in the R2 bucket

## Media backups

- Prefer Cloudflare R2 versioning / periodic sync to cold storage if you enable it in the dashboard
- Keep `npm run media:migrate:r2` / inventory scripts in ops routines
- Git still holds `content/` originals for many albums (repo may sparse-exclude blobs in CI)

## Git baseline

Seed JSON under `content/data/` remains the offline/Git baseline. After restore from R2 backup, live site prefers R2 until emptied.

## Related

[ADMIN_GUIDE.md](./ADMIN_GUIDE.md) · [DATABASE.md](./DATABASE.md) · [CLOUDFLARE_R2.md](./CLOUDFLARE_R2.md)
