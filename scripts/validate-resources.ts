/**
 * Catalog integrity gate. Runs in CI and before every deploy.
 *
 * The checks that matter are the ones a bug in the collector could get wrong
 * in a way nobody would notice by looking at the site:
 *
 *   - a resource with a hosted copy whose source does not permit hosting
 *   - a published resource from a source whose licence is unknown
 *   - a hosted file that is referenced but missing from disk
 *   - a resource pointing at a source id that no longer exists
 *   - a published resource with no official URL to send a reader to
 *
 * Any of those is an error and fails the build. Everything else is a warning.
 */
import fs from "node:fs";
import path from "node:path";
import { loadResourceCatalog, loadResourceSources } from "../lib/resources/server";
import { canonicalizeUrl } from "../lib/resources/dedupe";

const root = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];

const resources = loadResourceCatalog();
const sources = loadResourceSources();
const byId = new Map(sources.map((s) => [s.id, s]));

console.log(`Validating ${resources.length} resources against ${sources.length} sources…`);

// ---- sources ------------------------------------------------------------
const seenSourceIds = new Set<string>();
for (const s of sources) {
  if (seenSourceIds.has(s.id)) errors.push(`Duplicate source id: ${s.id}`);
  seenSourceIds.add(s.id);
  if (!/^https:\/\//.test(s.url)) warnings.push(`Source ${s.id} is not https: ${s.url}`);
  if (s.licenseStatus === "yes" && !s.licenseUrl) {
    // A "yes" without a citation is the one that could quietly cost someone.
    errors.push(`Source ${s.id} claims redistribution is permitted but cites no licenceUrl.`);
  }
  if (s.licenseStatus === "yes" && !s.attribution) {
    errors.push(`Source ${s.id} permits redistribution but has no attribution string to display.`);
  }
  if (s.autoPublish && s.licenseStatus === "unknown") {
    errors.push(`Source ${s.id} has autoPublish on with an unknown licence. Nothing may auto-publish from it.`);
  }
}

// ---- resources ----------------------------------------------------------
const seenIds = new Set<string>();
const canonicalSeen = new Map<string, string>();

for (const r of resources) {
  if (seenIds.has(r.id)) errors.push(`Duplicate resource id: ${r.id}`);
  seenIds.add(r.id);

  const source = byId.get(r.sourceId);
  if (!source) {
    errors.push(`Resource ${r.id} references unknown source "${r.sourceId}".`);
    continue;
  }

  if (!r.originalUrl) errors.push(`Resource ${r.id} has no originalUrl — a reader could not reach the official copy.`);

  // THE check. A hosted copy may only exist when the source said yes.
  if (r.localFileUrl && source.licenseStatus !== "yes") {
    errors.push(
      `Resource ${r.id} has a hosted copy (${r.localFileUrl}) but source ${source.id} licence is "${source.licenseStatus}".`,
    );
  }
  if (r.localFileUrl && r.licenseStatus !== "yes") {
    errors.push(`Resource ${r.id} has a hosted copy but its own licenseStatus is "${r.licenseStatus}".`);
  }
  if (r.localFileUrl) {
    const onDisk = path.join(root, "public", r.localFileUrl.replace(/^\//, ""));
    if (!fs.existsSync(onDisk)) {
      errors.push(`Resource ${r.id} points at ${r.localFileUrl}, which is not on disk.`);
    }
    if (!r.attribution) {
      errors.push(`Resource ${r.id} is hosted but carries no attribution. Attribution is a licence condition.`);
    }
  }

  if (r.status === "published" && source.licenseStatus === "unknown") {
    errors.push(`Resource ${r.id} is published from ${source.id}, whose licence is unknown.`);
  }

  if (r.status === "published" && r.flags.includes("source-removed")) {
    errors.push(`Resource ${r.id} is published but flagged source-removed.`);
  }

  if (r.resourceType === "video" && r.video?.unavailable && r.status === "published") {
    warnings.push(`Resource ${r.id} is a published video marked unavailable; it will render the "Video unavailable" notice.`);
  }

  const canonical = r.canonicalUrl ?? canonicalizeUrl(r.originalUrl);
  const prior = canonicalSeen.get(canonical);
  if (prior && prior !== r.id) {
    warnings.push(`Resources ${prior} and ${r.id} share a canonical URL — dedupe may have missed one.`);
  }
  canonicalSeen.set(canonical, r.id);

  if (!r.title.trim()) errors.push(`Resource ${r.id} has an empty title.`);
  if (r.status === "published" && !r.category) errors.push(`Resource ${r.id} is published with no category.`);
}

// ---- orphaned hosted files ---------------------------------------------
const referenced = new Set(
  resources
    .flatMap((r) => [r.localFileUrl, ...(r.versions ?? []).map((v) => (v.fileKey ? `/${v.fileKey}` : undefined))])
    .filter(Boolean) as string[],
);
const hostedDir = path.join(root, "public", "resources");
if (fs.existsSync(hostedDir)) {
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        const rel = `/${path.relative(path.join(root, "public"), full).split(path.sep).join("/")}`;
        if (!referenced.has(rel)) warnings.push(`Hosted file ${rel} is not referenced by any resource.`);
      }
    }
  };
  walk(hostedDir);
}

// ---- report -------------------------------------------------------------
for (const w of warnings) console.log(`WARN: ${w}`);
for (const e of errors) console.error(`ERROR: ${e}`);

if (errors.length > 0) {
  console.error(`\nResource validation FAILED with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(
  `Resource validation passed (${warnings.length} warning(s), ${resources.length} resources, ${sources.length} sources).`,
);
