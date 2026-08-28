/**
 * Message catalogue gate.
 *
 *   npm run i18n:check
 *
 * Fails when code uses a key that does not exist in English, which would
 * otherwise render the key name to a visitor. Missing TELUGU keys are reported
 * as coverage, not failures: the fallback chain renders English, which is
 * correct behaviour while translation is in progress.
 */
import fs from "node:fs";
import path from "node:path";
import { en } from "../lib/i18n/messages/en";
import { te } from "../lib/i18n/messages/te";

const ROOT = process.cwd();
const SCAN = ["app", "components", "lib"];
const KEY_RE = /\bt\(\s*["'`]([a-zA-Z0-9._-]+)["'`]/g;

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function main() {
  const known = new Set(Object.keys(en));
  const used = new Map<string, string[]>();

  for (const root of SCAN) {
    for (const file of walk(path.join(ROOT, root))) {
      const src = fs.readFileSync(file, "utf8");
      let m: RegExpExecArray | null;
      while ((m = KEY_RE.exec(src))) {
        const key = m[1]!;
        // Legacy href-style keys are resolved through aliases at runtime.
        if (key.startsWith("/")) continue;
        if (!key.includes(".")) continue;
        const list = used.get(key) ?? [];
        list.push(path.relative(ROOT, file));
        used.set(key, list);
      }
    }
  }

  const missing = [...used.keys()].filter((k) => !known.has(k));
  const total = known.size;
  const teCount = Object.keys(te).length;
  const pct = Math.round((teCount / total) * 100);

  console.log(`Keys defined (en): ${total}`);
  console.log(`Keys used in code: ${used.size}`);
  console.log(`Telugu coverage:   ${teCount}/${total}  (${pct}%)`);

  if (missing.length) {
    console.error("");
    console.error("Keys used in code but missing from en.ts:");
    for (const k of missing) console.error(`  ${k}  <- ${used.get(k)!.join(", ")}`);
    console.error(`\n${missing.length} missing key(s).`);
    process.exit(1);
  }
  console.log("All used keys exist in the English catalogue.");
}

main();
