import { describe, expect, it } from "vitest";
import {
  adapaduchuLabel,
  inverseType,
  personIdFrom,
  relationshipId,
  type Family,
  type FamilyTreeDataset,
  type Person,
} from "@/lib/family-trees/entities";
import {
  addFamily,
  addPerson,
  addRelationship,
  deleteFamily,
  deletePerson,
  movePersonToFamily,
  recomputeGenerations,
  removeRelationship,
  reorderFamilies,
  setCustomFields,
  updateFamily,
  updatePerson,
} from "@/lib/family-trees/mutate";
import { deriveRoots } from "@/lib/family-trees/roots";
import {
  loadAdminFamilyTreeDataset,
  loadFamilyTreeDataset,
  publicFamilyTreeDataset,
} from "@/lib/family-trees/store";
import { mergeAudit } from "@/lib/family-trees/audit-client";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AuditLog } from "@/lib/family-trees/entities";

const ACTOR = "test-admin";

function family(id: string, name: string, order = 1): Family {
  return { id, name, slug: id.toLowerCase(), displayOrder: order, isPublished: true };
}

function empty(): FamilyTreeDataset {
  return {
    families: [family("ALPHA", "Alpha Family", 1), family("BETA", "Beta Family", 2)],
    people: [],
    relationships: [],
    media: [],
    audit: [],
  };
}

/** A three-generation family: root + spouse → child → grandchild. */
function seeded() {
  let d = empty();
  const root = addPerson(d, ACTOR, { fullName: "Root Person", familyId: "ALPHA" });
  d = root.dataset;
  const spouse = addPerson(d, ACTOR, { fullName: "Root Spouse", familyId: "ALPHA" });
  d = spouse.dataset;
  d = addRelationship(d, ACTOR, root.personId, spouse.personId, "spouse").dataset;
  const child = addPerson(d, ACTOR, { fullName: "Child One", familyId: "ALPHA" });
  d = child.dataset;
  d = addRelationship(d, ACTOR, root.personId, child.personId, "child").dataset;
  const grandchild = addPerson(d, ACTOR, { fullName: "Grand One", familyId: "ALPHA" });
  d = grandchild.dataset;
  d = addRelationship(d, ACTOR, child.personId, grandchild.personId, "child").dataset;
  return {
    dataset: d,
    ids: {
      root: root.personId,
      spouse: spouse.personId,
      child: child.personId,
      grandchild: grandchild.personId,
    },
  };
}

const byId = (d: FamilyTreeDataset, id: string) => d.people.find((p) => p.id === id)!;

describe("entity helpers", () => {
  it("renders adapaduchu exactly as §8 requires, and never '- A'", () => {
    expect(adapaduchuLabel({ adapaduchu: true, deceased: false })).toBe("Adapaduchu (Married)");
    expect(adapaduchuLabel({ adapaduchu: true, deceased: true })).toBe(
      "Adapaduchu (Married, Deceased)",
    );
    expect(adapaduchuLabel({ adapaduchu: false, deceased: false })).toBeNull();
    for (const v of [
      adapaduchuLabel({ adapaduchu: true, deceased: false }),
      adapaduchuLabel({ adapaduchu: true, deceased: true }),
    ]) {
      expect(v).not.toContain("- A");
    }
  });

  it("inverts relationship types", () => {
    expect(inverseType("parent")).toBe("child");
    expect(inverseType("child")).toBe("parent");
    expect(inverseType("spouse")).toBe("spouse");
  });

  it("generates unique person ids without colliding", () => {
    const taken = new Set(["ravi-reddy"]);
    expect(personIdFrom("Ravi Reddy", new Set())).toBe("ravi-reddy");
    expect(personIdFrom("Ravi Reddy", taken)).toBe("ravi-reddy-2");
    // A name with no latin letters still produces a usable id.
    expect(personIdFrom("రవి", new Set())).toBeTruthy();
  });
});

describe("adding people", () => {
  it("requires nothing but a name and a family, and never infers the family", () => {
    const { dataset } = addPerson(empty(), ACTOR, {
      fullName: "Someone Reddy",
      familyId: "BETA",
    });
    const person = dataset.people[0]!;
    // The surname says nothing. Only familyId decides.
    expect(person.familyId).toBe("BETA");
    expect(person.familyBranch).toBe("Beta Family");
  });

  it("starts a new person at needs-verification, not verified (§12)", () => {
    const { dataset } = addPerson(empty(), ACTOR, { fullName: "A", familyId: "ALPHA" });
    expect(dataset.people[0]!.verificationStatus).toBe("needs-verification");
  });

  it("marks anyone flagged adapaduchu as married too", () => {
    const { dataset } = addPerson(empty(), ACTOR, {
      fullName: "Daughter",
      familyId: "ALPHA",
      adapaduchu: true,
    });
    expect(dataset.people[0]!.married).toBe(true);
  });

  it("writes an audit entry naming who and what (§15)", () => {
    const { audit } = addPerson(empty(), ACTOR, { fullName: "A", familyId: "ALPHA" });
    expect(audit).toHaveLength(1);
    expect(audit[0]!.actor).toBe(ACTOR);
    expect(audit[0]!.action).toBe("create");
    expect(audit[0]!.summary).toContain("Alpha Family");
  });
});

describe("relationships are stored, never inferred", () => {
  it("stores both directions so no walk has to guess (§16)", () => {
    const { dataset, ids } = seeded();
    expect(
      dataset.relationships.find(
        (r) => r.id === relationshipId("child", ids.root, ids.child),
      ),
    ).toBeDefined();
    expect(
      dataset.relationships.find(
        (r) => r.id === relationshipId("parent", ids.child, ids.root),
      ),
    ).toBeDefined();
  });

  it("uses §16's field names", () => {
    const { dataset } = seeded();
    const rel = dataset.relationships[0]!;
    expect(rel).toHaveProperty("fromPersonId");
    expect(rel).toHaveProperty("toPersonId");
    expect(rel).toHaveProperty("relationshipType");
    expect(rel).toHaveProperty("id");
  });

  it("defaults a new relationship to needs-verification (§12)", () => {
    const { dataset, ids } = seeded();
    const rel = dataset.relationships.find(
      (r) => r.id === relationshipId("child", ids.root, ids.child),
    )!;
    expect(rel.verificationStatus).toBe("needs-verification");
  });

  it("refuses to relate a person to themselves", () => {
    const { dataset, ids } = seeded();
    const result = addRelationship(dataset, ACTOR, ids.root, ids.root, "spouse");
    expect(result.audit).toHaveLength(0);
    expect(result.dataset).toBe(dataset);
  });

  it("is idempotent — adding the same link twice changes nothing", () => {
    const { dataset, ids } = seeded();
    const again = addRelationship(dataset, ACTOR, ids.root, ids.child, "child");
    expect(again.audit).toHaveLength(0);
  });

  it("removes both directions together", () => {
    const { dataset, ids } = seeded();
    const after = removeRelationship(dataset, ACTOR, ids.root, ids.child, "child");
    expect(
      after.dataset.relationships.some(
        (r) => r.fromPersonId === ids.root && r.toPersonId === ids.child,
      ),
    ).toBe(false);
    expect(
      after.dataset.relationships.some(
        (r) => r.fromPersonId === ids.child && r.toPersonId === ids.root,
      ),
    ).toBe(false);
  });

  it("flags a cross-family link rather than making it quietly (§19)", () => {
    let d = seeded().dataset;
    const outsider = addPerson(d, ACTOR, { fullName: "Beta Person", familyId: "BETA" });
    d = outsider.dataset;
    const rootId = d.people.find((p) => p.fullName === "Root Person")!.id;
    const result = addRelationship(d, ACTOR, rootId, outsider.personId, "spouse");
    const rel = result.dataset.relationships.find(
      (r) => r.fromPersonId === rootId && r.toPersonId === outsider.personId,
    )!;
    expect(rel.crossFamily).toBe(true);
    expect(result.audit[0]!.summary).toContain("ACROSS families");
  });
});

describe("generations come from the edges, not from a field", () => {
  it("places three generations correctly", () => {
    const { dataset, ids } = seeded();
    expect(byId(dataset, ids.root).generation).toBe(1);
    expect(byId(dataset, ids.child).generation).toBe(2);
    expect(byId(dataset, ids.grandchild).generation).toBe(3);
  });

  it("keeps a couple on the same row", () => {
    const { dataset, ids } = seeded();
    expect(byId(dataset, ids.spouse).generation).toBe(byId(dataset, ids.root).generation);
  });

  it("re-deepens everyone when a parent is inserted above the root (§7)", () => {
    const { dataset, ids } = seeded();
    const added = addPerson(dataset, ACTOR, { fullName: "Grandfather", familyId: "ALPHA" });
    const linked = addRelationship(added.dataset, ACTOR, added.personId, ids.root, "child");
    const d = linked.dataset;
    expect(byId(d, added.personId).generation).toBe(1);
    expect(byId(d, ids.root).generation).toBe(2);
    expect(byId(d, ids.child).generation).toBe(3);
    expect(byId(d, ids.grandchild).generation).toBe(4);
  });

  it("ignores a hand-set generation that disagrees with the tree", () => {
    const { dataset, ids } = seeded();
    const after = updatePerson(dataset, ACTOR, ids.grandchild, { generation: 99 });
    expect(byId(after.dataset, ids.grandchild).generation).toBe(3);
  });

  it("does not loop forever on a cyclic relationship", () => {
    const { dataset, ids } = seeded();
    // Nonsense data, but a UI mistake could produce it.
    const cyclic = addRelationship(dataset, ACTOR, ids.grandchild, ids.root, "child");
    const people = recomputeGenerations(cyclic.dataset);
    expect(people).toHaveLength(dataset.people.length);
    for (const p of people) expect(Number.isFinite(p.generation)).toBe(true);
  });
});

describe("roots", () => {
  it("is whoever has no parent inside the family", () => {
    const { dataset, ids } = seeded();
    expect(deriveRoots(dataset, "ALPHA")).toContain(ids.root);
    expect(deriveRoots(dataset, "ALPHA")).not.toContain(ids.child);
  });

  it("changes the moment a parent is added above (§7)", () => {
    const { dataset, ids } = seeded();
    const added = addPerson(dataset, ACTOR, { fullName: "Elder", familyId: "ALPHA" });
    const linked = addRelationship(added.dataset, ACTOR, added.personId, ids.root, "child");
    const roots = deriveRoots(linked.dataset, "ALPHA");
    expect(roots).toContain(added.personId);
    expect(roots).not.toContain(ids.root);
  });

  it("does not treat a parent in another family as a local parent (§19)", () => {
    let d = seeded().dataset;
    const rootId = d.people.find((p) => p.fullName === "Root Person")!.id;
    const outsider = addPerson(d, ACTOR, { fullName: "Outside Parent", familyId: "BETA" });
    d = addRelationship(outsider.dataset, ACTOR, outsider.personId, rootId, "child").dataset;
    // Root still heads the Alpha chart despite having a Beta parent.
    expect(deriveRoots(d, "ALPHA")).toContain(rootId);
    expect(byId(d, rootId).generation).toBe(1);
  });
});

describe("editing a person", () => {
  it("records one audit row per changed field, with the old value (§15)", () => {
    const { dataset, ids } = seeded();
    const after = updatePerson(dataset, ACTOR, ids.child, {
      occupation: "Teacher",
      location: "Reddivaripalli",
    });
    expect(after.audit).toHaveLength(2);
    const occ = after.audit.find((a) => a.field === "occupation")!;
    expect(occ.previousValue).toBeNull();
    expect(occ.newValue).toBe("Teacher");
  });

  it("does nothing, and records nothing, when values are unchanged", () => {
    const { dataset, ids } = seeded();
    const before = byId(dataset, ids.child);
    const after = updatePerson(dataset, ACTOR, ids.child, { fullName: before.fullName });
    expect(after.audit).toHaveLength(0);
    expect(after.dataset).toBe(dataset);
  });

  it("changes family association from the form (§3)", () => {
    const { dataset, ids } = seeded();
    const after = updatePerson(dataset, ACTOR, ids.child, { familyId: "BETA" });
    expect(byId(after.dataset, ids.child).familyId).toBe("BETA");
    expect(byId(after.dataset, ids.child).familyBranch).toBe("Beta Family");
  });

  it("stores admin-defined custom fields (§10)", () => {
    const { dataset, ids } = seeded();
    const after = setCustomFields(dataset, ACTOR, { personId: ids.child }, [
      { id: "cf1", name: "Gotra", value: "Example", isPublic: true },
    ]);
    expect(byId(after.dataset, ids.child).customFields).toHaveLength(1);
    expect(after.audit[0]!.entity).toBe("custom-field");
  });
});

describe("deleting a person", () => {
  it("removes them and every edge that touched them", () => {
    const { dataset, ids } = seeded();
    const after = deletePerson(dataset, ACTOR, ids.child);
    expect(after.dataset.people.some((p) => p.id === ids.child)).toBe(false);
    expect(
      after.dataset.relationships.some(
        (r) => r.fromPersonId === ids.child || r.toPersonId === ids.child,
      ),
    ).toBe(false);
  });

  it("keeps what it removed in the audit entry, so it is recoverable (§15)", () => {
    const { dataset, ids } = seeded();
    const after = deletePerson(dataset, ACTOR, ids.child);
    const previous = after.audit[0]!.previousValue as {
      person: Person;
      relationships: unknown[];
    };
    expect(previous.person.fullName).toBe("Child One");
    expect(previous.relationships.length).toBeGreaterThan(0);
  });

  it("re-levels the survivors", () => {
    const { dataset, ids } = seeded();
    const after = deletePerson(dataset, ACTOR, ids.child);
    // The grandchild now has no parent in the family, so it heads its own line.
    expect(byId(after.dataset, ids.grandchild).generation).toBe(1);
  });
});

describe("moving a person to the correct branch (§4)", () => {
  it("moves descendants with them by default", () => {
    const { dataset, ids } = seeded();
    const after = movePersonToFamily(dataset, ACTOR, ids.child, "BETA", {
      withDescendants: true,
    });
    expect(byId(after.dataset, ids.child).familyId).toBe("BETA");
    expect(byId(after.dataset, ids.grandchild).familyId).toBe("BETA");
  });

  it("can move just the one person", () => {
    const { dataset, ids } = seeded();
    const after = movePersonToFamily(dataset, ACTOR, ids.child, "BETA", {
      withDescendants: false,
    });
    expect(byId(after.dataset, ids.child).familyId).toBe("BETA");
    expect(byId(after.dataset, ids.grandchild).familyId).toBe("ALPHA");
  });

  it("keeps the relationships and marks the ones that now cross families", () => {
    const { dataset, ids } = seeded();
    const after = movePersonToFamily(dataset, ACTOR, ids.child, "BETA", {
      withDescendants: false,
    });
    const rel = after.dataset.relationships.find(
      (r) => r.fromPersonId === ids.root && r.toPersonId === ids.child,
    )!;
    expect(rel).toBeDefined();
    expect(rel.crossFamily).toBe(true);
  });
});

describe("families (§9)", () => {
  it("edits name, slug, description, history, cover, order and published", () => {
    const after = updateFamily(empty(), ACTOR, "ALPHA", {
      name: "Renamed",
      slug: "renamed",
      description: "d",
      history: "h",
      coverPhoto: "/x.jpg",
      displayOrder: 7,
      isPublished: false,
    });
    const f = after.dataset.families.find((x) => x.id === "ALPHA")!;
    expect(f.name).toBe("Renamed");
    expect(f.isPublished).toBe(false);
    expect(after.audit.length).toBe(7);
  });

  it("renaming a family updates the branch shown on its people", () => {
    const { dataset } = seeded();
    const after = updateFamily(dataset, ACTOR, "ALPHA", { name: "Alpha Renamed" });
    for (const p of after.dataset.people.filter((x) => x.familyId === "ALPHA")) {
      expect(p.familyBranch).toBe("Alpha Renamed");
    }
  });

  it("creates a new family unpublished", () => {
    const after = addFamily(empty(), ACTOR, { name: "Gamma Family" });
    const created = after.dataset.families.find((f) => f.id === after.familyId)!;
    expect(created.isPublished).toBe(false);
    expect(created.slug).toBe("gamma-family");
  });

  it("refuses to delete a family that still has people", () => {
    const { dataset } = seeded();
    const after = deleteFamily(dataset, ACTOR, "ALPHA");
    expect(after.refused).toContain("still in this family");
    expect(after.dataset.families).toHaveLength(2);
  });

  it("deletes an empty family", () => {
    const after = deleteFamily(empty(), ACTOR, "BETA");
    expect(after.refused).toBeUndefined();
    expect(after.dataset.families.map((f) => f.id)).toEqual(["ALPHA"]);
  });

  it("reorders families", () => {
    const after = reorderFamilies(empty(), ACTOR, ["BETA", "ALPHA"]);
    const beta = after.dataset.families.find((f) => f.id === "BETA")!;
    expect(beta.displayOrder).toBe(1);
  });
});

describe("the thirteen village families stay separate (§19)", () => {
  it("adding a person to one family never touches another", () => {
    let d = empty();
    d = addPerson(d, ACTOR, { fullName: "A Reddy", familyId: "ALPHA" }).dataset;
    d = addPerson(d, ACTOR, { fullName: "A Reddy", familyId: "BETA" }).dataset;
    // Identical names, no relationship created between them.
    expect(d.relationships).toHaveLength(0);
    expect(d.people.map((p) => p.familyId).sort()).toEqual(["ALPHA", "BETA"]);
  });

  it("gives two identically-named people distinct ids", () => {
    let d = empty();
    const first = addPerson(d, ACTOR, { fullName: "Same Name", familyId: "ALPHA" });
    d = first.dataset;
    const second = addPerson(d, ACTOR, { fullName: "Same Name", familyId: "BETA" });
    expect(second.personId).not.toBe(first.personId);
  });
});

/**
 * §17 — what the public site must not expose.
 *
 * These are regression locks, not behaviour tests. The site is a static
 * export, so React serialises client-component props into the published HTML:
 * a field that is merely never rendered is still readable with view-source.
 * The only safe place to withhold something is the data.
 */
describe("§17 public exposure", () => {
  it("strips private notes from the public dataset", () => {
    const dataset = publicFamilyTreeDataset();
    const leaking = dataset.people.filter((p) => "privateNotes" in p);
    expect(leaking).toEqual([]);
  });

  it("strips audit history from the public dataset", () => {
    expect(publicFamilyTreeDataset().audit).toEqual([]);
  });

  it("strips audit history from the admin page's build-time props", () => {
    // The admin page is a public static file too — /admin/index.html is
    // served to anyone. Only the data behind the authenticated API may hold
    // the change log.
    expect(loadAdminFamilyTreeDataset().audit).toEqual([]);
  });

  it("keeps the public tree itself intact while stripping", () => {
    const full = loadFamilyTreeDataset();
    const pub = publicFamilyTreeDataset();
    expect(pub.people).toHaveLength(full.people.length);
    expect(pub.relationships).toHaveLength(full.relationships.length);
    expect(pub.families).toHaveLength(full.families.length);
    // The public caption survives; only the private field goes.
    expect(pub.people.some((p) => p.notes)).toBe(true);
  });

  it("carries a private note through create and update without publishing it", () => {
    const base: FamilyTreeDataset = {
      families: [
        {
          id: "f1",
          name: "One",
          slug: "one",
          displayOrder: 1,
          isPublished: true,
          rootPersonIds: [],
        },
      ],
      people: [],
      relationships: [],
      media: [],
      audit: [],
    };
    const created = addPerson(base, "admin", {
      fullName: "A",
      familyId: "f1",
      privateNotes: "told to me by X",
    });
    const person = created.dataset.people[0]!;
    expect(person.privateNotes).toBe("told to me by X");

    const edited = updatePerson(created.dataset, "admin", person.id, {
      privateNotes: "confirmed with Y",
    });
    expect(edited.dataset.people[0]!.privateNotes).toBe("confirmed with Y");
    // §15 — the change is recorded.
    expect(edited.audit.some((a) => a.field === "privateNotes")).toBe(true);
  });

  it("merges new audit rows in front of stored ones without duplicating", () => {
    const row = (id: string): AuditLog => ({
      id,
      at: "2026-01-01T00:00:00.000Z",
      actor: "admin",
      action: "update",
      entity: "person",
      entityId: "p1",
      summary: "test row",
    });
    const merged = mergeAudit([row("new"), row("dup")], [row("dup"), row("old")]);
    expect(merged.map((r) => r.id)).toEqual(["new", "dup", "old"]);
  });
});

/**
 * §17 — the bundle, not just the render.
 *
 * `output: "export"` has no server, so lib/family-trees/store.ts is reached
 * from client components and everything it imports statically is copied into a
 * public _next/static chunk. Stripping a field at runtime is therefore too
 * late: the value is already in the JavaScript the browser downloads.
 *
 * Two rules follow, and they are checked here because npm run test:unit gates
 * the deploy:
 *   1. store.ts must not import the audit log at all.
 *   2. the committed snapshot must carry no admin-only field.
 * Both live only in R2, reached through the admin-authenticated API.
 */
describe("§17 nothing admin-only reaches the client bundle", () => {
  const root = process.cwd();

  it("store.ts does not import the audit log", () => {
    const source = readFileSync(join(root, "lib/family-trees/store.ts"), "utf8");
    expect(source).not.toMatch(/from\s+"@\/content\/data\/family-audit\.json"/);
  });

  it("the committed people snapshot carries no admin-only field", () => {
    const raw = readFileSync(join(root, "content/data/family-people.json"), "utf8");
    const people = (JSON.parse(raw) as { people: Record<string, unknown>[] }).people;
    const offenders = people
      .filter((p) => "privateNotes" in p)
      .map((p) => p.id);
    expect(offenders).toEqual([]);
  });

  it("the committed snapshot is not served as a static asset", () => {
    // content/ is imported, never copied to public/. If that ever changes the
    // JSON becomes fetchable in full, private fields and all.
    expect(existsSync(join(root, "public/content/data/family-people.json"))).toBe(false);
  });
});
