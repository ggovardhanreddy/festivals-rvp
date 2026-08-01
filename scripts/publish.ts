import { execFileSync } from "node:child_process";
execFileSync("git", ["add", "-A", ":!.env.local"], {stdio:"inherit"});
console.log("Staged archive changes locally. Review and commit; this command never pushes or configures a remote.");
