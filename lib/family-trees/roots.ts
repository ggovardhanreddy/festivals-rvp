/**
 * Root derivation, split out so client components can use it.
 *
 * lib/family-trees/store.ts is build-time only (it reads the filesystem), and
 * the editor needs the same rule in the browser after every edit — a person
 * who just had a parent added above them stops being a root immediately.
 */
import type { FamilyTreeDataset } from "./entities";

export function deriveRoots(dataset: FamilyTreeDataset, familyId: string): string[] {
  const inFamily = dataset.people.filter((p) => p.familyId === familyId);
  const ids = new Set(inFamily.map((p) => p.id));
  const hasLocalParent = new Set<string>();
  const spouses = new Map<string, string[]>();
  for (const rel of dataset.relationships) {
    if (!ids.has(rel.fromPersonId) || !ids.has(rel.toPersonId)) continue;
    if (rel.relationshipType === "parent") {
      hasLocalParent.add(rel.fromPersonId);
    }
    if (rel.relationshipType === "spouse") {
      const list = spouses.get(rel.fromPersonId) ?? [];
      if (!list.includes(rel.toPersonId)) list.push(rel.toPersonId);
      spouses.set(rel.fromPersonId, list);
    }
  }
  return inFamily
    .filter((p) => {
      if (hasLocalParent.has(p.id)) return false;
      const partners = spouses.get(p.id) ?? [];
      // A spouse of someone who already has parents in this family is not a
      // second root — they belong beside that person in the descent line.
      if (partners.some((id) => hasLocalParent.has(id))) return false;
      return true;
    })
    .sort(
      (a, b) =>
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
        a.fullName.localeCompare(b.fullName),
    )
    .map((p) => p.id);
}
