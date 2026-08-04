/**
 * Cloudflare Pages 404s some hashed Next/Turbopack assets whose basename
 * ends with "_" (e.g. 2qyhsvaq-ymc_.css). Rename only `_next/static` media
 * assets and rewrite references before deploy.
 *
 * Do NOT rename `__next.*.txt` flight/RSC payloads — those break routing.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const STATIC_ROOT = path.join(OUT, "_next", "static");
const ASSET_EXT = new Set([
  ".css",
  ".js",
  ".mjs",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".map",
]);
const TEXT_EXT = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".txt",
  ".webmanifest",
  ".map",
  ".xml",
  ".svg",
]);

function walk(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.error("out/ missing — run build first");
    process.exit(1);
  }
  if (!fs.existsSync(STATIC_ROOT)) {
    console.log("No out/_next/static — nothing to fix.");
    return;
  }

  const renames: Array<{ oldBase: string; newBase: string }> = [];

  for (const file of walk(STATIC_ROOT)) {
    const base = path.basename(file);
    const ext = path.extname(base).toLowerCase();
    if (!ASSET_EXT.has(ext)) continue;
    const stem = base.slice(0, -ext.length);
    if (!stem.endsWith("_")) continue;
    const newBase = `${stem.slice(0, -1)}0${path.extname(base)}`;
    const to = path.join(path.dirname(file), newBase);
    if (fs.existsSync(to)) {
      console.warn("skip collide", base, "→", newBase);
      continue;
    }
    fs.renameSync(file, to);
    renames.push({ oldBase: base, newBase });
  }

  if (!renames.length) {
    console.log("No trailing-underscore static assets to fix.");
    return;
  }

  renames.sort((a, b) => b.oldBase.length - a.oldBase.length);

  let rewritten = 0;
  for (const file of walk(OUT)) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXT.has(ext)) continue;
    let text = fs.readFileSync(file, "utf8");
    let next = text;
    for (const { oldBase, newBase } of renames) {
      if (next.includes(oldBase)) next = next.split(oldBase).join(newBase);
    }
    if (next !== text) {
      fs.writeFileSync(file, next);
      rewritten += 1;
    }
  }

  console.log(
    `Fixed ${renames.length} static asset name(s), rewrote ${rewritten} file(s).`,
  );
  for (const { oldBase, newBase } of renames) {
    console.log(`  ${oldBase} → ${newBase}`);
  }
}

main();
