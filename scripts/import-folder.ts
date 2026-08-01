import path from "node:path";
import { spawnSync } from "node:child_process";
import { importLocalFolder } from "../lib/import-media";
import type { Category } from "../lib/paths";
import { CATEGORIES } from "../lib/paths";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  const source =
    arg("--dir") ||
    process.argv.find((value, index) => index > 1 && !value.startsWith("-"));

  if (!source) {
    console.error(`Usage:
  npm run import:folder -- --dir "/path/to/photos"
  npm run import:folder -- ~/Downloads --category festivals --album sankranti-2026

Options:
  --dir <path>              Local folder to scan recursively
  --category <name|auto>    ${CATEGORIES.join(" | ")} | auto (default: auto)
  --album <name|auto>       Album slug/name (default: auto from folder names)
  --no-originals            Do not copy into originals/
  --no-process              Copy files without WebP/AVIF conversion
  --generate                Refresh search/sitemap/RSS after import
  --publish                 NOT allowed here — use npm run publish after review`);
    process.exit(1);
  }

  if (hasFlag("--publish")) {
    console.error(
      "Import will not publish. Review the archive, then run: npm run publish",
    );
    process.exit(1);
  }

  const categoryRaw = (arg("--category") || "auto").toLowerCase();
  const category =
    categoryRaw === "auto"
      ? "auto"
      : (CATEGORIES.find((item) => item === categoryRaw) as Category | undefined);
  if (!category) {
    console.error(`Invalid category. Use auto or one of: ${CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  const result = await importLocalFolder({
    sourceDir: path.resolve(source.replace(/^~(?=$|\/|\\)/, process.env.HOME || "")),
    category,
    album: arg("--album") || "auto",
    keepOriginals: !hasFlag("--no-originals"),
    processImages: !hasFlag("--no-process"),
  });

  console.log(JSON.stringify(result, null, 2));
  console.log(
    `\nImported ${result.imported} file(s). Duplicates skipped: ${result.skippedDuplicates}.`,
  );
  if (result.unknownYear) {
    console.log(
      `${result.unknownYear} file(s) went to "Unknown" year — reassign in content/ when ready.`,
    );
  }

  if (hasFlag("--generate") || result.imported > 0) {
    const generated = spawnSync("npm", ["run", "generate"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: "inherit",
    });
    if (generated.status !== 0) process.exit(generated.status || 1);
  }

  console.log(
    "\nReview the site locally with npm run dev. When ready, confirm publish with:\n  npm run publish",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
