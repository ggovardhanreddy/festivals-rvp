/**
 * Optional ZIP ingest. Prefer: npm run import:folder
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { importLocalFolder } from "../lib/import-media";

const root = process.cwd();
const inbox = path.join(root, "inbox");
const tmp = path.join(root, ".tmp");

if (process.argv.includes("--publish")) {
  console.error("Ingest will not publish. Run: npm run publish -- --confirm");
  process.exit(1);
}

fs.mkdirSync(inbox, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

const zips = fs
  .readdirSync(inbox)
  .filter((name) => name.toLowerCase().endsWith(".zip"));

if (!zips.length) {
  console.log("No ZIP files in inbox/. Use npm run import:folder for local photos.");
  process.exit(0);
}

for (const zip of zips) {
  const out = path.join(tmp, zip.replace(/\.zip$/i, ""));
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  execFileSync("unzip", ["-oq", path.join(inbox, zip), "-d", out]);
  const result = await importLocalFolder({
    sourceDir: out,
    keepOriginals: true,
    processImages: true,
  });
  console.log(zip, result);
  fs.renameSync(path.join(inbox, zip), path.join(inbox, `${zip}.processed`));
}

fs.rmSync(tmp, { recursive: true, force: true });
execFileSync("npm", ["run", "generate"], { stdio: "inherit" });
console.log("ZIP ingest finished. Review, then: npm run publish -- --confirm");
