/**
 * Cloudflare Pages 404s some hashed Next/Turbopack assets whose basename
 * ends with "_" (e.g. 2qyhsvaq-ymc_.css). Rename those files and rewrite
 * references inside the static export before deploy.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
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

  const all = walk(OUT);
  const renames: Array<{ from: string; to: string; oldBase: string; newBase: string }> =
    [];

  for (const file of all) {
    const base = path.basename(file);
    const ext = path.extname(base);
    const stem = base.slice(0, -ext.length || undefined);
    if (!stem.endsWith("_")) continue;
    const newBase = `${stem.slice(0, -1)}0${ext}`;
    const to = path.join(path.dirname(file), newBase);
    if (fs.existsSync(to)) {
      console.warn("skip collide", base, "→", newBase);
      continue;
    }
    fs.renameSync(file, to);
    renames.push({ from: file, to, oldBase: base, newBase });
  }

  if (!renames.length) {
    console.log("No trailing-underscore assets to fix.");
    return;
  }

  // Longest first so nested replacements stay stable.
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
    `Fixed ${renames.length} asset name(s), rewrote ${rewritten} file(s).`,
  );
  for (const { oldBase, newBase } of renames) {
    console.log(`  ${oldBase} → ${newBase}`);
  }
}

main();
