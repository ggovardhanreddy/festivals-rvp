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

/**
 * Publication status.
 *
 * Only `published` ever renders as content. Every other value renders as an
 * honest notice saying what is being waited on, which is why the states are
 * named after the real-world blocker rather than a generic "unavailable":
 * a parent reading "waiting on recordings from the village" learns something
 * true, where "coming soon" teaches them nothing.
 */
export const PublicationStatus = z.enum([
  "published",
  "draft",
  "awaiting-permission",
  "awaiting-teacher-review",
  "coming-soon",
  "planned",
]);

/**
 * Permission to publish a recording.
 *
 * Required on every audio or video asset. The village's own songs and stories
 * belong to the people who sing and tell them; a recording without a named
 * person who agreed to it being published is not ours to put on the internet,
 * and the schema refuses it rather than leaving that to review.
 */
export const Permission = z.object({
  /** Who granted it, by name. */
  grantedBy: z.string().min(1),
  /** ISO date the permission was given. */
  grantedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

/**
 * An audio or video file attached to a content item.
 *
 * `provider: "r2"` is a village recording we host. `provider: "youtube"` is an
 * embed — the platform never rehosts third-party video.
 */
export const MediaAsset = z.object({
  type: z.enum(["audio", "video"]),
  provider: z.enum(["r2", "youtube"]).default("r2"),
  /** R2 key or path for provider "r2"; ignored for youtube. */
  src: z.string().min(1).optional(),
  /** Video id for provider "youtube". */
  externalId: z.string().min(1).optional(),
  durationSeconds: z.number().int().positive().optional(),
  /** WebVTT captions path. Optional, but strongly preferred. */
  captions: z.string().optional(),
  permission: Permission,
});

const BaseDoc = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: LocalizedText,
  description: LocalizedText,
  image: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  status: PublicationStatus.default("draft"),
  /** Languages the item genuinely exists in. Not an aspiration. */
  language: z.array(LocaleCode).default(["en"]),
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

export const VideoCategory = z.enum([
  "alphabet-reading",
  "numbers-maths",
  "stories",
  "rhymes",
  "science",
  "digital-skills",
  "general",
]);

export const VideoSchema = BaseDoc.extend({
  kind: z.literal("video"),
  category: VideoCategory,
  ageGroup: z.array(AgeGroup).default([]),
  media: MediaAsset,
  /** Full text, for a child who cannot hear it or a parent who cannot play it. */
  transcript: LocalizedText.optional(),
  relatedIds: z.array(z.string()).default([]),
  provenance: Provenance,
});

/** ---- children's library --------------------------------------------- */

export const StorySchema = BaseDoc.extend({
  kind: z.literal("story"),
  /** The story itself. Absent until someone has written or transcribed it. */
  body: LocalizedText.optional(),
  ageGroup: z.array(AgeGroup).default([]),
  readingMinutes: z.number().int().positive().optional(),
  /** Narration, when a recording exists and may be published. */
  audio: MediaAsset.optional(),
  /**
   * Where the story came from. A folk tale retold by a named person, a
   * public-domain text, a licensed collection — never "traditional" with no
   * one behind it.
   */
  provenance: Provenance,
});

export const RhymeSchema = BaseDoc.extend({
  kind: z.literal("rhyme"),
  /** Lyrics, in whichever languages they genuinely exist. */
  lyrics: LocalizedText.optional(),
  ageGroup: z.array(AgeGroup).default([]),
  category: z.enum(["telugu", "english", "counting", "festival", "lullaby", "action"]).optional(),
  audio: MediaAsset.optional(),
  video: MediaAsset.optional(),
  provenance: Provenance,
});

export const ScienceTopicSchema = BaseDoc.extend({
  kind: z.literal("science-topic"),
  topic: z.enum(["living-world", "plants", "weather", "space", "materials", "body", "energy", "earth"]),
  ageGroup: z.array(AgeGroup).default([]),
  explanation: LocalizedText.optional(),
  /** A thing a child can actually do, with what it needs. */
  activity: z
    .object({
      title: LocalizedText,
      materials: z.array(LocalizedText).default([]),
      steps: z.array(LocalizedText).min(1),
      supervision: z.boolean().default(false),
    })
    .optional(),
  video: MediaAsset.optional(),
  /**
   * Who checked it. A science explanation for children that no teacher has
   * read is exactly what `awaiting-teacher-review` exists to hold back.
   */
  reviewedBy: z.string().min(1).nullable().default(null),
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
  story: StorySchema,
  rhyme: RhymeSchema,
  "science-topic": ScienceTopicSchema,
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
  "story",
  "rhyme",
  "science-topic",
  "crop", "agriculture-guide", "government-scheme", "job", "service", "video",
];

export type Course = z.infer<typeof CourseSchema>;
export type Story = z.infer<typeof StorySchema>;
export type Rhyme = z.infer<typeof RhymeSchema>;
export type ScienceTopic = z.infer<typeof ScienceTopicSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Lesson2 = z.infer<typeof LessonSchema>;
export type MediaAssetT = z.infer<typeof MediaAsset>;
export type PublicationStatusT = z.infer<typeof PublicationStatus>;
export type Lesson = z.infer<typeof LessonSchema>;
export type AgricultureGuide = z.infer<typeof AgricultureGuideSchema>;
export type GovernmentScheme = z.infer<typeof GovernmentSchemeSchema>;
export type ContentDoc = z.infer<(typeof ContentSchemas)[ContentKind]>;
