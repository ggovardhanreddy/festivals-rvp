/**
 * Client-safe helpers for the Learning Center.
 *
 * The one rule that matters: `publicResources()` is the ONLY way a page gets
 * resources, and it filters to status "published". A resource sitting at
 * "new", "needs-review" or "expired" must never render as a live resource —
 * §23's safe start is meaningless if a draft leaks onto the public site.
 */
import { CATEGORY_TREE, type CategoryKey } from "./taxonomy";
import type {
  Resource,
  ResourceLanguage,
  ResourceStatus,
  ResourceType,
} from "./types";

export * from "./taxonomy";
export { LANGUAGE_LABEL, PUBLIC_STATUSES } from "./types";
export type {
  CollectorNotification,
  CollectorRun,
  Resource,
  ResourceLanguage,
  ResourceStatus,
  ResourceType,
  Source,
} from "./types";

/** The gate. Everything public goes through here. */
export function publicResources(all: Resource[]): Resource[] {
  return all.filter((r) => r.status === "published");
}

/** Archived-but-preserved resources, for the §11 archive view. */
export function archivedResources(all: Resource[]): Resource[] {
  return all.filter((r) => r.status === "expired");
}

export function byCategory(resources: Resource[], category: CategoryKey): Resource[] {
  return resources.filter((r) => r.category === category);
}

/** Newest first, by the most meaningful date each resource has. */
export function resourceDate(r: Resource): string {
  return r.lastUpdatedDate ?? r.publishedDate ?? r.collectedDate;
}

export function sortByRecency(resources: Resource[]): Resource[] {
  return [...resources].sort((a, b) => (resourceDate(b) < resourceDate(a) ? -1 : 1));
}

export function latest(resources: Resource[], n: number): Resource[] {
  return sortByRecency(resources).slice(0, n);
}

/** Videos that are still playable. §6: never render a broken player. */
export function playableVideos(resources: Resource[]): Resource[] {
  return resources.filter(
    (r) => r.resourceType === "video" && r.video && !r.video.unavailable && r.status === "published",
  );
}

export type ResourceFilters = {
  category?: string;
  subcategory?: string;
  subject?: string;
  classLevel?: string;
  exam?: string;
  language?: string;
  resourceType?: string;
  sourceId?: string;
  year?: string;
  tag?: string;
  /** Free text across title, description, tags and extracted PDF text. */
  q?: string;
};

function matchesText(r: Resource, needle: string): boolean {
  const q = needle.toLowerCase();
  return (
    r.title.toLowerCase().includes(q) ||
    (r.titleTe?.toLowerCase().includes(q) ?? false) ||
    r.description.toLowerCase().includes(q) ||
    r.tags.some((t) => t.toLowerCase().includes(q)) ||
    (r.exam?.toLowerCase().includes(q) ?? false) ||
    (r.subject?.toLowerCase().includes(q) ?? false) ||
    // §15 explicitly asks for extracted PDF text to be searchable.
    (r.textExcerpt?.toLowerCase().includes(q) ?? false)
  );
}

export function applyFilters(resources: Resource[], f: ResourceFilters): Resource[] {
  return resources.filter((r) => {
    if (f.category && r.category !== f.category) return false;
    if (f.subcategory && r.subcategory !== f.subcategory) return false;
    if (f.subject && r.subject !== f.subject) return false;
    if (f.classLevel && r.classLevel !== f.classLevel) return false;
    if (f.exam && r.exam !== f.exam) return false;
    if (f.language && r.language !== f.language) return false;
    if (f.resourceType && r.resourceType !== f.resourceType) return false;
    if (f.sourceId && r.sourceId !== f.sourceId) return false;
    if (f.year && !resourceDate(r).startsWith(f.year)) return false;
    if (f.tag && !r.tags.includes(f.tag)) return false;
    if (f.q && f.q.trim() && !matchesText(r, f.q.trim())) return false;
    return true;
  });
}

/** Counts per category, for the hub's section cards. */
export function categoryCounts(resources: Resource[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORY_TREE) counts[cat.key] = 0;
  for (const r of resources) counts[r.category] = (counts[r.category] ?? 0) + 1;
  return counts;
}

/** Distinct values present in the catalog, for building filter controls that
 *  only offer options that would actually return something. */
export function facets(resources: Resource[]) {
  const pick = <K extends keyof Resource>(key: K) =>
    [...new Set(resources.map((r) => r[key]).filter(Boolean))].map(String).sort();
  return {
    languages: pick("language") as ResourceLanguage[],
    subjects: pick("subject"),
    classLevels: pick("classLevel"),
    exams: pick("exam"),
    resourceTypes: pick("resourceType") as ResourceType[],
    sources: pick("sourceId"),
    years: [...new Set(resources.map((r) => resourceDate(r).slice(0, 4)))].sort().reverse(),
  };
}

/**
 * May a reader download our copy?
 *
 * Only when we actually host one, and we only host when the source said yes.
 * A resource with no local copy shows "View Original Resource →" instead —
 * §4's rule for anything that cannot legally be stored locally.
 */
export function canDownload(r: Resource): boolean {
  return Boolean(r.localFileUrl) && r.licenseStatus === "yes";
}

export function formatFileSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  pdf: "PDF",
  document: "Document",
  "question-paper": "Question paper",
  notification: "Notification",
  "study-material": "Study material",
  textbook: "Textbook",
  syllabus: "Syllabus",
  video: "Video",
  course: "Course",
  dataset: "Dataset",
  link: "Link",
};

export const STATUS_LABEL: Record<ResourceStatus, string> = {
  new: "New",
  verified: "Verified",
  published: "Published",
  "needs-review": "Needs review",
  expired: "Expired / Archived",
  removed: "Removed",
  "source-unavailable": "Source unavailable",
};

/** A stable, human-readable slug for a resource's own page. */
export function resourceSlug(r: Resource): string {
  const base = r.title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // The id suffix keeps two identically-titled papers apart.
  return `${base || "resource"}-${r.id.split("-").pop()}`;
}

export function findBySlug(resources: Resource[], slug: string): Resource | undefined {
  return resources.find((r) => resourceSlug(r) === slug);
}

/** Group a category's resources under its subcategories, dropping empties. */
export function groupBySubcategory(resources: Resource[], category: CategoryKey) {
  const cat = CATEGORY_TREE.find((c) => c.key === category);
  if (!cat) return [];
  const groups = cat.subcategories.map((sub) => ({
    key: sub.key,
    label: sub.label,
    labelTe: sub.labelTe,
    items: resources.filter((r) => r.subcategory === sub.key),
  }));
  const ungrouped = resources.filter((r) => !r.subcategory || !cat.subcategories.some((s) => s.key === r.subcategory));
  if (ungrouped.length > 0) {
    groups.push({ key: "other", label: "Other", labelTe: "ఇతర", items: ungrouped });
  }
  return groups.filter((g) => g.items.length > 0);
}
