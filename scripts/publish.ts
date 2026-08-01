import { spawnSync } from "node:child_process";

/**
 * Publishes only after explicit administrator confirmation.
 * Usage:
 *   npm run publish -- --confirm
 */
if (!process.argv.includes("--confirm")) {
  console.error(`Publish requires confirmation.

Review imported memories first, then run:
  npm run publish -- --confirm

This will:
  1) commit content + public media + indexes
  2) push to origin (ggovardhanreddy/festivals-rvp)
  3) trigger GitHub Actions deploy`);
  process.exit(1);
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { cwd: process.cwd(), stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

run("npm", ["run", "generate"]);
run("git", [
  "add",
  "content",
  "public/images",
  "public/thumbs",
  "public/search-index.json",
  "public/sitemap.xml",
  "public/feed.xml",
  "public/sw.js",
]);

const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: process.cwd(),
  encoding: "utf8",
});
if (!(status.stdout || "").trim()) {
  console.log("Nothing new to publish.");
  process.exit(0);
}

const message =
  process.argv.find((value, index, all) => all[index - 1] === "--message") ||
  "Publish imported memories";

run("git", ["commit", "-m", message]);
run("git", ["push", "origin", "HEAD"]);
console.log("Published. GitHub Actions will deploy the updated archive.");
