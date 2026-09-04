/**
 * Shared service-nav helpers.
 *
 * Homepage "doors" and the Village Services hub were removed. What remains is
 * the live-route check used by More, and the popular searches under site search.
 */
import { findRoute } from "@/lib/routes/registry";

/** True when the destination is a live route rather than a reserved one. */
export function isReady(href: string): boolean {
  return findRoute(href)?.status === "live";
}

/** Popular searches shown under the hero. Only terms that return results. */
export const POPULAR_SEARCHES = [
  { key: "popular.sankranthi", query: "Sankranthi" },
  { key: "popular.members", query: "People" },
  { key: "popular.ramalayam", query: "Ramalayam" },
  { key: "popular.ugadi", query: "Ugadi" },
  { key: "popular.gallery", query: "Gallery" },
] as const;
