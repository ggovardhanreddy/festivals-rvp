export type MediaType = "image" | "video" | "audio" | "document";

export type FestivalKey =
  | "sankranthi"
  | "vinayaka-chavithi"
  | "mathamma-jathara"
  | "devapatlamma-jathara"
  | "sri-rama-navami";

export type BucketKey =
  | "sankranthi"
  | "vinayaka-chavithi"
  | "mathamma-jathara"
  | "devapatlamma-jathara"
  | "sri-rama-navami"
  | "rvp-birthdays"
  | "fun-trips";

/** Member circles: Legacy (≥40) · Core (28–39) · NextGen (<28) */
export type MemberGroup = "legacy" | "core" | "nextgen";

export type Member = {
  id: string;
  name: string;
  photo: string | null;
  /** Month-day as MM-DD, full ISO YYYY-MM-DD, or null when unknown */
  dob: string | null;
  /**
   * Manual category when age cannot be computed.
   * When birthYear / full DOB is present, display group is derived from age.
   */
  group: MemberGroup;
  designation?: string;
  /** Four-digit birth year — enables automatic age-based categorization */
  birthYear?: number | null;
  /** Optional year the member joined the community */
  joinYear?: number | null;
};

export type SiteEventCategory = "festival" | "village" | "birthday" | "other";

export type SiteEvent = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  image?: string;
  description: string;
  category: SiteEventCategory;
  slug?: string;
  reminderDaysBefore?: number;
  recurring?: boolean;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  important?: boolean;
};

export type Media = {
  id: string;
  file: string;
  thumb: string;
  type: MediaType;
  title: string;
  date: string;
  tags: string[];
  favorite?: boolean;
  width?: number;
  height?: number;
  note?: string;
  blurDataURL?: string;
  sha256?: string;
  phash?: string;
  /** Optional AVIF companion for images */
  fileAvif?: string;
  /** Original CMS path served for download when useful */
  original?: string;
  /** Video poster image */
  poster?: string;
  mime?: string;
  duration?: number;
};

export type Album = {
  year: string;
  category: "Festivals" | "Birthdays" | "Trips";
  slug: string;
  title: string;
  description: string;
  story?: string;
  notes?: string[];
  cover?: string;
  published: boolean;
  order: number;
  media: Media[];
  bucket?: BucketKey;
  festival?: FestivalKey;
  personName?: string;
  birthdayDate?: string;
};

export type MediaWithAlbum = Media & { album: Album };

export type DevelopmentStatus = "planned" | "ongoing" | "completed" | "paused";

export type DevelopmentMilestone = {
  date: string;
  title: string;
  description?: string;
};

export type Development = {
  id: string;
  title: string;
  description: string;
  status: DevelopmentStatus;
  startDate: string;
  endDate?: string;
  progress: number;
  images?: string[];
  milestones?: DevelopmentMilestone[];
};

export type SuggestionCategory =
  | "General"
  | "Village Development"
  | "Events"
  | "Temple"
  | "Infrastructure"
  | "Water"
  | "Agriculture"
  | "Other";

export type SuggestionStatus = "draft" | "approved" | "archived";

export type Suggestion = {
  id: string;
  name?: string;
  mobile?: string;
  subject: string;
  suggestion: string;
  category: SuggestionCategory;
  status: SuggestionStatus;
  submittedAt: string;
  submittedBy?: string;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  imageDataUrl?: string;
  createdAt: number;
  editedAt?: number;
  replyToId?: string;
  deleted?: boolean;
};
