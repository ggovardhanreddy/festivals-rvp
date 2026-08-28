/**
 * Refresh the committed WOFF2 subsets in assets/fonts from the Fontsource
 * devDependencies.
 *
 *   npm run fonts:sync
 *
 * The font files are COMMITTED on purpose: `next build` must not depend on any
 * network. Fontsource is only how we obtain them reproducibly, which is why it
 * is a devDependency and not a runtime one.
 *
 * Google Fonts is deliberately not used -- next/font/google fetches at build
 * time and takes the whole build down when it is unreachable.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEST = path.join(ROOT, "assets", "fonts");

const FILES = [
  "@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff2",
  "@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2",
  "@fontsource/poppins/files/poppins-latin-400-normal.woff2",
  "@fontsource/poppins/files/poppins-latin-600-normal.woff2",
  "@fontsource/noto-sans-telugu/files/noto-sans-telugu-telugu-400-normal.woff2",
  "@fontsource/noto-sans-telugu/files/noto-sans-telugu-telugu-600-normal.woff2",
];

function main() {
  fs.mkdirSync(DEST, { recursive: true });
  let copied = 0;
  let missing = 0;
  let total = 0;

  for (const rel of FILES) {
    const src = path.join(ROOT, "node_modules", rel);
    const out = path.join(DEST, path.basename(rel));
    if (!fs.existsSync(src)) {
      console.error(`MISSING  ${rel}`);
      console.error(`         run: npm install`);
      missing += 1;
      continue;
    }
    const bytes = fs.readFileSync(src);
    const changed = !fs.existsSync(out) || !fs.readFileSync(out).equals(bytes);
    if (changed) {
      fs.writeFileSync(out, bytes);
      copied += 1;
    }
    total += bytes.length;
    console.log(`${changed ? "updated " : "current "} ${path.basename(rel)}  ${bytes.length} bytes`);
  }

  console.log("");
  console.log(`${FILES.length} file(s), ${(total / 1024).toFixed(0)} KB total, ${copied} updated.`);
  if (missing) {
    console.error(`${missing} file(s) missing — fonts not fully synced.`);
    process.exit(1);
  }
}

main();
