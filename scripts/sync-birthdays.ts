/**
 * Merge Downloads/Events/Birthdays/Birthdays.rtf DOBs into content/data/members.json
 * Also restores C Narendra (CK) if missing.
 *
 * Matching is strict: exact normalized keys + explicit one-to-one aliases.
 * Never match on short first-name substrings (e.g. "Hari" must not take "Harinath").
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { slugify } from "../lib/slug";
import type { Member } from "../lib/types";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "content/data/members.json");
const BIRTHDAYS =
  process.argv[2] ||
  path.join(process.env.HOME || "", "Downloads/Events/Birthdays/Birthdays.rtf");

const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

/**
 * Birthday-file key → exact member id.
 * Only listed members receive that DOB. Similar names are never auto-merged.
 */
const BIRTHDAY_KEY_TO_MEMBER_ID: Record<string, string> = {
  // RTF: "C HARINATH - 15 AUG" → C Hari (D Harinatha has no birthday on file)
  "c-harinath": "c-hari",
  harinath: "c-hari",
  "c-hari": "c-hari",
  "m-rajesh": "m-rajesh",
  rajesh: "m-rajesh",
  // RTF: "U GURUMAHESH" → U Guru Mahesh only (not Puli)
  "u-gurumahesh": "u-guru-mahesh",
  "u-guru-mahesh": "u-guru-mahesh",
  gurumahesh: "u-guru-mahesh",
  govardhan: "g-govardhan-reddy",
  "g-govardhan-reddy": "g-govardhan-reddy",
  pushyanth: "g-pushyanth-reddy",
  "g-pushyanth-reddy": "g-pushyanth-reddy",
  "narendra-cg": "c-narendra-cg",
  "c-narendra-cg": "c-narendra-cg",
  // Explicit non-matches:
  // "d-harinatha" must not inherit the C HARINATH date
  // "u-guru-mahesh-puli" is a separate member — do not inherit Guru Mahesh DOB
};

function normalizeKey(name: string) {
  return slugify(
    name
      .replace(/[()]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function readText(file: string): string {
  if (file.toLowerCase().endsWith(".rtf")) {
    return execFileSync("textutil", ["-convert", "txt", "-stdout", file], {
      encoding: "utf8",
    });
  }
  return fs.readFileSync(file, "utf8");
}

/** Parse lines like "C HARINATH - 15 AUG" or "NARENDRA (CG)- 10 OCT" */
function parseBirthdayFile(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, " ").trim();
    if (!line) continue;
    const match = line.match(
      /^(.+?)\s*[-–—]\s*(\d{1,2})\s+([A-Za-z]+)\s*$/,
    );
    if (!match) continue;
    const name = match[1]!.trim();
    const day = String(Number(match[2])).padStart(2, "0");
    const mon = MONTHS[match[3]!.toLowerCase()];
    if (!mon) continue;
    const key = normalizeKey(name);
    if (key) map.set(key, `${mon}-${day}`);
  }
  return map;
}

/** Resolve DOB for a member via exact id/name or explicit alias map only. */
function findDob(
  member: Member,
  dobs: Map<string, string>,
): string | null {
  const id = normalizeKey(member.id);
  const name = normalizeKey(member.name);

  // Exact key present in birthday file
  if (dobs.has(id)) return dobs.get(id)!;
  if (dobs.has(name)) return dobs.get(name)!;

  // Explicit alias: birthday keys that map to this member id
  for (const [bKey, memberId] of Object.entries(BIRTHDAY_KEY_TO_MEMBER_ID)) {
    if (memberId !== member.id && memberId !== id) continue;
    if (dobs.has(bKey)) return dobs.get(bKey)!;
  }

  return null;
}

function main() {
  if (!fs.existsSync(BIRTHDAYS)) {
    console.error("Birthdays file missing:", BIRTHDAYS);
    process.exit(1);
  }
  if (!fs.existsSync(OUT)) {
    console.error("members.json missing:", OUT);
    process.exit(1);
  }

  const dobs = parseBirthdayFile(readText(BIRTHDAYS));
  console.log("Parsed DOBs:", Object.fromEntries(dobs));

  let members = JSON.parse(fs.readFileSync(OUT, "utf8")) as Member[];

  // Restore Narendra CK under Core Members
  if (!members.some((m) => m.id === "c-narendra-ck")) {
    members.splice(
      members.findIndex((m) => m.id === "c-narendra-cg") + 1,
      0,
      {
        id: "c-narendra-ck",
        name: "C Narendra (CK)",
        photo: null,
        dob: null,
        group: "core",
      },
    );
    console.log("Restored C Narendra (CK)");
  } else {
    members = members.map((m) =>
      m.id === "c-narendra-ck" ? { ...m, group: "core" as const } : m,
    );
  }

  // Clear DOBs that were previously assigned by fuzzy/wrong aliases,
  // then re-apply only from the strict map for keys present in the file.
  const managedIds = new Set(Object.values(BIRTHDAY_KEY_TO_MEMBER_ID));
  // Also clear known incorrect prior targets
  const clearIfNotOwner = new Set([
    "d-harinatha",
    "u-guru-mahesh-puli",
    ...managedIds,
  ]);

  let applied = 0;
  let cleared = 0;
  members = members.map((m) => {
    const fromFile = findDob(m, dobs);
    if (fromFile) {
      if (m.dob !== fromFile) applied += 1;
      return { ...m, dob: fromFile };
    }
    // Strip stale DOB for members that used to get fuzzy matches
    if (clearIfNotOwner.has(m.id) && m.dob) {
      cleared += 1;
      return { ...m, dob: null };
    }
    return m;
  });

  // Ensure D Harinatha never inherits the C HARINATH date
  members = members.map((m) =>
    m.id === "d-harinatha" ? { ...m, dob: null } : m,
  );

  // Deduplicate by id (keep first)
  const seen = new Set<string>();
  const deduped: Member[] = [];
  for (const m of members) {
    if (seen.has(m.id)) {
      console.warn("Dropped duplicate id:", m.id, m.name);
      continue;
    }
    seen.add(m.id);
    deduped.push(m);
  }

  // Soft name-duplicate warning (same normalized name)
  const nameSeen = new Map<string, string>();
  for (const m of deduped) {
    const key = normalizeKey(m.name);
    if (nameSeen.has(key) && nameSeen.get(key) !== m.id) {
      console.warn("Duplicate name:", m.name, "ids:", nameSeen.get(key), m.id);
    } else {
      nameSeen.set(key, m.id);
    }
  }

  // Validate: each birthday-file key maps to at most one member
  const ownersByDob = new Map<string, Member[]>();
  for (const m of deduped) {
    if (!m.dob) continue;
    const list = ownersByDob.get(m.dob) || [];
    list.push(m);
    ownersByDob.set(m.dob, list);
  }
  for (const [dob, list] of ownersByDob) {
    if (list.length > 1) {
      console.warn(
        "Shared birthday (verify intentional):",
        dob,
        list.map((m) => `${m.id} (${m.name})`).join(", "),
      );
    }
  }

  const hari = deduped.find((m) => m.id === "c-hari");
  const harinatha = deduped.find((m) => m.id === "d-harinatha");
  if (hari?.dob && harinatha?.dob && hari.dob === harinatha.dob) {
    console.error("FAIL: C Hari and D Harinatha still share a birthday");
    process.exit(1);
  }
  if (harinatha?.dob) {
    console.error("FAIL: D Harinatha should not have a DOB");
    process.exit(1);
  }
  if (hari?.dob !== "08-15") {
    console.error("FAIL: C Hari should be 08-15 from C HARINATH record");
    process.exit(1);
  }

  fs.writeFileSync(OUT, JSON.stringify(deduped, null, 2) + "\n");
  const withDob = deduped.filter((m) => m.dob).length;
  console.log(
    JSON.stringify(
      {
        total: deduped.length,
        withDob,
        applied,
        cleared,
        harinatha: {
          id: harinatha?.id,
          name: harinatha?.name,
          dob: harinatha?.dob,
        },
        cHari: { id: hari?.id, name: hari?.name, dob: hari?.dob },
        out: OUT,
      },
      null,
      2,
    ),
  );
}

main();
