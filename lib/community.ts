import type {
  ApprovalStatus,
  BloodDonor,
  BloodGroup,
  DirectoryCategory,
  DirectoryEntry,
  HeritageCategory,
  HeritageItem,
  LostFoundCategory,
  LostFoundItem,
  PanchayatDocCategory,
  PanchayatDocument,
  SiteSettings,
} from "./types";
import directorySeed from "@/content/data/directory.json";
import lostFoundSeed from "@/content/data/lost-found.json";
import bloodDonorsSeed from "@/content/data/blood-donors.json";
import panchayatDocsSeed from "@/content/data/panchayat-docs.json";
import heritageSeed from "@/content/data/heritage.json";
import siteSettingsSeed from "@/content/data/site-settings.json";

export const COMMUNITY_COLLECTIONS = [
  "directory",
  "members",
  "lost-found",
  "blood-donors",
  "panchayat-docs",
  "heritage",
  "site-settings",
  "analytics",
] as const;

export type CommunityCollection = (typeof COMMUNITY_COLLECTIONS)[number];

export const DIRECTORY_CATEGORIES: DirectoryCategory[] = [
  "Doctors",
  "Teachers",
  "Government Employees",
  "Other Professionals",
];

export const LOST_FOUND_CATEGORIES: LostFoundCategory[] = [
  "Lost Documents",
  "Lost Mobile Phones",
  "Lost Keys",
  "Lost Wallets",
  "Found Items",
  "Missing Livestock",
  "Other Community Notices",
];

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export const PANCHAYAT_DOC_CATEGORIES: PanchayatDocCategory[] = [
  "Panchayat Notices",
  "Meeting Minutes",
  "Development Plans",
  "Government Schemes",
  "Public Forms",
  "Circulars",
  "Announcements",
];

export const HERITAGE_CATEGORIES: HeritageCategory[] = [
  "Historical Photographs",
  "Temple History",
  "Village History",
  "Cultural Traditions",
  "Oral Histories",
  "Festival Memories",
  "Old Documents",
  "Audio Recordings",
  "Videos",
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  watermarkEnabled: true,
  watermarkText: "Reddivaripalli Village",
  allowPublicMediaDownload: false,
  hideDirectoryContactsByDefault: true,
  requireConsentForPersonalData: true,
  maintenanceMode: false,
};

export function loadDirectorySeed(): DirectoryEntry[] {
  return directorySeed as DirectoryEntry[];
}

export function loadLostFoundSeed(): LostFoundItem[] {
  return lostFoundSeed as LostFoundItem[];
}

export function loadBloodDonorsSeed(): BloodDonor[] {
  return bloodDonorsSeed as BloodDonor[];
}

export function loadPanchayatDocsSeed(): PanchayatDocument[] {
  return panchayatDocsSeed as PanchayatDocument[];
}

export function loadHeritageSeed(): HeritageItem[] {
  return heritageSeed as HeritageItem[];
}

export function loadSiteSettingsSeed(): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(siteSettingsSeed as SiteSettings),
  };
}

export function isApproved(status?: ApprovalStatus) {
  return status === "approved" || status === undefined;
}

export function newCommunityId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
