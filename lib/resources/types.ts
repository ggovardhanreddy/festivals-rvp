/**
 * The resource + source model for the automatic Learning Resource Collector.
 *
 * Two rules shape every field here.
 *
 * 1. Permission is a first-class field, not a comment. `licenseStatus` is
 *    "yes" | "no" | "unknown" and NOTHING is downloaded unless it reads
 *    "yes". Unknown is not a soft yes — it routes to admin review. The
 *    research behind the seed source list found exactly three sources in
 *    two dozen that grant reuse in writing, so link-only is the normal case
 *    and hosting is the exception.
 *
 * 2. Provenance is mandatory. Every resource carries the source it came
 *    from, the URL it was found at, and the date it was collected, so a
 *    reader can always check the original and an admin can always answer
 *    "where did this come from".
 *
 * Client-safe: no node imports. The loaders live in ./server.
 */
import type { CategoryKey, ClassLevel, Subject } from "./taxonomy";

export type { CategoryKey, ClassLevel, Subject };

/** ---------------------------------------------------------------- sources */

export type SourceType =
  | "government-education"
  | "examination-board"
  | "scholarship-portal"
  | "national-curriculum"
  | "state-education"
  | "entrance-exam"
  | "competitive-exam"
  | "agriculture"
  | "skill-development"
  | "employment"
  | "open-data"
  | "video-channel";

/**
 * How the collector reads a source.
 *
 * `manual` means the collector never fetches it — the entry exists so the
 * Learning Center can link to it and the admin can record what it is. That
 * is the correct setting for sites that block crawlers, forbid scraping in
 * their terms, or render everything client-side.
 */
export type CollectionMethod = "rss" | "sitemap" | "api" | "html-index" | "youtube" | "manual";

/** Yes/No/Unknown, exactly as §17 requires. Never widen this to a boolean. */
export type LicenseStatus = "yes" | "no" | "unknown";

export type UpdateFrequency = "6-hourly" | "12-hourly" | "daily" | "weekly" | "monthly" | "manual";

/** Minutes between requests to one host. The collector never goes below this. */
export const FREQUENCY_HOURS: Record<UpdateFrequency, number> = {
  "6-hourly": 6,
  "12-hourly": 12,
  daily: 24,
  weekly: 168,
  monthly: 720,
  manual: Number.POSITIVE_INFINITY,
};

export type SourceHealth = {
  /** ISO timestamp of the last attempt, successful or not. */
  lastChecked: string | null;
  /** ISO timestamp of the last attempt that returned usable data. */
  lastSuccess: string | null;
  /** Consecutive failures. Three or more marks the source failing. */
  consecutiveFailures: number;
  lastError: string | null;
  /** Total resources this source has contributed to the catalog. */
  resourceCount: number;
  /** Per-URL conditional-request state, so a re-check costs one 304. */
  etags: Record<string, string>;
  lastModified: Record<string, string>;
};

export type Source = {
  id: string;
  name: string;
  /** Homepage. Always https, always the canonical host. */
  url: string;
  /** Where the collector actually reads from (feed, sitemap, index page). */
  feedUrl?: string;
  type: SourceType;
  categories: CategoryKey[];
  method: CollectionMethod;
  licenseStatus: LicenseStatus;
  /** The sentence that justifies licenseStatus, quoted from the source. */
  licenseNote: string;
  /** Where that sentence was found. Non-negotiable: a verdict needs a cite. */
  licenseUrl?: string;
  /** Attribution string the Learning Center must display when hosting. */
  attribution?: string;
  active: boolean;
  frequency: UpdateFrequency;
  /** Publish collected resources straight to `published`, or hold at `new`?
   *  §23: false for every source until an admin has seen its output. */
  autoPublish: boolean;
  /** Seconds between requests to this host. Politeness floor is 2. */
  crawlDelaySeconds?: number;
  notes?: string;
  health: SourceHealth;
};

export function emptyHealth(): SourceHealth {
  return {
    lastChecked: null,
    lastSuccess: null,
    consecutiveFailures: 0,
    lastError: null,
    resourceCount: 0,
    etags: {},
    lastModified: {},
  };
}

/** ------------------------------------------------------------- resources */

export type ResourceType =
  | "pdf"
  | "document"
  | "question-paper"
  | "notification"
  | "study-material"
  | "textbook"
  | "syllabus"
  | "video"
  | "course"
  | "dataset"
  | "link";

export type ResourceStatus =
  | "new"
  | "verified"
  | "published"
  | "needs-review"
  | "expired"
  | "removed"
  | "source-unavailable";

/** Only `published` is ever visible to the public. */
export const PUBLIC_STATUSES: ResourceStatus[] = ["published"];

export type ResourceLanguage = "en" | "te" | "hi" | "ur" | "other";

export const LANGUAGE_LABEL: Record<ResourceLanguage, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिंदी",
  ur: "اردو",
  other: "Other",
};

/**
 * A quality or security finding on a resource. Recorded rather than thrown:
 * an admin needs to see WHY something is held back, and a silent skip means
 * the same bad file is re-fetched on every run.
 */
export type ResourceFlag =
  | "empty-file"
  | "password-protected"
  | "wrong-file-type"
  | "too-large"
  | "download-failed"
  | "duplicate"
  | "missing-metadata"
  | "license-unclear"
  | "expired"
  | "source-removed"
  | "suspicious-content";

export type ResourceVersion = {
  /** sha256 of the file at this version. */
  hash: string;
  /** ISO date this version was collected. */
  collectedDate: string;
  fileSize: number;
  /** R2 key, when the version was archived. Absent for link-only. */
  fileKey?: string;
  /** What told us it changed: "etag" | "last-modified" | "hash". */
  detectedBy?: string;
};

export type VideoMeta = {
  provider: "youtube" | "other";
  videoId: string;
  channel?: string;
  thumbnail?: string;
  /** Set when the platform reports the video gone; stops the broken player. */
  unavailable?: boolean;
  unavailableCheckedAt?: string;
};

export type Resource = {
  id: string;
  title: string;
  titleTe?: string;
  description: string;
  descriptionTe?: string;

  category: CategoryKey;
  subcategory?: string;
  subject?: Subject;
  classLevel?: ClassLevel;
  exam?: string;
  language: ResourceLanguage;
  resourceType: ResourceType;

  sourceId: string;
  /** The page the resource was discovered on. */
  sourceUrl: string;
  /** The resource itself on the official site. Always present. Always shown. */
  originalUrl: string;
  /** Our hosted copy. Present ONLY when the source licenseStatus is "yes". */
  localFileUrl?: string;

  fileHash?: string;
  fileSize?: number;
  /** Normalised URL used for duplicate detection. */
  canonicalUrl?: string;

  publishedDate?: string;
  lastUpdatedDate?: string;
  collectedDate: string;
  expiryDate?: string;

  licenseStatus: LicenseStatus;
  /** Attribution to render beside a hosted copy. */
  attribution?: string;
  status: ResourceStatus;
  flags: ResourceFlag[];

  tags: string[];
  thumbnail?: string;
  video?: VideoMeta;

  /** First ~2000 chars of extracted text, for search. Not rendered. */
  textExcerpt?: string;
  /** Older versions, newest first. Only kept when we host the file. */
  versions?: ResourceVersion[];

  /** Set when an admin has looked at it. Null means nobody has. */
  reviewedBy?: string | null;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;
};

/** ------------------------------------------------------------ run reports */

export type SourceRunResult = {
  sourceId: string;
  sourceName: string;
  ok: boolean;
  skipped?: "not-due" | "inactive" | "manual-only" | "robots-disallowed";
  checked: number;
  added: number;
  updated: number;
  duplicates: number;
  flagged: number;
  error?: string;
  durationMs: number;
};

export type CollectorRun = {
  id: string;
  startedAt: string;
  finishedAt: string;
  /** "6-hourly" | "daily" | "weekly" | "all" | a single source id. */
  tier: string;
  dryRun: boolean;
  sourcesChecked: number;
  sourcesFailed: number;
  newResources: number;
  updatedResources: number;
  duplicates: number;
  needsReview: number;
  expired: number;
  results: SourceRunResult[];
};

export type NotificationLevel = "info" | "warning" | "action";

export type CollectorNotification = {
  id: string;
  at: string;
  level: NotificationLevel;
  kind:
    | "new-important"
    | "resource-updated"
    | "source-failing"
    | "source-url-changed"
    | "bulk-discovery"
    | "needs-verification"
    | "license-unclear"
    | "video-unavailable";
  message: string;
  sourceId?: string;
  resourceId?: string;
  read?: boolean;
};

/** ---------------------------------------------------------------- catalog */

export type ResourceCatalog = {
  version: 1;
  generatedAt: string;
  resources: Resource[];
};

export type SourceRegistry = {
  version: 1;
  updatedAt: string;
  sources: Source[];
};
