/**
 * The official resource directory, assembled.
 *
 * One flat list plus a few views over it. Hubs, search and the validator all
 * read from here, so a new entry appears everywhere at once and can never be
 * live on a hub while being invisible to search.
 */
import { CENTRAL } from "./central";
import { ANDHRA } from "./ap";
import { STUDENTS } from "./students";
import { FARMERS } from "./farmers";
import { BANKING, ALL_BANKS, PUBLIC_BANKS, PRIVATE_BANKS, PAYMENTS_AND_FINANCE } from "./banking";
import type { Audience, DirectoryCategory, DirectoryEntry } from "./types";

export * from "./types";
export { CENTRAL, ANDHRA, STUDENTS, FARMERS, BANKING };
export { ALL_BANKS, PUBLIC_BANKS, PRIVATE_BANKS, PAYMENTS_AND_FINANCE };
export { HELPLINES } from "./emergency";

export const DIRECTORY: DirectoryEntry[] = [
  ...CENTRAL,
  ...ANDHRA,
  ...STUDENTS,
  ...FARMERS,
  ...BANKING,
];

export function byCategory(category: DirectoryCategory): DirectoryEntry[] {
  return DIRECTORY.filter((e) => e.category === category);
}

export function byAudience(audience: Audience): DirectoryEntry[] {
  return DIRECTORY.filter((e) => e.audience.includes(audience));
}

export function byId(id: string): DirectoryEntry | undefined {
  return DIRECTORY.find((e) => e.id === id);
}

export function byIds(ids: string[]): DirectoryEntry[] {
  return ids.map(byId).filter(Boolean) as DirectoryEntry[];
}

/**
 * Hub definitions: which entries appear where, in what order.
 *
 * Curated rather than generated, because "what a farmer needs first" is a
 * judgement about people, not a property of the data.
 */
export type HubGroup = { titleKey: string; ids?: string[]; category?: DirectoryCategory };

export type HubDef = {
  slug: string;
  titleKey: string;
  ledeKey: string;
  icon: string;
  groups: HubGroup[];
};

export const HUBS: HubDef[] = [
  {
    slug: "government",
    titleKey: "gov.title",
    ledeKey: "gov.lede",
    icon: "government",
    groups: [
      { titleKey: "gov.group.start", ids: ["gsws", "meeseva", "services-india", "umang", "india-gov"] },
      { titleKey: "gov.group.documents", ids: ["digilocker", "uidai", "incometax", "voters", "passport", "parivahan"] },
      { titleKey: "gov.group.land", ids: ["meebhoomi"] },
      { titleKey: "gov.group.welfare", ids: ["nrega-central", "epfo", "jeevan-pramaan", "pmay"] },
      { titleKey: "gov.group.health", ids: ["ayushman", "esanjeevani"] },
      { titleKey: "gov.group.legal", ids: ["cybercrime", "cpgrams", "consumer-helpline", "rti", "ecourts", "nalsa"] },
      { titleKey: "gov.group.business", ids: ["udyam", "gst"] },
      { titleKey: "gov.group.other", ids: ["indiapost", "sanchar-saathi", "ap-gov", "kadapa"] },
      // Picked up when the /students/ and /farmers/ hubs were retired in the
      // 2026 redesign. These are official citizen services, which §16 keeps —
      // it is only the education and agriculture *sections* that went.
      { titleKey: "gov.group.other", ids: ["nsp", "jnanabhumi", "apaar", "pmkisan", "pmfby", "soilhealth", "enam", "e-panta"] },
    ],
  },
  {
    slug: "documents",
    titleKey: "docs.title",
    ledeKey: "docs.lede",
    icon: "book",
    groups: [
      { titleKey: "docs.group.digilocker", ids: ["digilocker"] },
      { titleKey: "docs.group.identity", ids: ["uidai", "incometax", "voters", "passport", "parivahan"] },
      { titleKey: "docs.group.certificates", ids: ["meeseva", "gsws"] },
      { titleKey: "docs.group.education", ids: ["apaar", "nsp", "jnanabhumi"] },
      { titleKey: "docs.group.land", ids: ["meebhoomi", "e-panta"] },
    ],
  },
  {
    slug: "banking",
    titleKey: "banking.title",
    ledeKey: "banking.lede",
    icon: "banking",
    groups: [
      { titleKey: "banking.group.payments", ids: ["npci", "bhim", "jandhan"] },
      { titleKey: "banking.group.public" },
      { titleKey: "banking.group.private" },
      { titleKey: "banking.group.finance", ids: ["rbi", "nps", "irdai", "epfo", "jeevan-pramaan", "incometax"] },
    ],
  },
];

export function hubBySlug(slug: string): HubDef | undefined {
  return HUBS.find((h) => h.slug === slug);
}
