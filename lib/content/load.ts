/**
 * Build-time loader for typed content.
 *
 * Reads `content/typed/<kind>/*.json` from disk during the static export.
 * Deliberately does NOT import zod: zod is a devDependency used by the
 * `content:validate` gate, and pulling a validator into the client bundle to
 * re-check files that CI already rejected would be pure payload.
 *
 * An absent directory returns an empty array. Every page that reads content
 * through here must render an honest empty state, never a placeholder record.
 */
import fs from "node:fs";
import path from "node:path";
import type { ContentKind } from "./schema";

const DIR = path.join(process.cwd(), "content", "typed");

export function loadTyped<T = unknown>(kind: ContentKind): T[] {
  const dir = path.join(DIR, kind);
  let names: string[];
  try {
    names = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
  const out: T[] = [];
  for (const name of names) {
    try {
      out.push(JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as T);
    } catch {
      // A malformed file is a CI failure in content:validate, not a reason to
      // break the build here. Skip it rather than ship half a page.
    }
  }
  return out;
}

export function hasTyped(kind: ContentKind): boolean {
  return loadTyped(kind).length > 0;
}
