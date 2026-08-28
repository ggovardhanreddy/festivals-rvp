/**
 * Typed content model for the platform's future content types.
 *
 * Zod is a DEV dependency: every schema here is evaluated at build time by
 * scripts/validate-content.ts, never in the browser. No runtime bytes.
 *
 * Nothing in this file is wired into a page yet — Phase 1A defines the shape
 * so Phases 2-5 add content rather than inventing a model each time.
 * The existing content/data/*.json seeds are untouched and keep their own
 * loaders in lib/; this is additive.
 */
import { z } from "zod";

/** ---- shared -------------------------------------------------------- */

export const LocaleCode = z.enum(["en", "te"]);

/** Human-readable text that may exist in one or both languages. */
export const LocalizedText = z.object({
  en: z.string().min(1),
  te: z.string().min(1).optional(),
});

/**
 * Provenance. REQUIRED on every factual content type.
 *
 * A government scheme, job, crop guide or health claim without a checkable
 * source is exactly the kind of content this platform must not publish, so
 * the schema refuses it rather than leaving it to review.
 */
export const Provenance = z.object({
  source: z.string().min(1),
  sourceUrl: z.string().url(),
  /** Who checked it. Null is allowed and means "not yet reviewed". */
  reviewer: z.string().min(1).nullable(),
  /** ISO date. Stale content is a correctness bug, so this is mandatory. */
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

const BaseDoc = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: LocalizedText,
  description: LocalizedText,
  image: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const Level = z.enum(["beginner", "intermediate", "advanced"]);
const AgeGroup = z.enum(["preschool", "5-7", "8-10", "11-13", "teen"]);

/** ---- learning ------------------------------------------------------ */

export const LessonSchema = BaseDoc.extend({
  kind: z.literal("lesson"),
  courseId: z.string().min(1),
  order: z.number().int().nonnegative(),
  body: LocalizedText.optional(),
  videoId: z.string().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
});

export const CourseSchema = BaseDoc.extend({
  kind: z.literal("course"),
  track: z.enum(["kids", "school", "english", "engineering", "it", "careers", "digital", "agriculture"]),
  level: Level,
  language: z.array(LocaleCode).min(1),
  lessonIds: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  provenance: Provenance.optional(),
});

export const QuizSchema = BaseDoc.extend({
  kind: z.literal("quiz"),
  courseId: z.string().optional(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        prompt: LocalizedText,
        options: z.array(LocalizedText).min(2),
        correctIndex: z.number().int().nonnegative(),
        explanation: LocalizedText.optional(),
      }),
    )
    .min(1),
});

export const GameSchema = BaseDoc.extend({
  kind: z.literal("game"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().int().positive(),
  route: z.string().startsWith("/"),
  ageGroup: z.array(AgeGroup).default([]),
});

export const VideoSchema = BaseDoc.extend({
  kind: z.literal("video"),
  /** Embed only. The platform never rehosts third-party video. */
  provider: z.enum(["youtube"]),
  externalId: z.string().min(1),
  durationSeconds: z.number().int().positive().optional(),
  provenance: Provenance,
});

/** ---- agriculture --------------------------------------------------- */

export const CropStage = z.enum([
  "land-preparation", "nursery", "sowing", "transplanting", "vegetative",
  "flowering", "fruiting", "harvest", "post-harvest",
]);

export const CropSchema = BaseDoc.extend({
  kind: z.literal("crop"),
  season: z.array(z.enum(["kharif", "rabi", "summer", "perennial"])).min(1),
  soil: z.array(z.string()).default([]),
  waterNeed: z.enum(["low", "medium", "high"]),
  provenance: Provenance,
});

export const AgricultureGuideSchema = BaseDoc.extend({
  kind: z.literal("agriculture-guide"),
  cropId: z.string().min(1),
  region: z.string().default("YSR Kadapa / Annamayya"),
  cropStage: CropStage,
  guidance: LocalizedText,
  /**
   * Chemical, pesticide and fertiliser dosages are NEVER generated. If a
   * dosage appears it must cite the exact document it came from, which is why
   * this carries its own provenance separate from the guide's.
   */
  dosage: z
    .object({ text: LocalizedText, provenance: Provenance })
    .optional(),
  provenance: Provenance,
});

/** ---- civic and community ------------------------------------------- */

export const GovernmentSchemeSchema = BaseDoc.extend({
  kind: z.literal("government-scheme"),
  audience: z.array(z.enum(["farmer", "student", "senior", "woman", "general"])).min(1),
  eligibility: LocalizedText,
  benefits: LocalizedText,
  documents: z.array(LocalizedText).default([]),
  howToApply: LocalizedText,
  provenance: Provenance,
});

export const JobSchema = BaseDoc.extend({
  kind: z.literal("job"),
  employer: z.string().min(1),
  category: z.enum(["fresher", "experienced", "internship", "government", "remote"]),
  location: z.string().min(1),
  applyUrl: z.string().url(),
  closesOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  provenance: Provenance,
});

export const ServiceSchema = BaseDoc.extend({
  kind: z.literal("service"),
  category: z.enum([
    "doctor", "hospital", "pharmacy", "veterinary", "school", "teacher",
    "government-office", "police", "emergency", "bank", "atm", "shop", "agriculture",
  ]),
  phone: z.string().optional(),
  address: z.string().optional(),
  provenance: Provenance,
});

export const TempleSchema = BaseDoc.extend({
  kind: z.literal("temple"),
  deity: LocalizedText.optional(),
  festivals: z.array(z.string()).default([]),
  history: LocalizedText.optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

export const HeritageItemSchema = BaseDoc.extend({
  kind: z.literal("heritage-item"),
  year: z.string().optional(),
  category: z.string().min(1),
});

export const EventSchema = BaseDoc.extend({
  kind: z.literal("event"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.enum(["festival", "community", "birthday", "development"]),
});

export const NewsSchema = BaseDoc.extend({
  kind: z.literal("news"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  provenance: Provenance.optional(),
});

export const CommunityItemSchema = BaseDoc.extend({
  kind: z.literal("community-item"),
  category: z.enum(["achievement", "announcement", "update"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

/** ---- registry ------------------------------------------------------- */

export const ContentSchemas = {
  course: CourseSchema,
  lesson: LessonSchema,
  quiz: QuizSchema,
  game: GameSchema,
  video: VideoSchema,
  crop: CropSchema,
  "agriculture-guide": AgricultureGuideSchema,
  "government-scheme": GovernmentSchemeSchema,
  job: JobSchema,
  service: ServiceSchema,
  temple: TempleSchema,
  "heritage-item": HeritageItemSchema,
  event: EventSchema,
  news: NewsSchema,
  "community-item": CommunityItemSchema,
} as const;

export type ContentKind = keyof typeof ContentSchemas;

/** Kinds that must carry provenance. Enforced by validate-content.ts. */
export const REQUIRES_PROVENANCE: ContentKind[] = [
  "crop", "agriculture-guide", "government-scheme", "job", "service", "video",
];

export type Course = z.infer<typeof CourseSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type AgricultureGuide = z.infer<typeof AgricultureGuideSchema>;
export type GovernmentScheme = z.infer<typeof GovernmentSchemeSchema>;
export type ContentDoc = z.infer<(typeof ContentSchemas)[ContentKind]>;
