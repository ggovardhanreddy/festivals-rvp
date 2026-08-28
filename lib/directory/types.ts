/**
 * Official resource directory — types and the domain allowlist.
 *
 * Reddivaripalli is an independent community platform. Everything in this
 * directory belongs to somebody else: a ministry, a state department, a bank.
 * The directory's whole job is to get a villager to the *correct official
 * address* on the first try, because the alternative — a search-engine result
 * page full of look-alike "apply here" sites — is how people lose money.
 *
 * Three rules the type system and the validator enforce together:
 *
 *  1. `officialUrl` must be on an allowlisted domain. A URL that is not
 *     .gov.in / .nic.in / .bank.in, or on the short explicit host list below,
 *     fails `npm run government:validate` and the build stops.
 *  2. Provenance is mandatory. `source`, `sourceUrl` and `lastVerified` say
 *     where we got the address and when we last confirmed it.
 *  3. Anything the official source does not state — eligibility, fees,
 *     deadlines, benefits — is simply absent. The UI then says "see the
 *     official website", which is true, instead of inventing an answer.
 */
export type DirectoryCategory =
  | "identity"
  | "certificates"
  | "students"
  | "farmers"
  | "land"
  | "jobs"
  | "health"
  | "welfare"
  | "money"
  | "banking"
  | "payments"
  | "insurance"
  | "pension"
  | "transport"
  | "travel"
  | "housing"
  | "legal"
  | "telecom"
  | "post"
  | "business"
  | "utilities"
  | "emergency"
  | "safety"
  | "aggregator";

export type Audience =
  | "everyone"
  | "students"
  | "farmers"
  | "jobseekers"
  | "seniors"
  | "women"
  | "children"
  | "business";

export type GovLevel = "central" | "state" | "bank" | "regulator";

export type Provenance = {
  /** Human name of where the URL came from. */
  source: string;
  /** The page that lists or publishes the official URL. */
  sourceUrl: string;
  /** ISO date the URL was last confirmed. */
  lastVerified: string;
};

export type DirectoryEntry = {
  id: string;
  name: string;
  /** Telugu name. Required for anything on a hub's featured list. */
  nameTe?: string;
  description: string;
  descriptionTe?: string;
  category: DirectoryCategory;
  audience: Audience[];
  level: GovLevel;
  /** The department, ministry or institution that runs it. */
  department: string;
  officialUrl: string;
  /** Hostname, shown to the visitor before they leave. */
  officialDomain: string;
  /** Extra official entry points, e.g. a bank's net-banking login. */
  links?: { labelKey: string; url: string }[];
  /** Search terms people actually type, in either script. */
  keywords?: string[];
} & Provenance;

/**
 * Exact hosts allowed outside the .gov.in / .nic.in / .bank.in namespaces.
 * Every one is an official institution with a non-.gov.in address; each is
 * listed here deliberately rather than by a loose pattern.
 */
export const ALLOWED_HOSTS = new Set([
  "www.nta.ac.in",
  "nta.ac.in",
  "nptel.ac.in",
  "www.npci.org.in",
  "npci.org.in",
  "www.bhimupi.org.in",
  "bhimupi.org.in",
  "www.nabard.org",
  "nabard.org",
  "licindia.in",
  "www.licindia.in",
  "irdai.gov.in",
  "www.irctc.co.in",
  "irctc.co.in",
  "www.apsrtconline.in",
  "apsrtconline.in",
  // AICTE's own site is aicte-india.org — confirmed from the site header,
  // "Government of India, All India Council for Technical Education".
  "www.aicte-india.org",
  "aicte-india.org",
  // National Digital Library, operated by IIT Kharagpur.
  "ndl.iitkgp.ac.in",
  // Reserve Bank of India. Its bank-links page is the source for every bank
  // URL in lib/directory/banking.ts, so it has to be reachable itself.
  "www.rbi.org.in",
  "rbi.org.in",
  // PFRDA — named as the official pension regulator website by india.gov.in.
  "www.pfrda.org.in",
  "pfrda.org.in",
]);

const ALLOWED_SUFFIXES = [".gov.in", ".nic.in", ".bank.in"];

export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True only for an address we are willing to send a villager to. */
export function isAllowedUrl(url: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  if (ALLOWED_HOSTS.has(host)) return true;
  return ALLOWED_SUFFIXES.some((s) => host === s.slice(1) || host.endsWith(s));
}

/** Fills officialDomain from officialUrl so the two can never disagree. */
export function entry(e: Omit<DirectoryEntry, "officialDomain">): DirectoryEntry {
  return { ...e, officialDomain: hostOf(e.officialUrl) ?? "" };
}
