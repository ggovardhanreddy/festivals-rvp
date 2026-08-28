/**
 * Validate typed content against lib/content/schema.ts.
 *
 *   npm run content:validate
 *
 * Runs over content/typed/<kind>/*.json. That directory does not exist yet —
 * Phase 1A defines the model, Phases 2-5 add the content — so an empty run is
 * a pass, not a failure. What matters is that the gate is in place before the
 * first course or crop guide is written, and that provenance is enforced from
 * the very first record rather than retrofitted.
 */
import fs from "node:fs";
import path from "node:path";
import { ContentSchemas, REQUIRES_PROVENANCE, type ContentKind } from "../lib/content/schema";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content", "typed");

function main() {
  if (!fs.existsSync(DIR)) {
    console.log("No content/typed/ yet — nothing to validate.");
    console.log("Schemas ready for:", Object.keys(ContentSchemas).join(", "));
    return;
  }

  let checked = 0;
  const errors: string[] = [];

  for (const kind of Object.keys(ContentSchemas) as ContentKind[]) {
    const dir = path.join(DIR, kind);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const file = path.join(dir, name);
      const rel = path.relative(ROOT, file);
      checked += 1;
      let raw: unknown;
      try {
        raw = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch (e) {
        errors.push(`${rel}: invalid JSON — ${(e as Error).message}`);
        continue;
      }
      const parsed = ContentSchemas[kind].safeParse(raw);
      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          errors.push(`${rel}: ${issue.path.join(".") || "(root)"} — ${issue.message}`);
        }
        continue;
      }
      if (REQUIRES_PROVENANCE.includes(kind) && !("provenance" in (parsed.data as object))) {
        errors.push(`${rel}: ${kind} requires provenance (source, sourceUrl, reviewer, lastVerified)`);
      }
    }
  }

  console.log(`Checked ${checked} content file(s).`);
  if (errors.length) {
    console.error("");
    for (const e of errors) console.error(`  ${e}`);
    console.error(`\n${errors.length} content error(s).`);
    process.exit(1);
  }
  console.log("Content valid.");
}

main();
