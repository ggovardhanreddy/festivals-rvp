import path from "node:path";
import { spawnSync } from "node:child_process";
import { importLocalFolder } from "../lib/import-media";
import { DEFAULT_IMPORT_DIR } from "../lib/paths";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

async function main() {
  if (hasFlag("--publish")) {
    console.error("Import will not publish. Use: npm run publish -- --confirm");
    process.exit(1);
  }

  const source =
    arg("--dir") ||
    process.argv.find((value, index) => index > 1 && !value.startsWith("-")) ||
    DEFAULT_IMPORT_DIR;

  const resolved = path.resolve(
    source.replace(/^~(?=$|\/|\\)/, process.env.HOME || ""),
  );

  console.log(`RVP Youth import from: ${resolved}`);
  const result = await importLocalFolder({
    sourceDir: resolved,
    keepOriginals: !hasFlag("--no-originals"),
    processImages: !hasFlag("--no-process"),
  });

  console.log(JSON.stringify(result, null, 2));
  console.log(
    `\nImported ${result.imported}. Exact dupes: ${result.skippedDuplicates}. Near-dupe review: ${result.nearDuplicatesReview}.`,
  );
  console.log("Buckets:", result.byBucket);

  const generated = spawnSync("npm", ["run", "generate"], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
  if (generated.status !== 0) process.exit(generated.status || 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
