# Backup and Recovery

**Created:** Phase 0, 2026-08-28
**Supersedes for platform work:** `BACKUP_AND_RESTORE.md` (kept; narrower scope)
**Status:** procedure documented. **No backup has been taken by this audit.**

---

## 1. What must survive

Ranked by how bad it would be to lose, and whether it is recoverable elsewhere.

| Asset | Where it lives | Size | Recoverable? |
|---|---|---|---|
| **Village photographs and video** | R2 bucket `reddivaripalli`, plus `public/` and `content/` in git | ~1.7 GB in `public/`, ~2 GB in `content/` | **No.** Irreplaceable |
| **Editorial content** | `content/data/*.json`, 13 files | 53 KB | Only from git |
| **Village heritage record** | `content/data/village-heritage.json` | 28 KB | Only from git |
| Runtime community state | R2 `community/*.json`, 11 collections | small | Seeds in git; edits made through Admin are **not** |
| Album catalogue | `generated/albums.json` | 587 KB | Rebuildable from media |
| Member credentials | `functions/_data/member-auth.*` | 10 KB | Regenerable (and should be moved out of git — see `SECURITY_INCIDENT.md`) |
| Source code | git, GitHub | — | Yes |
| Secrets | Cloudflare Pages env, local `.env.local` | — | **No.** Never committed, no second copy |

### The two gaps

1. **R2 has no backup.** Cloudflare R2 does not version objects by default. A mistaken
   `delete` through the Admin media panel or a bad `migrate-media-to-r2` run is
   permanent. This is the single largest data risk in the project.
2. **Runtime community edits have no backup.** Anything an admin changes through
   `/admin/` is written to `community/<collection>.json` in R2 and overwrites the
   previous value. There is no history and no undo. The git seeds only restore the
   *original* values, silently discarding every later edit.

---

## 2. Before any Phase 1 work — the restore point

Run all four. None of them modifies anything.

### 2.1 Tag the current commit

```bash
cd /Users/govardhan.reddy.g.94gmail.com/Projects/festivals-rvp
git tag -a pre-phase-1 -m "State before platform work. Audited 2026-08-28."
git push origin pre-phase-1
```

### 2.2 Mirror the repository

```bash
git clone --mirror https://github.com/ggovardhanreddy/festivals-rvp.git \
  ~/backups/festivals-rvp-mirror-$(date +%Y%m%d).git
```

A mirror includes every branch, tag and reflog. Keep it off the same disk.

### 2.3 Snapshot the R2 community collections

Small, high-value, changes constantly.

```bash
mkdir -p ~/backups/r2-community-$(date +%Y%m%d)
for c in directory members lost-found panchayat-docs heritage suggestions \
         site-settings analytics audit events announcements; do
  npx wrangler r2 object get reddivaripalli "community/$c.json" \
    --file "$HOME/backups/r2-community-$(date +%Y%m%d)/$c.json" || \
    echo "absent: $c (serving git seed)"
done
```

An "absent" result is normal — it means that collection has never been written and the
Function is serving the git seed.

### 2.4 Record the media inventory

Not the media itself — the list, so loss is detectable.

```bash
npx wrangler r2 object list reddivaripalli --json \
  > ~/backups/r2-inventory-$(date +%Y%m%d).json
```

`scripts/r2-list-objects.ts` already exists and may be more convenient.

---

## 3. Ongoing backup schedule

| What | Frequency | Method | Effort |
|---|---|---|---|
| Repository mirror | Weekly | `git clone --mirror` to external disk | 2 min |
| R2 community collections | Weekly, and before any admin bulk edit | § 2.3 | 1 min |
| R2 media inventory | Monthly | § 2.4 | 1 min |
| R2 media objects | Quarterly, and after each festival upload | `rclone sync` (see § 4) | Hours |
| Cloudflare secrets | On every change | Password manager entry, never a file | — |
| Tag | Before each phase | `git tag -a phase-N-start` | seconds |

Weekly is a judgement call for a volunteer-run project: it bounds worst-case loss to a
week of admin edits, which for this site is a handful of directory entries.

---

## 4. Full media backup

R2 speaks the S3 API. `rclone` is free and handles the whole bucket.

```bash
# One-time: configure with R2 S3 credentials from
# Cloudflare Dashboard → R2 → Manage R2 API Tokens
rclone config   # type: s3, provider: Cloudflare,
                # endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com

rclone sync r2:reddivaripalli ~/backups/r2-media/ --progress --transfers 8
```

At the current ~1.7 GB this takes minutes on a good connection and costs nothing — R2
has no egress fees.

**Do this before the first Phase 1 deploy.** It is the only protection against media
loss, and there is currently none.

---

## 5. Recovery procedures

### 5.1 A bad deploy is live

Fastest path, no rebuild:

1. Cloudflare Dashboard → Pages → `festivals-rvp` → Deployments
2. Find the last known-good deployment → **Rollback**

Live in seconds. Then fix the cause in git at leisure.

### 5.2 Code needs reverting

```bash
git revert <commit>          # preserves history — preferred
git push origin main         # Actions redeploys automatically
```

Every Phase 1 milestone is a single squashed commit specifically so this works.

### 5.3 A community collection was corrupted

```bash
npx wrangler r2 object put reddivaripalli "community/directory.json" \
  --file ~/backups/r2-community-YYYYMMDD/directory.json \
  --content-type application/json
```

If no backup exists, deleting the R2 key makes `/api/community` fall back to the git
seed and self-heal — **but every edit made since the seed was written is lost.** That
fallback is a safety net for an empty bucket, not a restore mechanism.

### 5.4 Media was deleted from R2

```bash
rclone copy ~/backups/r2-media/ r2:reddivaripalli --progress
npm run sync                 # rebuild generated/albums.json
```

With no backup, media that existed only in R2 is gone. Media still present in
`public/` or `content/` in git can be re-uploaded with `npm run media:migrate:r2`.

### 5.5 The service worker is serving a broken app

The worst failure mode, because the broken worker serves the page that would fix it.
The existing kill switch:

```js
navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHES" })
```

is handled in `public/sw.js` and invoked by `applyPwaUpdate()` in `lib/pwa-update.ts`.
**Never remove that handler.** Recovery: deploy a build with a new `buildId`; the
45-second version poll in `ServiceWorkerManager` picks it up and force-refreshes. Users
who are fully offline stay broken until they reconnect.

### 5.6 Total loss of the local machine

1. Re-clone from GitHub
2. `cp .env.example .env.local` and refill from the password manager
3. `npm ci`
4. `npm run sync`
5. Media is already in R2 — nothing to restore

The gap is step 2. **The secrets exist in exactly two places: Cloudflare Pages settings
and one `.env.local` on one laptop.** Put them in a password manager today.

---

## 6. What is not backed up today

| Gap | Risk | Fix |
|---|---|---|
| R2 media | **Loss is permanent** | § 4, before Phase 1 |
| R2 community edits | Admin changes lost on corruption | § 2.3, weekly |
| Cloudflare secrets | Single copy on one laptop | Password manager, today |
| Deploy history beyond Cloudflare's retention | Cannot roll back far | Git tags per milestone |

---

## 7. Restore drill

A backup that has never been restored is a hypothesis. Once, before Phase 1:

1. Clone the mirror into a scratch directory
2. `npm ci && npm run build` — confirm it produces `out/`
3. Restore one community collection from backup into a **preview** deployment
4. Confirm the site renders the restored data
5. Note how long it took, here

Time to restore: _____________ (fill in after the drill)
