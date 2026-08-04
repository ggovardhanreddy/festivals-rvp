export type MediaType = "image" | "video" | "audio" | "document";

export type FestivalKey =
  | "sankranthi"
  | "vinayaka-chavithi"
  | "mathamma-jathara"
  | "devapatlamma-jathara"
  | "sri-rama-navami"
  | "varalakshmi-vratam"
  | "ugadi"
  | "deepavali"
  | "dasara";

export type BucketKey =
  | FestivalKey
  | "rvp-birthdays"
  | "fun-trips";

/** Member circles: Legacy Circle · Core · Next Generation · Former */
export type MemberGroup = "legacy" | "core" | "nextgen" | "former";

export type MemberSocialLink = {
  label: string;
  href: string;
};

/** Public directory lifecycle for a community member */
export type MemberStatus = "Active" | "In Loving Memory" | "Archived";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type Member = {
  id: string;
  name: string;
  photo: string | null;
  /** Month-day as MM-DD, full ISO YYYY-MM-DD, or null when unknown */
  dob: string | null;
  /** Community category (Legacy Circle / Core / Next Generation) */
  group: MemberGroup;
  designation?: string;
  /** Four-digit birth year — optional */
  birthYear?: number | null;
  /** Optional year the member joined the community */
  joinYear?: number | null;
  /** Memorial recognition — In Loving Memory */
  memorial?: boolean;
  status?: MemberStatus | string;
  archived?: boolean;
  achievements?: string[];
  social?: MemberSocialLink[];
  /** Informal / preferred name shown in directory */
  nickname?: string;
  profession?: string;
  company?: string;
  bio?: string;
  phone?: string;
  email?: string;
  bloodGroup?: BloodGroup | string;
  /** Manual sort within category (lower first) */
  displayOrder?: number;
};

export type MemberAuditEntry = {
  id: string;
  ts: number;
  adminName: string;
  memberId: string;
  memberName?: string;
  action: "update" | "create" | "archive" | "reorder" | "import" | "photo";
  fields: string[];
  before?: Partial<Member> | null;
  after?: Partial<Member> | null;
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

export type DevelopmentStatus =
  | "proposed"
  | "planning"
  | "critical-decision"
  | "fundraising"
  | "under-construction"
  | "ongoing"
  | "completed";

export type DevelopmentWorkflowStage =
  | "planning"
  | "community-discussion"
  | "fundraising"
  | "approval"
  | "construction"
  | "completion";

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
  stages?: DevelopmentWorkflowStage[];
  currentStage?: DevelopmentWorkflowStage;
  highlight?: boolean;
  summary?: string;
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

/** Site roles for permission checks */
export type SiteRole = "guest" | "member" | "admin";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type DirectoryCategory =
  | "Doctors"
  | "Teachers"
  | "Government Employees"
  | "Other Professionals";

export type DirectoryEntry = {
  id: string;
  name: string;
  category: DirectoryCategory;
  profession: string;
  designation?: string;
  photo?: string | null;
  phone?: string;
  email?: string;
  availability?: string;
  updatedAt?: string;
};

export type LostFoundCategory =
  | "Lost Documents"
  | "Lost Mobile Phones"
  | "Lost Keys"
  | "Lost Wallets"
  | "Found Items"
  | "Missing Livestock"
  | "Other Community Notices";

export type LostFoundItem = {
  id: string;
  title: string;
  description: string;
  category: LostFoundCategory;
  date: string;
  location: string;
  image?: string | null;
  contact: string;
  status: ApprovalStatus;
  submittedAt: string;
  submittedBy?: string;
};

export type PanchayatDocCategory =
  | "Panchayat Notices"
  | "Meeting Minutes"
  | "Development Plans"
  | "Government Schemes"
  | "Public Forms"
  | "Circulars"
  | "Announcements";

export type PanchayatDocument = {
  id: string;
  title: string;
  description?: string;
  category: PanchayatDocCategory;
  date: string;
  fileKey: string;
  mime?: string;
  updatedAt?: string;
};

export type HeritageCategory =
  | "Historical Photographs"
  | "Temple History"
  | "Village History"
  | "Cultural Traditions"
  | "Oral Histories"
  | "Festival Memories"
  | "Old Documents"
  | "Audio Recordings"
  | "Videos";

export type HeritageItem = {
  id: string;
  title: string;
  description: string;
  category: HeritageCategory;
  date?: string;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | "audio" | "document";
  status: ApprovalStatus;
  submittedAt: string;
  submittedBy?: string;
  submittedName?: string;
};

export type SiteSettings = {
  watermarkEnabled: boolean;
  watermarkText: string;
  allowPublicMediaDownload: boolean;
  /** Hide phone/email on directory cards unless explicitly set public */
  hideDirectoryContactsByDefault?: boolean;
  /** Require consent before publishing personal contact data */
  requireConsentForPersonalData?: boolean;
  /** Soft maintenance banner / lock for public writes */
  maintenanceMode?: boolean;
};

export type AnalyticsHit = {
  path: string;
  ts: number;
  device?: string;
  browser?: string;
  referrer?: string;
  kind?: "pageview" | "notif-click" | "search" | "upload";
  meta?: string;
};
