/**
 * Parse Downloads/Images/Batches.rtf → content/data/members.json
 * Categories: Legacy Circle | Core Members | NextGen
 * (Also accepts legacy Roots | Tree | Stems headers.)
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { slugify } from "../lib/slug";
import type { Member, MemberGroup } from "../lib/types";

const ROOT = process.cwd();
const BATCHES =
  process.argv[2] ||
  path.join(process.env.HOME || "", "Downloads/Images/Batches.rtf");
const OUT = path.join(ROOT, "content/data/members.json");
const MEMBERS_DIR = path.join(ROOT, "public/members");

const GROUP_MAP: Record<string, MemberGroup> = {
  legacy: "legacy",
  "legacy circle": "legacy",
  roots: "legacy",
  root: "legacy",
  core: "core",
  "core members": "core",
  tree: "core",
  trees: "core",
  nextgen: "nextgen",
  "next gen": "nextgen",
  stems: "nextgen",
  stem: "nextgen",
};

/** Known DOBs (MM-DD) from Birthdays.rtf / prior data */
const DOB_BY_KEY: Record<string, string> = {
  "m-rajesh": "10-06",
  "c-harinath": "08-15",
  "d-harinatha": "08-15",
  "u-guru-mahesh": "10-05",
  "u-gurumahesh": "10-05",
  "g-govardhan-reddy": "11-11",
  govardhan: "11-11",
  "g-pushyanth-reddy": "08-17",
  pushyanth: "08-17",
  "c-narendra-cg": "10-10",
  "narendra-cg": "10-10",
};

function normalizeKey(name: string) {
  return slugify(
    name
      .replace(/[()]/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function readBatchesText(file: string): string {
  if (file.toLowerCase().endsWith(".rtf")) {
    return execFileSync("textutil", ["-convert", "txt", "-stdout", file], {
      encoding: "utf8",
    });
  }
  return fs.readFileSync(file, "utf8");
}

function parseBatches(text: string): Record<MemberGroup, string[]> {
  const out: Record<MemberGroup, string[]> = {
    legacy: [],
    core: [],
    nextgen: [],
  };
  let current: MemberGroup | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\t/g, " ").trim();
    if (!line || line === ":" || line === "-") continue;
    const header = line
      .toLowerCase()
      .replace(/[:\s]+$/g, "")
      .trim();
    if (GROUP_MAP[header]) {
      current = GROUP_MAP[header];
      continue;
    }
    if (!current) continue;
    // skip decorative
    if (/^[-–—]+$/.test(line)) continue;
    out[current].push(line.replace(/\s+/g, " ").trim());
  }
  // dedupe within group (keep first)
  for (const g of Object.keys(out) as MemberGroup[]) {
    const seen = new Set<string>();
    out[g] = out[g].filter((name) => {
      const key = normalizeKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return out;
}

function existingPhotos(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(MEMBERS_DIR)) return map;
  for (const file of fs.readdirSync(MEMBERS_DIR)) {
    if (!/\.webp$/i.test(file)) continue;
    const key = file.replace(/\.webp$/i, "");
    map.set(key, `/members/${file}`);
  }
  return map;
}

function matchPhoto(name: string, photos: Map<string, string>): string | null {
  const key = normalizeKey(name);
  if (photos.has(key)) return photos.get(key)!;

  // aliases from Downloads filenames
  const aliases: Record<string, string[]> = {
    "g-ramesh-kumar-reddy": ["g-ramesh-kumar-reddy"],
    "m-rajesh": ["rajesh", "m-rajesh"],
    "g-govardhan-reddy": ["govardhan", "g-govardhan-reddy"],
    "y-chenna-keshava": ["keshava", "y-chenna-keshava"],
    "c-narendra-cg": ["narendra", "c-narendra-cg", "narendra-cg"],
    "d-akhil-reddy": ["akhil", "d-akhil-reddy"],
    "c-ganu": ["ganu", "c-ganu"],
    "u-nagesh": ["nagesh", "u-nagesh"],
    "d-santhosh-reddy": ["santhosh", "d-santhosh-reddy"],
    "d-shiva-shankar-reddy": ["d-shiva", "shiva", "d-shiva-shankar-reddy"],
  };
  for (const [canon, list] of Object.entries(aliases)) {
    if (key === canon || list.includes(key)) {
      for (const a of list) {
        if (photos.has(a)) return photos.get(a)!;
      }
    }
  }

  // fuzzy: photo key contained in name key or vice versa
  for (const [photoKey, url] of photos) {
    if (key.includes(photoKey) || photoKey.includes(key)) return url;
  }
  return null;
}

function matchDob(name: string, id: string): string | null {
  if (DOB_BY_KEY[id]) return DOB_BY_KEY[id];
  const key = normalizeKey(name);
  if (DOB_BY_KEY[key]) return DOB_BY_KEY[key];
  // loose
  for (const [k, dob] of Object.entries(DOB_BY_KEY)) {
    if (key.includes(k) || k.includes(key)) return dob;
  }
  return null;
}

function main() {
  if (!fs.existsSync(BATCHES)) {
    console.error("Batches file not found:", BATCHES);
    process.exit(1);
  }
  const text = readBatchesText(BATCHES);
  const groups = parseBatches(text);
  const photos = existingPhotos();
  const usedIds = new Set<string>();
  const members: Member[] = [];

  const order: MemberGroup[] = ["legacy", "core", "nextgen"];
  for (const group of order) {
    for (const name of groups[group]) {
      let id = normalizeKey(name) || "member";
      let n = 2;
      while (usedIds.has(id)) {
        id = `${normalizeKey(name)}-${n}`;
        n += 1;
      }
      usedIds.add(id);
      members.push({
        id,
        name,
        photo: matchPhoto(name, photos),
        dob: matchDob(name, id),
        group,
      });
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(members, null, 2) + "\n");

  const withPhoto = members.filter((m) => m.photo).length;
  console.log(
    JSON.stringify(
      {
        source: BATCHES,
        total: members.length,
        withPhoto,
        legacy: groups.legacy.length,
        core: groups.core.length,
        nextgen: groups.nextgen.length,
        out: OUT,
      },
      null,
      2,
    ),
  );
}

main();
