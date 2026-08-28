# Git History Cleanup — Options and Consequences

**Status:** PROPOSAL ONLY. **No history has been rewritten.**
**Requires:** explicit written approval before any command below is run.
**Baseline:** `main @ 2b8fed1`, 106 commits, repository is public.

---

## 1. What is in history that should not be

| Path | Commits | First introduced | Contains |
|---|---|---|---|
| `functions/_data/member-auth.json` | 15 | `6c403c9` (2026-08-03) | 37 usernames + PBKDF2 hashes |
| `functions/_data/member-auth-data.ts` | 4 | `6c403c9` (2026-08-03) | The same data, compiled to TS |

Nothing else. Verified across all 106 commits:

- No `.env` or `.env.local` was ever committed — the only env file in history is `.env.example`
- No `*.pem`, `*.key`, or private key material
- No AWS / GitHub / OpenAI-style token patterns in any diff

---

## 2. The uncomfortable truth about rewriting

**Rewriting history does not un-publish anything.** The repository has been public
since 2026-08-03. In that window the content may have been:

- cloned by anyone
- indexed by GitHub code search
- captured by third-party mirrors and dataset scrapers
- forked

A history rewrite removes the data from *your* repository's future. It does not remove
it from any copy already made. **Rotation is the remediation. History cleanup is
hygiene.** Do rotation first, always.

If you only ever do one thing from this document, make it: rotate the secret and reset
the passwords. If you do nothing else, the history rewrite buys you very little.

---

## 3. Option A — Do nothing to history (recommended first step)

Rotate credentials, move the store out of git, add the paths to `.gitignore`, and leave
history alone.

**Cost:** none.
**Benefit:** the exposed hashes become worthless the moment the passwords change.
**Downside:** the old hashes remain readable in history forever. Since they will
correspond to retired passwords, this is an acceptable residual risk for a community
site — but not if any member reuses that password elsewhere, which is the real reason
to tell members to change it rather than just changing it for them.

This is the recommended action for Phase 0. Options B and C exist if you want them, but
they are not required to close the incident.

---

## 4. Option B — Rewrite with `git filter-repo`

Removes the two paths from every commit.

### Prerequisites

- `git filter-repo` installed (`brew install git-filter-repo`)
- A full mirror backup taken **first** (see `BACKUP_AND_RECOVERY.md` § 3)
- All work committed or stashed — this operates on the whole repository
- Agreement from anyone else holding a clone (currently: nobody known)

### Commands — DO NOT RUN WITHOUT APPROVAL

```bash
# 0. Backup first. Non-negotiable.
git clone --mirror https://github.com/ggovardhanreddy/festivals-rvp.git \
  ~/backups/festivals-rvp-mirror-$(date +%Y%m%d).git

# 1. Work on a fresh clone, never the working repository
git clone --no-local /Users/govardhan.reddy.g.94gmail.com/Projects/festivals-rvp \
  /tmp/rvp-rewrite
cd /tmp/rvp-rewrite

# 2. Strip the two paths from all history
git filter-repo \
  --path functions/_data/member-auth.json \
  --path functions/_data/member-auth-data.ts \
  --invert-paths

# 3. Inspect before pushing
git log --oneline | wc -l          # expect ~106, commit ids will all have changed
git log --all --oneline -- functions/_data/member-auth.json   # expect empty

# 4. Force-push (destructive to the remote)
git remote add origin https://github.com/ggovardhanreddy/festivals-rvp.git
git push --force --all
git push --force --tags
```

### Consequences

| Consequence | Detail |
|---|---|
| **Every commit SHA changes** | `2b8fed1` and all 106 commits get new ids. Any link, note, or document referencing a SHA breaks — including this audit's documents |
| **Any existing clone breaks** | A clone must be deleted and re-cloned; `git pull` will not reconcile |
| **The 209 uncommitted changes** | Must be committed or stashed first, then re-applied to the rewritten tree. This is the single largest practical risk |
| **GitHub keeps unreachable objects** | Old blobs stay accessible by SHA until GitHub garbage-collects. Open a GitHub Support request to force it, or the data is still retrievable by anyone who noted the SHA |
| **Forks are unaffected** | If anyone forked, their copy retains everything |
| **CI history** | Actions run history references old SHAs; those runs become orphaned but remain viewable |

### Sequencing with the 209 uncommitted files

This is the part that goes wrong. The correct order is:

1. Commit the working tree (see `WORKING_TREE_AUDIT.md` for the proposed commit split)
2. Push, confirm the deploy is green
3. Take the mirror backup
4. Rewrite
5. Force-push
6. Delete and re-clone locally

Attempting the rewrite with 209 files uncommitted risks losing them.

---

## 5. Option C — Fresh repository

Create a new repository, push only the current tree as an initial commit, archive the
old one private.

**Benefit:** guarantees no historical secret, no SHA-collision confusion.
**Cost:** loses 106 commits of project history, all issue and PR references, contributor
attribution, and the GitHub Actions run record. For a project whose whole purpose is
preserving a record, discarding its own record is a poor trade.

**Not recommended.**

---

## 6. Recommended sequence

| Step | Action | Approval needed | Reversible |
|---|---|---|---|
| 1 | Rotate `MEMBER_SESSION_SECRET` in Cloudflare | Yes — signs everyone out | Yes |
| 2 | Generate and distribute 37 new passwords | Yes | Yes |
| 3 | Move credential store to KV or R2 | Yes | Yes |
| 4 | `.gitignore` the two paths, remove from tree | Yes | Yes |
| 5 | Remove the `rvp-funfest-dev-secret` fallback | Yes | Yes |
| 6 | *(Optional)* History rewrite — Option B | Yes, separately | **No** |

Steps 1–5 close the incident. Step 6 is optional hygiene and should be decided
separately, after 1–5 are done and verified.

---

## 7. Verification after any rewrite

```bash
git log --all --oneline -- functions/_data/member-auth.json     # empty
git log --all --oneline -- functions/_data/member-auth-data.ts  # empty
git rev-list --all --count                                       # ~106
npm ci && npm run typecheck && npm run lint && npm test && npm run validate
```

Then confirm the live site still serves, and that a Fun Fest login with a *new*
password succeeds and with an *old* password fails.
