# Official resource directory

Reddivaripalli is not a government portal and must never be mistaken for one.
What it is, in this section, is a **curated index of official addresses** — the
place a villager can start from and be confident the next click lands on the
real department rather than on a paid "agent" site that looks like it.

Everything below exists to protect that one promise.

## Where the data lives

| File | Contents |
| --- | --- |
| `lib/directory/types.ts` | `DirectoryEntry`, the domain allowlist, `isAllowedUrl()` |
| `lib/directory/central.ts` | Central government services and the national aggregators |
| `lib/directory/ap.ts` | Andhra Pradesh state services |
| `lib/directory/students.ts` | Education, scholarships, exams, jobs |
| `lib/directory/farmers.ts` | Schemes, crop insurance, soil, markets |
| `lib/directory/banking.ts` | Banks (from RBI's own list), payments, pension, insurance |
| `lib/directory/emergency.ts` | Helplines, each citing the official page it was read from |
| `lib/directory/index.ts` | The assembled list, plus the hub definitions |

Hubs are curated, not generated: *what a farmer needs first* is a judgement
about people, not a property of the data.

## The rules

1. **Allowlisted domains only.** `.gov.in`, `.nic.in`, `.bank.in`, plus a short
   list of named exact hosts in `ALLOWED_HOSTS` (RBI, PFRDA, NPCI, NABARD,
   AICTE, NTA, NPTEL, the National Digital Library, IRCTC, APSRTC). Anything
   else fails validation and the build stops.
2. **Provenance on every entry.** `source`, `sourceUrl` and `lastVerified`.
   The source is the page the URL was *read from*, not a search engine.
3. **No invented detail.** Eligibility, fees, deadlines and benefits are absent
   unless the official source states them. The UI then says "see the official
   website", which is true.
4. **No credential ever.** No login form, no iframe of a bank or government
   page, no proxying. Every destination opens in a new tab on its own domain,
   with the domain shown *before* the click.

### Why `.bank.in`

The Reserve Bank of India moved Indian banks onto the `.bank.in` namespace
precisely so a customer can tell a real bank from a look-alike. Every bank URL
in `banking.ts` was taken from RBI's own list of bank websites
(<https://www.rbi.org.in/Scripts/banklinks.aspx>), not from a search engine.

## Validation

```
npm run government:validate
```

Checks, in order of how much damage each one prevents:

- the URL is on an allowlisted official domain
- `officialDomain` matches `officialUrl`
- provenance is complete and `lastVerified` is a real, non-future date
- ids and URLs are unique
- every entry a hub references exists
- hub-featured entries carry a Telugu name
- helpline numbers are plausible and cite an official page

`tests/unit/directory.test.ts` asserts the same invariants, and adds a set of
look-alike domains (`uidai-gov.in`, `sbi.bank.in.evil.com`, …) that must be
rejected. `tests/e2e/government.spec.ts` then checks the rendered pages: every
`.oflink` points at an official host, opens with `rel="noopener"`, shows its
domain and its provenance line, and the banking page carries the credential
warning and contains no password field or iframe.

## Adding an entry

1. Find the URL **on an official page** — the department's own site, RBI's bank
   list, india.gov.in's service detail page. A search-result snippet is not a
   source.
2. Add the entry with `entry({ … })`, which fills `officialDomain` from the URL
   so the two can never disagree.
3. Give it a Telugu name if it will be featured on a hub.
4. Run `npm run government:validate` and `npx vitest run tests/unit/directory.test.ts`.
5. Regenerate the search index with `npm run generate`.

If you cannot confirm a URL, **leave the entry out**. An honest gap costs a
visitor one search; a wrong government URL can cost them their savings.

## Re-verification

`lastVerified` is a promise about a date, so it has to be kept. Before a
release, re-check the entries and move the date forward only for the ones you
actually opened. The validator rejects a future date, which stops the obvious
shortcut of setting them all to next month.

## Search

`scripts/build-search-index.ts` emits every directory entry as a `SearchDoc`,
twice where a Telugu name exists. Results link to the Reddivaripalli **hub**,
not straight out to the government site: the hub is where the safety banner and
the provenance line live, and sending someone from a search box directly to an
external login page is exactly the pattern the scams imitate.

Directory documents carry `weight: 3.6`, above pages (3.2) and well above media
(1.0), so "aadhaar" returns the service rather than a photograph tagged with
the word.

## Known issue

The static export logs a recoverable React hydration warning (#418) on every
page, including pages untouched by this work. React recovers by client-
rendering the affected subtree; all 148 Playwright checks and the axe pass
succeed. It does not reproduce under `next dev`. Tracked as a pre-existing
defect, not introduced by the directory.
