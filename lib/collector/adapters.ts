/**
 * Source adapters: how the collector turns one fetched page into candidates.
 *
 * §3 asks for RSS, official APIs, sitemaps and permitted public indexes
 * "whenever available". The honest finding from vetting the registry is that
 * almost none are available: one working RSS feed (ICAR), one usable sitemap
 * (DIKSHA), one keyed API (data.gov.in), and everything else is an HTML index
 * page. So the HTML adapter carries most of the weight and is written to be
 * conservative — it extracts links and their visible text and nothing more.
 *
 * Parsing is done with scoped regex rather than a DOM library. That is a
 * deliberate trade: these are machine-generated feeds and simple ASP.NET
 * listing pages, the shapes are stable, and it keeps the collector free of a
 * parser dependency in a workflow that already installs the whole site.
 *
 * Node-only (types are shared with the pipeline).
 */

export type Candidate = {
  /** Absolute URL of the thing itself. */
  url: string;
  /** Visible link text or feed title. The most trustworthy title we get. */
  linkText?: string;
  /** Feed description or nearby text. */
  description?: string;
  /** ISO date the source says it was published or updated. */
  date?: string;
  /** What the URL looks like, before download confirms it. */
  looksLike: "pdf" | "video" | "page";
};

/** Decode the five XML entities plus numeric references. */
export function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&"); // last, so &amp;lt; does not become <
}

export function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function tagContent(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return undefined;
  let inner = m[1] ?? "";
  const cdata = inner.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  if (cdata) inner = cdata[1] ?? "";
  const text = decodeEntities(inner).replace(/\s+/g, " ").trim();
  return text || undefined;
}

/** Normalise the date formats these feeds use into an ISO calendar day. */
export function toIsoDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  const isoMatch = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const parsed = Date.parse(t);
  if (Number.isFinite(parsed)) {
    const d = new Date(parsed);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }
  return undefined;
}

export function looksLikeUrl(url: string): Candidate["looksLike"] {
  const path = url.split("?")[0]!.toLowerCase();
  if (path.endsWith(".pdf")) return "pdf";
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return "video";
  if (/\.(mp4|webm|m4v)$/.test(path)) return "video";
  return "page";
}

function absolute(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

/** ------------------------------------------------------------------- RSS */

export function parseRss(xml: string, baseUrl: string, limit = 100): Candidate[] {
  const out: Candidate[] = [];
  // RSS <item> and Atom <entry> in one pass.
  const blocks = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  for (const block of blocks.slice(0, limit)) {
    let link = tagContent(block, "link");
    if (!link) {
      // Atom puts the URL in an attribute.
      const href = block.match(/<link[^>]*\bhref=["']([^"']+)["']/i);
      link = href?.[1];
    }
    if (!link) continue;
    const url = absolute(link, baseUrl);
    if (!url) continue;
    const title = tagContent(block, "title");
    const description =
      tagContent(block, "description") ?? tagContent(block, "summary") ?? tagContent(block, "content");
    const date = toIsoDate(
      tagContent(block, "pubDate") ??
        tagContent(block, "updated") ??
        tagContent(block, "published") ??
        tagContent(block, "dc:date"),
    );
    // An <enclosure> is how a feed points at the actual PDF rather than a
    // landing page, and is preferred when present.
    const enclosure = block.match(/<enclosure[^>]*\burl=["']([^"']+)["'][^>]*>/i);
    const enclosureUrl = enclosure ? absolute(enclosure[1]!, baseUrl) : null;
    const finalUrl = enclosureUrl && looksLikeUrl(enclosureUrl) === "pdf" ? enclosureUrl : url;
    out.push({
      url: finalUrl,
      linkText: title,
      description: description ? stripTags(description).slice(0, 1200) : undefined,
      date,
      looksLike: looksLikeUrl(finalUrl),
    });
  }
  return out;
}

/** --------------------------------------------------------------- sitemap */

export type SitemapEntry = { url: string; lastmod?: string };

export function parseSitemap(xml: string, limit = 5000): { entries: SitemapEntry[]; children: string[] } {
  const entries: SitemapEntry[] = [];
  const children: string[] = [];

  // <sitemapindex> points at more sitemaps; <urlset> holds pages.
  const isIndex = /<sitemapindex/i.test(xml);
  const blocks = xml.match(/<(?:url|sitemap)(?:\s[^>]*)?>[\s\S]*?<\/(?:url|sitemap)>/gi) ?? [];
  for (const block of blocks.slice(0, limit)) {
    const loc = tagContent(block, "loc");
    if (!loc) continue;
    if (isIndex) {
      children.push(loc);
    } else {
      entries.push({ url: loc, lastmod: toIsoDate(tagContent(block, "lastmod")) });
    }
  }
  return { entries, children };
}

export function sitemapCandidates(entries: SitemapEntry[]): Candidate[] {
  return entries.map((e) => ({
    url: e.url,
    date: e.lastmod,
    looksLike: looksLikeUrl(e.url),
  }));
}

/** ------------------------------------------------------------ HTML index */

export type Anchor = { href: string; text: string; rowText?: string };

/**
 * Every anchor on a page, with its visible text and the text of its
 * surrounding table row.
 *
 * The row matters on these sites: an ASP.NET listing renders the document
 * name in one cell and its date in the next, so the date a resource needs is
 * beside the link rather than inside it.
 */
export function extractAnchors(html: string, baseUrl: string): Anchor[] {
  const anchors: Anchor[] = [];
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const rowOf = new Map<string, string>();
  for (const row of rows) {
    const text = stripTags(row);
    for (const m of row.matchAll(/<a\s[^>]*href=["']([^"']+)["']/gi)) {
      const abs = absolute(m[1]!, baseUrl);
      if (abs && !rowOf.has(abs)) rowOf.set(abs, text.slice(0, 400));
    }
  }

  const seen = new Set<string>();
  for (const m of html.matchAll(/<a\s([^>]*?)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1] ?? "";
    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const abs = absolute(hrefMatch[1]!, baseUrl);
    if (!abs || seen.has(abs)) continue;
    seen.add(abs);
    let text = stripTags(m[2] ?? "");
    if (!text) {
      // An image link carries its label in alt or title.
      const alt = attrs.match(/\b(?:title|aria-label)=["']([^"']+)["']/i);
      const imgAlt = (m[2] ?? "").match(/\balt=["']([^"']+)["']/i);
      text = decodeEntities(alt?.[1] ?? imgAlt?.[1] ?? "").trim();
    }
    anchors.push({ href: abs, text, rowText: rowOf.get(abs) });
  }
  return anchors;
}

/**
 * Turn an index page into candidates.
 *
 * Only same-site links are followed, and only documents and pages that look
 * like content — never a login, a search form, or a social link. `sameHostOnly`
 * exists because these portals link out to unrelated government sites
 * constantly, and following those would be crawling something nobody approved.
 */
export function htmlIndexCandidates(
  html: string,
  pageUrl: string,
  opts: { allowedHost?: string; pdfOnly?: boolean; limit?: number } = {},
): Candidate[] {
  const limit = opts.limit ?? 200;
  const host = opts.allowedHost ?? new URL(pageUrl).hostname;
  const out: Candidate[] = [];

  const SKIP = /\/(login|signin|signup|register|logout|search|feedback|contact|sitemap|rss|print)\b/i;
  const SOCIAL = /(facebook|twitter|x\.com|instagram|youtube\.com\/(?:user|channel|c)\/|linkedin|whatsapp|t\.me)/i;

  for (const a of extractAnchors(html, pageUrl)) {
    if (out.length >= limit) break;
    let u: URL;
    try {
      u = new URL(a.href);
    } catch {
      continue;
    }
    const kind = looksLikeUrl(a.href);
    // Registered YouTube videos are wanted even though they are off-host —
    // unless the caller asked for documents only, in which case a video is
    // just as much "not a PDF" as a landing page is.
    if (!opts.pdfOnly && kind === "video" && /youtube\.com\/watch|youtu\.be\//.test(a.href)) {
      out.push({ url: a.href, linkText: a.text, description: a.rowText, looksLike: "video" });
      continue;
    }
    // A subdomain of the same registrable domain is the same publisher
    // (bse.ap.gov.in and portal-psc.ap.gov.in are both AP government hosts).
    const sameSite = u.hostname === host || u.hostname.endsWith(`.${host}`) || host.endsWith(`.${u.hostname}`);
    if (!sameSite) continue;
    if (SOCIAL.test(a.href)) continue;
    if (SKIP.test(u.pathname)) continue;
    if (opts.pdfOnly && kind !== "pdf") continue;

    // A date sitting beside the link in its row, e.g. "Notification 03-02-2026".
    const beside = a.rowText ?? "";
    const dateMatch = beside.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
    const date =
      dateMatch && Number(dateMatch[3]) >= 2000 && Number(dateMatch[3]) <= 2100
        ? `${dateMatch[3]}-${String(dateMatch[2]).padStart(2, "0")}-${String(dateMatch[1]).padStart(2, "0")}`
        : undefined;

    out.push({
      url: a.href,
      linkText: a.text || undefined,
      description: a.rowText,
      date,
      looksLike: kind,
    });
  }
  return out;
}

/** ---------------------------------------------------------------- YouTube */

export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (/(?:^|\.)youtube\.com$/.test(u.hostname)) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const embed = u.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{6,})/);
      if (embed) return embed[1]!;
    }
  } catch {
    return null;
  }
  return null;
}

/** A channel's uploads as an Atom feed — the one documented, key-free,
 *  terms-clean way to see a YouTube channel's new videos. */
export function youtubeChannelFeed(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

export type OEmbed = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

/**
 * oEmbed is also the availability check §6 needs: YouTube answers 401/404 for
 * a video that has been removed or made private, which is exactly the signal
 * for marking it unavailable and hiding the player.
 */
export function youtubeOEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
}

/** ------------------------------------------------------------------- API */

/**
 * data.gov.in resource listing. Requires a key; never called without one.
 * Returns raw records, which the pipeline maps into dataset resources.
 */
export function dataGovInUrl(resourceId: string, apiKey: string, limit = 20): string {
  const u = new URL(`https://api.data.gov.in/resource/${encodeURIComponent(resourceId)}`);
  u.searchParams.set("api-key", apiKey);
  u.searchParams.set("format", "json");
  u.searchParams.set("limit", String(limit));
  return u.toString();
}
