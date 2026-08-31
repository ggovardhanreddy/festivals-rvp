/**
 * robots.txt parsing and caching.
 *
 * §17 requires respecting robots.txt "where applicable". This module treats it
 * as always applicable, and treats an UNREADABLE robots.txt as permissive
 * rather than forbidding — which is the standard reading, and matters here
 * because several AP government hosts time out on /robots.txt while serving
 * their content pages perfectly well. A missing file is genuinely "no rules";
 * a 5xx or a timeout is ambiguous, and refusing to fetch anything from a
 * flaky host would silently disable half the registry.
 *
 * What is NOT tolerated: a robots.txt that loads and says Disallow. That is an
 * explicit instruction and the collector obeys it, marking the source skipped
 * with reason "robots-disallowed" so the admin sees why nothing arrived.
 *
 * Node-only (uses fetch and a module-level cache). Never imported by a page.
 */

export type RobotsRules = {
  /** Path prefixes disallowed for our user-agent. */
  disallow: string[];
  /** Path prefixes explicitly allowed, which override a broader disallow. */
  allow: string[];
  /** Seconds the host asked us to wait between requests, if stated. */
  crawlDelay?: number;
  sitemaps: string[];
  /** True when the file could not be read at all. */
  unavailable: boolean;
};

const EMPTY: RobotsRules = { disallow: [], allow: [], sitemaps: [], unavailable: true };

const cache = new Map<string, RobotsRules>();

/**
 * Parse robots.txt for one user-agent.
 *
 * Group selection follows the spec: the most specific matching User-agent
 * group wins, falling back to `*`. Only that group's rules apply — merging
 * every group is a common bug that makes a file look more restrictive than
 * the host intended.
 */
export function parseRobots(text: string, userAgent: string): RobotsRules {
  const ua = userAgent.toLowerCase();
  const groups: Array<{ agents: string[]; lines: Array<[string, string]> }> = [];
  let current: { agents: string[]; lines: Array<[string, string]> } | null = null;
  let lastWasAgent = false;
  const sitemaps: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }
    if (field === "user-agent") {
      // Consecutive User-agent lines share one group of rules.
      if (!current || !lastWasAgent) {
        current = { agents: [], lines: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (current) current.lines.push([field, value]);
  }

  // Most specific match: the longest agent token that is a substring of ours.
  let chosen: { agents: string[]; lines: Array<[string, string]> } | undefined;
  let chosenLength = -1;
  for (const g of groups) {
    for (const agent of g.agents) {
      if (agent === "*") {
        if (chosenLength < 0) {
          chosen = g;
          chosenLength = 0;
        }
      } else if (ua.includes(agent) && agent.length > chosenLength) {
        chosen = g;
        chosenLength = agent.length;
      }
    }
  }

  const rules: RobotsRules = { disallow: [], allow: [], sitemaps, unavailable: false };
  if (!chosen) return rules;
  for (const [field, value] of chosen.lines) {
    if (field === "disallow") {
      // "Disallow:" with an empty value means allow everything. Pushing "" here
      // would match every path and lock us out of a host that just told us we
      // are welcome — this is exactly the case for bie.ap.gov.in.
      if (value) rules.disallow.push(value);
    } else if (field === "allow") {
      if (value) rules.allow.push(value);
    } else if (field === "crawl-delay") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) rules.crawlDelay = n;
    }
  }
  return rules;
}

/** Does a rule pattern (which may use * and $) match this path? */
function patternMatches(pattern: string, path: string): boolean {
  if (!pattern.includes("*") && !pattern.endsWith("$")) {
    return path.startsWith(pattern);
  }
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`).test(path);
}

export function isAllowed(rules: RobotsRules, url: string): boolean {
  if (rules.unavailable) return true;
  let path: string;
  try {
    const u = new URL(url);
    path = u.pathname + (u.search || "");
  } catch {
    return false;
  }
  // Longest match wins, and Allow beats Disallow at equal length — the
  // behaviour Google documents and the reason `Allow: /wp-admin/admin-ajax.php`
  // works under `Disallow: /wp-admin/`.
  let bestDisallow = -1;
  let bestAllow = -1;
  for (const p of rules.disallow) if (patternMatches(p, path)) bestDisallow = Math.max(bestDisallow, p.length);
  for (const p of rules.allow) if (patternMatches(p, path)) bestAllow = Math.max(bestAllow, p.length);
  if (bestDisallow === -1) return true;
  return bestAllow >= bestDisallow;
}

export async function fetchRobots(
  origin: string,
  userAgent: string,
  timeoutMs = 15000,
): Promise<RobotsRules> {
  const key = `${origin}|${userAgent}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let rules: RobotsRules = EMPTY;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(new URL("/robots.txt", origin), {
      headers: { "user-agent": userAgent, accept: "text/plain" },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    if (res.status === 404 || res.status === 410) {
      // Explicitly no rules. Distinct from unreadable: we know the answer.
      rules = { disallow: [], allow: [], sitemaps: [], unavailable: false };
    } else if (res.ok) {
      const text = await res.text();
      // A host that serves its SPA shell for /robots.txt has no robots.txt.
      // ncs.gov.in does exactly this, and parsing HTML as rules would be junk.
      rules = /<html|<!doctype/i.test(text.slice(0, 200))
        ? { disallow: [], allow: [], sitemaps: [], unavailable: false }
        : parseRobots(text, userAgent);
    }
  } catch {
    rules = EMPTY;
  }
  cache.set(key, rules);
  return rules;
}

export function clearRobotsCache(): void {
  cache.clear();
}
