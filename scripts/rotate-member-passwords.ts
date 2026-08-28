/**
 * Rotate Fun Fest member passwords.
 *
 *   npx tsx scripts/rotate-member-passwords.ts
 *
 * Produces two artefacts:
 *
 *   1. <outDir>/members-auth-<stamp>.json   PBKDF2 hashes only.
 *      Upload to R2 as `auth/members.json`. Safe to keep; contains no plaintext.
 *
 *   2. <outDir>/DISTRIBUTE-<stamp>.csv      username,name,temporary password.
 *      SENSITIVE. One row per member, for individual out-of-band delivery.
 *      Delete once every member has received and changed their password.
 *
 * Both are written OUTSIDE the repository. The script refuses to write inside
 * it, and refuses to print any password to stdout. Nothing here ever reaches
 * git — see docs/SECURITY_INCIDENT.md.
 *
 * Override the destination with ROTATE_OUT_DIR=/path/to/dir (must be outside
 * the repository).
 */
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { assignMemberUsernames } from "../lib/auth";
import type { Member } from "../lib/types";

const ROOT = process.cwd();
const MEMBERS_PATH = path.join(ROOT, "content", "data", "members.json");
const OUT_DIR = path.resolve(
  process.env.ROTATE_OUT_DIR || path.join(os.homedir(), "rvp-credentials"),
);

/** Unambiguous alphabet: no O/0, l/1/I, to survive being read aloud. */
const ALPHABET = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 14): string {
  const bytes = crypto.randomBytes(length * 2);
  let out = "";
  for (let i = 0; out.length < length && i < bytes.length; i += 1) {
    const b = bytes[i]!;
    // Reject above the largest clean multiple to avoid modulo bias.
    if (b >= 256 - (256 % ALPHABET.length)) continue;
    out += ALPHABET[b % ALPHABET.length];
  }
  return out.length === length ? out : generatePassword(length);
}

/** Matches the verifier in functions/api/auth/_shared.ts exactly. */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100_000, 32, "sha256")
    .toString("base64url");
  return `pbkdf2:${salt}:${hash}`;
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function main() {
  if (OUT_DIR === ROOT || OUT_DIR.startsWith(ROOT + path.sep)) {
    console.error(
      `Refusing to write credentials inside the repository (${OUT_DIR}).\n` +
        `Set ROTATE_OUT_DIR to a directory outside ${ROOT}.`,
    );
    process.exit(1);
  }
  if (!fs.existsSync(MEMBERS_PATH)) {
    console.error(`Members seed missing: ${path.relative(ROOT, MEMBERS_PATH)}`);
    process.exit(1);
  }

  const members = JSON.parse(fs.readFileSync(MEMBERS_PATH, "utf8")) as Member[];
  const usernames = assignMemberUsernames(members);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  fs.mkdirSync(OUT_DIR, { recursive: true, mode: 0o700 });

  const records: Record<string, unknown>[] = [];
  const rows: string[] = ["username,name,temporary_password"];

  for (const member of members) {
    const username = usernames.get(member.id);
    if (!username) continue;
    const password = generatePassword();
    records.push({
      memberId: member.id,
      username,
      name: member.name,
      passwordHash: hashPassword(password),
      // Advisory only. Enforcement needs a change-password endpoint, which
      // does not exist yet — see docs/SECURITY_INCIDENT.md.
      mustChangePassword: true,
      updatedAt: new Date().toISOString(),
    });
    rows.push(
      [csvCell(username), csvCell(member.name), csvCell(password)].join(","),
    );
  }

  const authPath = path.join(OUT_DIR, `members-auth-${stamp}.json`);
  const distPath = path.join(OUT_DIR, `DISTRIBUTE-${stamp}.csv`);

  fs.writeFileSync(
    authPath,
    JSON.stringify(
      {
        version: 2,
        note: "PBKDF2 hashes only. Upload to R2 as auth/members.json. Never commit.",
        rotatedAt: new Date().toISOString(),
        members: records,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  fs.writeFileSync(distPath, rows.join("\n") + "\n", { mode: 0o600 });

  // Deliberately never print a password.
  console.log(`Rotated ${records.length} member credentials.`);
  console.log(`  hashes      ${authPath}`);
  console.log(`  distribute  ${distPath}   (SENSITIVE — delete after delivery)`);
  console.log("");
  console.log("Next:");
  console.log(`  npx wrangler r2 object put reddivaripalli/auth/members.json \\`);
  console.log(`    --file "${authPath}" --content-type application/json --remote`);
  console.log("  Then verify a login before deleting functions/_data/member-auth.*");
}

main();
