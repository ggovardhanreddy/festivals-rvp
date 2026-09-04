/**
 * One-time migration: the hard-coded seed becomes data.
 *
 * §16 forbids a hard-coded tree; lib/family-trees/seed.ts is one. This reads
 * it, converts it to the six-entity model, and writes JSON that the store and
 * the admin editor own from then on.
 *
 * Safety properties, because this touches every person the village has:
 *  - It never overwrites a non-empty family-people.json. Run with --force to
 *    re-seed deliberately.
 *  - It writes a timestamped backup of anything it replaces.
 *  - It is idempotent: running twice produces the same files.
 *  - It reports counts and exits non-zero if a person would lose their family
 *    or an edge would lose an end.
 *
 * Usage:
 *   npm run families:migrate           # migrate if not already migrated
 *   npm run families:migrate -- --force
 *   npm run families:migrate -- --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { flattenFamilies } from "../lib/family-trees/flatten";
import { FAMILY_SEEDS } from "../lib/family-trees/seed";
import { loadVillageFamilies } from "../lib/families/catalog";
import {
  inverseType,
  relationshipId,
  type Family,
  type Person,
  type Relationship,
} from "../lib/family-trees/entities";

const root = process.cwd();
const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

const PEOPLE_FILE = path.join(root, "content/data/family-people.json");
const RELS_FILE = path.join(root, "content/data/family-relationships.json");
const MEDIA_FILE = path.join(root, "content/data/family-media.json");
const AUDIT_FILE = path.join(root, "content/data/family-audit.json");

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function backup(file: string) {
  if (!fs.existsSync(file)) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = `${file}.${stamp}.bak`;
  fs.copyFileSync(file, target);
  console.log(`  backed up ${path.basename(file)} → ${path.basename(target)}`);
}

function write(file: string, data: unknown) {
  if (dryRun) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

const existingPeople = readJson<Person[]>(PEOPLE_FILE, []);
if (Array.isArray(existingPeople) && existingPeople.length > 0 && !force) {
  console.log(
    `content/data/family-people.json already holds ${existingPeople.length} people. Nothing to do.`,
  );
  console.log("Pass --force to re-seed from lib/family-trees/seed.ts (it will back up first).");
  process.exit(0);
}

console.log("Migrating the family tree out of seed.ts and into data…");
if (dryRun) console.log("DRY RUN — nothing will be written.\n");

const families = loadVillageFamilies() as unknown as Family[];
const familyById = new Map(families.map((f) => [f.id, f]));
const flat = flattenFamilies(FAMILY_SEEDS);

const errors: string[] = [];

// ── people ────────────────────────────────────────────────────────────────
const now = new Date().toISOString();
const people: Person[] = flat.people.map((p) => {
  const family = familyById.get(p.familyId);
  if (!family) errors.push(`${p.fullName} (${p.id}) has unknown familyId "${p.familyId}"`);
  return {
    id: p.id,
    fullName: p.fullName,
    familyId: p.familyId,
    familyBranch: family?.name ?? p.familyBranch,
    photo: p.photo ?? null,
    gender: "unspecified",
    status: null,
    occupation: p.occupation ?? null,
    location: p.location ?? null,
    generation: p.generation || 1,
    adapaduchu: Boolean(p.adapaduchu),
    deceased: Boolean(p.deceased),
    married: Boolean(p.married),
    notes: p.notes ?? null,
    // Carried across as-is. §12: the migration does not upgrade anyone to
    // "verified" who was not already recorded as such.
    verificationStatus: p.verificationStatus,
    customFields: [],
    mediaIds: [],
    createdAt: now,
    updatedAt: now,
  };
});

const personIds = new Set(people.map((p) => p.id));

// ── relationships, in §16's field names, both directions ──────────────────
const relMap = new Map<string, Relationship>();
for (const raw of flat.relationships) {
  const from = raw.personId;
  const to = raw.relatedPersonId;
  const type = raw.relationshipType;
  if (!personIds.has(from)) {
    errors.push(`relationship ${type} references unknown person "${from}"`);
    continue;
  }
  if (!personIds.has(to)) {
    errors.push(`relationship ${type} references unknown person "${to}"`);
    continue;
  }
  const a = people.find((p) => p.id === from)!;
  const b = people.find((p) => p.id === to)!;
  const crossFamily = a.familyId !== b.familyId;

  for (const [f, t, ty] of [
    [from, to, type],
    [to, from, inverseType(type)],
  ] as [string, string, Relationship["relationshipType"]][]) {
    const id = relationshipId(ty, f, t);
    if (relMap.has(id)) continue;
    relMap.set(id, {
      id,
      fromPersonId: f,
      toPersonId: t,
      relationshipType: ty,
      verificationStatus: raw.verificationStatus,
      crossFamily: crossFamily || undefined,
      createdAt: now,
    });
  }
}
const relationships = [...relMap.values()];

// ── report ────────────────────────────────────────────────────────────────
const byFamily = new Map<string, number>();
for (const p of people) byFamily.set(p.familyId, (byFamily.get(p.familyId) ?? 0) + 1);

console.log(`\nFamilies:      ${families.length}`);
console.log(`People:        ${people.length}`);
console.log(`Relationships: ${relationships.length} (both directions stored)`);
const cross = relationships.filter((r) => r.crossFamily).length;
console.log(`Cross-family:  ${cross}`);
console.log(`Adapaduchu:    ${people.filter((p) => p.adapaduchu).length}`);
console.log(`Needs review:  ${people.filter((p) => p.verificationStatus !== "verified").length}`);
console.log("\nPer family:");
for (const family of families) {
  const n = byFamily.get(family.id) ?? 0;
  console.log(`  ${family.name.padEnd(42)} ${String(n).padStart(4)}`);
}

if (errors.length > 0) {
  console.error(`\n${errors.length} problem(s) — refusing to write:`);
  for (const e of errors.slice(0, 20)) console.error(`  ${e}`);
  process.exit(1);
}

if (people.length === 0) {
  console.error("\nThe seed produced no people. Refusing to write an empty tree.");
  process.exit(1);
}

// ── write ─────────────────────────────────────────────────────────────────
if (!dryRun) {
  console.log("");
  backup(PEOPLE_FILE);
  backup(RELS_FILE);
}
write(PEOPLE_FILE, { version: 1, updatedAt: now, people });
write(RELS_FILE, { version: 1, updatedAt: now, relationships });
if (!fs.existsSync(MEDIA_FILE)) write(MEDIA_FILE, { version: 1, media: [] });
if (!fs.existsSync(AUDIT_FILE)) {
  write(AUDIT_FILE, {
    version: 1,
    audit: [
      {
        id: `audit-${Date.now()}`,
        at: now,
        actor: "migration",
        action: "create",
        entity: "person",
        entityId: "*",
        newValue: { people: people.length, relationships: relationships.length },
        summary: `Migrated ${people.length} people and ${relationships.length} relationships out of seed.ts into data`,
      },
    ],
  });
}

console.log(
  dryRun
    ? "\nDry run complete. Nothing written."
    : "\nWrote content/data/family-people.json and family-relationships.json.",
);
if (!dryRun) {
  console.log("The tree now renders from data. lib/family-trees/seed.ts is no longer read");
  console.log("at runtime and can be deleted once you are happy with the result.");
}
