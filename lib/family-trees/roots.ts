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
  for (const rel of dataset.relationships) {
    if (rel.relationshipType !== "parent") continue;
    if (ids.has(rel.fromPersonId) && ids.has(rel.toPersonId)) {
      hasLocalParent.add(rel.fromPersonId);
    }
  }
  return inFamily
    .filter((p) => !hasLocalParent.has(p.id))
    .sort(
      (a, b) =>
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
        a.fullName.localeCompare(b.fullName),
    )
    .map((p) => p.id);
}
