/**
 * Local folder import entrypoint (no ZIP required).
 * Prefer: npm run import:folder -- --dir "/path/to/photos"
 */
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const result = spawnSync("npx", ["tsx", "scripts/import-folder.ts", ...args], {
  cwd: process.cwd(),
  stdio: "inherit",
});
process.exit(result.status ?? 1);
