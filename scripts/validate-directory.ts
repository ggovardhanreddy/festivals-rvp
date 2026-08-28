/**
 * Directory validator.  npm run government:validate
 *
 * Refuses to let the build ship an official-resource entry that could send a
 * villager to the wrong place. Checks, in order of how much damage each one
 * prevents:
 *
 *   - the URL is on an allowlisted official domain
 *   - officialDomain actually matches officialUrl
 *   - provenance is complete and lastVerified is a real, non-future date
 *   - ids and URLs are unique
 *   - every entry a hub references exists
 *   - featured (hub-listed) entries carry a Telugu name
 *   - emergency helplines cite an official source
 */
import { DIRECTORY, HUBS, HELPLINES, hostOf, isAllowedUrl } from "../lib/directory";

const errors: string[] = [];
const warnings: string[] = [];
const today = new Date().toISOString().slice(0, 10);

const seenIds = new Set<string>();
const seenUrls = new Map<string, string>();

for (const e of DIRECTORY) {
  const at = `${e.id}`;
  if (seenIds.has(e.id)) errors.push(`${at}: duplicate id`);
  seenIds.add(e.id);

  if (!e.name?.trim()) errors.push(`${at}: missing name`);
  if (!e.description?.trim()) errors.push(`${at}: missing description`);
  if (!e.department?.trim()) errors.push(`${at}: missing department`);

  if (!e.officialUrl) {
    errors.push(`${at}: missing officialUrl`);
  } else {
    if (!isAllowedUrl(e.officialUrl)) {
      errors.push(`${at}: ${e.officialUrl} is not an allowlisted official domain`);
    }
    if (e.officialDomain !== hostOf(e.officialUrl)) {
      errors.push(`${at}: officialDomain does not match officialUrl`);
    }
    const prev = seenUrls.get(e.officialUrl);
    if (prev) warnings.push(`${at}: shares officialUrl with ${prev}`);
    else seenUrls.set(e.officialUrl, e.id);
  }

  if (!e.source?.trim()) errors.push(`${at}: missing source`);
  if (!e.sourceUrl?.trim()) errors.push(`${at}: missing sourceUrl`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.lastVerified)) {
    errors.push(`${at}: lastVerified must be YYYY-MM-DD`);
  } else if (e.lastVerified > today) {
    errors.push(`${at}: lastVerified is in the future`);
  }

  for (const link of e.links ?? []) {
    if (!isAllowedUrl(link.url)) {
      errors.push(`${at}: extra link ${link.url} is not an allowlisted domain`);
    }
  }
}

const featured = new Set<string>();
for (const hub of HUBS) {
  for (const group of hub.groups) {
    for (const id of group.ids ?? []) {
      featured.add(id);
      if (!seenIds.has(id)) {
        errors.push(`hub ${hub.slug}: references unknown entry "${id}"`);
      }
    }
  }
}

for (const e of DIRECTORY) {
  if (featured.has(e.id) && !e.nameTe?.trim()) {
    warnings.push(`${e.id}: featured on a hub but has no Telugu name`);
  }
}

for (const h of HELPLINES) {
  if (!/^\d{3,12}$/.test(h.number)) errors.push(`helpline ${h.id}: implausible number`);
  if (!h.sourceUrl || !isAllowedUrl(h.sourceUrl)) {
    errors.push(`helpline ${h.id}: source must be an official URL`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(h.lastVerified)) {
    errors.push(`helpline ${h.id}: lastVerified must be YYYY-MM-DD`);
  }
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`ERROR ${e}`);

console.log(
  `\nDirectory: ${DIRECTORY.length} entries, ${HELPLINES.length} helplines, ` +
    `${HUBS.length} hubs — ${errors.length} errors, ${warnings.length} warnings.`,
);

if (errors.length) process.exit(1);
