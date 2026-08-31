# Automatic Learning Resource Collector

Collects educational resources for Reddivaripalli students, farmers and job
seekers from a fixed list of approved official sources, so nobody has to search
the internet every day.

Live at **/learn/**. Managed at **/admin/ → Resources**.

---

## The rule that shapes everything

Three of the twenty approved sources grant permission to redistribute their
material. Seventeen do not, or say nothing at all.

So the normal path through this system is **link-only**: the collector records
a resource's title, description, official URL and dates, and sends the reader to
the source. Downloading and re-hosting is the exception, and it happens only
when a source's `licenseStatus` is `"yes"` — which requires a licence statement
quoted in `licenseNote` and cited by `licenseUrl`.

`unknown` is not a soft `yes`. It routes to admin review and is never hosted.
If a field is missing or misread anywhere in the chain, the code falls back to
the restrictive answer. `scripts/validate-resources.ts` fails the build if a
hosted file ever exists without permission behind it.

### The three sources that permit hosting

| Source | Licence | Conditions |
|---|---|---|
| NCERT / ePathshala | [NCERT e-content licence](https://epathshala.nic.in/pages.php?id=license&ln=en) | Non-commercial only, distributed unaltered, NCERT attribution clear and conspicuous. No adaptation, translation or summarising. |
| DIKSHA | CC BY-NC-ND (textbooks), CC BY-NC-SA (resources), [per CIET-NCERT](https://ciet.ncert.gov.in/initiative/diksha) | Check the per-item licence on a content page — DIKSHA also carries state-contributed material. |
| data.gov.in datasets | [GODL-India](https://www.data.gov.in/Godl) | Datasets only, never the portal's pages, images or emblems. Requires the section 5 attribution string. Needs an API key. |

Two of the twenty are worth knowing about specifically:

- **SWAYAM's terms forbid scraping by name** ("you agree not to scrape, or
  otherwise download in bulk"). It is `method: "manual"` and must stay that way.
- **NTA permits reproduction "after taking proper permission"**, free of charge.
  Writing to ask would upgrade it from `no` to `yes` at no cost — the only
  source in the registry where that is true.

---

## How it runs

The collector is a Node script that runs in GitHub Actions, commits the catalog
to the repository, and lets the existing Production Deploy publish it. Git gives
version history and an audit trail for free.

```
.github/workflows/collect-resources.yml   (cron: 6-hourly / daily / weekly / monthly)
  → scripts/collect-resources.ts
      → lib/collector/pipeline.ts
          discover → CHECK PERMISSION → download or link → dedupe
          → extract metadata → categorise → quality checks → status
      → generated/resources.json          (the catalog, committed)
      → content/resources/sources.json    (source health, committed)
      → generated/resource-runs.json      (run history for the dashboard)
      → generated/resource-notifications.json
  → ClamAV scan (only if files were downloaded)
  → npm run resources:validate
  → commit + gh workflow run deploy.yml
```

### Scheduled runs are off until you turn them on

Set the repository variable `RESOURCE_COLLECTOR_ENABLED` to `true`
(Settings → Actions → Variables) once a manual dry run looks right. Until then
the scheduled runs exit immediately and say so in the run summary. Manual
dispatch always works.

### Nothing auto-publishes

Every source has `autoPublish: false`. Collected resources land at `new` or
`needs-review` and appear on **/learn/** only after an admin approves them.
Enabling auto-publish is a per-source decision, made in the registry, and it
still cannot publish anything with a quality flag or an unclear licence.

---

## Running it by hand

```bash
# See what would be collected, write nothing. Start here.
npm run resources:collect -- --dry-run

# One source, ignoring its schedule.
npm run resources:collect -- --source icar --dry-run

# A tier, for real.
npm run resources:collect -- --tier daily

# Check the catalog's integrity. Runs in CI and before every deploy.
npm run resources:validate
```

Note that most of these hosts are unreachable from outside India and from
sandboxed CI environments. A dry run that reports every source failing is
usually a network story, not a collector bug — the GitHub Actions runner has
open internet and is where a real run belongs.

---

## Politeness

These are modestly resourced state servers, several of which were already
timing out when the source list was compiled. The fetcher is gentle by
construction, not by intention:

- One request at a time per host, minimum 2 s apart, more when the source or
  its `Crawl-delay` asks for it
- `robots.txt` read before every request and obeyed; an unreadable robots.txt
  is treated as permissive (standard reading) but a robots.txt that loads and
  says Disallow stops the source with reason `robots-disallowed`
- Conditional requests, so a re-check costs a 304 and no body
- A User-Agent that names the site and gives a contact address, so an
  administrator who sees us in their logs can ask us to stop
- Bounded retries with backoff, and no retry at all on a 4xx
- A hard byte cap enforced while streaming

## Security

Every downloaded file is untrusted input:

- Type identified by magic bytes, never by extension — an HTML error page
  served for a `.pdf` link is the most common failure on these portals and is
  caught by name
- Storage filenames are generated from the content hash, never from the remote
  filename
- Size capped at 24 MiB, which is also Cloudflare Pages' asset limit — anything
  larger becomes a link rather than a broken download
- Encrypted PDFs are flagged, not opened
- PDFs carrying `/JavaScript`, `/OpenAction`, `/Launch` or embedded files are
  held for review with the finding named
- ClamAV scans downloads in the workflow before anything is committed
- Nothing downloaded is ever executed

---

## Adding or changing a source

Edit `content/resources/sources.json` and commit. `/admin/ → Resources` shows
every source's licence verdict, health and yield, but it is **read-only** — a
change to a licence verdict or an `active` flag goes through a commit, so it is
reviewable and leaves a record of who decided what. There is no admin write API
today; if you want one, it would need R2 S3 credentials in the collector
workflow so the runner can read the live copy back.

Before setting `licenseStatus: "yes"` on anything:

1. Find the source's copyright, terms or licence page and **read it**.
2. Quote the sentence that grants reuse into `licenseNote`.
3. Put that page's URL in `licenseUrl`.
4. Write the attribution the licence requires into `attribution`.

`resources:validate` fails the build if a `"yes"` has no `licenseUrl` or no
`attribution`, because a permission claim without a citation is the one mistake
here that could cost the village something.

## Approving a collected resource

Open `/admin/ → Resources → Review`. Each held item shows its id and the reason
it is held. To publish one, set its `status` to `"published"` in
`generated/resources.json` and commit. To publish everything a source produces
from then on, set that source's `autoPublish: true` — quality flags, an unclear
licence and a passed deadline still override it.

## Notifications

The collector raises notifications for the events in section 14 — a new
important resource, an updated one, a source failing three checks in a row, a
source URL that looks like it moved, a bulk discovery, anything needing
verification, and an unclear licence. They are written to
`generated/resource-notifications.json` and shown on the admin dashboard, and
the run summary in Actions carries the same information. There is no email or
push channel wired up; GitHub already emails the repository owner when a
workflow fails, which covers the case that matters most.

## Files

| Path | What it is |
|---|---|
| `content/resources/sources.json` | The approved source registry, with a licence verdict and its citation per source |
| `lib/resources/` | Types, taxonomy, categorisation, language detection, dedupe, expiry. Client-safe. |
| `lib/collector/` | robots.txt, the polite fetcher, source adapters, the PDF pipeline, security, the orchestrator. Node only. |
| `scripts/collect-resources.ts` | The CLI |
| `scripts/validate-resources.ts` | The integrity gate |
| `components/resources/` | Learning Center, category pages, resource pages, video embed, admin |
| `generated/resources.json` | The catalog. Written by the collector, read at build time. |
| `public/resources/` | Hosted files, from `"yes"` sources only. Survives `media:strip-local` by design. |

## Known limits

- **Almost no machine-readable feeds exist.** One working RSS feed (ICAR), one
  usable sitemap (DIKSHA), one keyed API (data.gov.in). Everything else is an
  HTML index page, which is why the HTML adapter carries most of the weight.
- **Four sources render entirely client-side** (`ssc.gov.in`,
  `jnanabhumi.ap.gov.in`, and parts of NSP and APPSC). They are `manual`: the
  Learning Center links to them and the collector does not pretend to read them.
- **SCERT AP and APSSDC are inactive** pending verification — SCERT could not be
  reached at all, and APSSDC's canonical URL is genuinely unclear.
- **Categorisation is keyword scoring, not a model.** It is auditable and its
  matches are recorded on each resource, and anything below the confidence floor
  goes to review rather than being filed silently.
- **Scanned PDFs yield no text**, so they are flagged `missing-metadata` and
  will not be found by a full-text search.
