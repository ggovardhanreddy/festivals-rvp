import { describe, expect, it } from "vitest";
import { isAllowed, parseRobots } from "@/lib/collector/robots";
import {
  decodeEntities,
  extractAnchors,
  htmlIndexCandidates,
  looksLikeUrl,
  parseRss,
  parseSitemap,
  stripTags,
  toIsoDate,
  youtubeVideoId,
} from "@/lib/collector/adapters";
import {
  isEncryptedPdf,
  safeFileKey,
  screenPdfContent,
  sha256,
  sniffKind,
  validateDownload,
} from "@/lib/collector/security";
import { parsePdfDate, bestTitle, usableTitle } from "@/lib/collector/pdf";
import { archiveExpired, decideStatus, isDue, mergeResources } from "@/lib/collector/pipeline";
import { normalizeSource } from "@/lib/collector/store";
import type { Resource, ResourceFlag, Source } from "@/lib/resources/types";
import { emptyHealth } from "@/lib/resources/types";

const UA = "ReddivaripalliLearningBot/1.0 (+https://www.reddivaripalli.com/learn/)";

function src(over: Partial<Source> = {}): Source {
  return normalizeSource({
    id: "s",
    name: "Source",
    url: "https://example.gov.in/",
    licenseStatus: "no",
    licenseNote: "n/a",
    method: "html-index",
    active: true,
    frequency: "daily",
    autoPublish: false,
    categories: ["gita"],
    type: "state-education",
    ...over,
  });
}

function res(over: Partial<Resource> = {}): Resource {
  return {
    id: "x",
    title: "t",
    description: "",
    category: "gita",
    language: "en",
    resourceType: "link",
    sourceId: "s",
    sourceUrl: "https://e.gov.in/l",
    originalUrl: "https://e.gov.in/a.pdf",
    collectedDate: "2026-08-01",
    licenseStatus: "no",
    status: "published",
    flags: [],
    tags: [],
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...over,
  };
}

describe("robots.txt", () => {
  it("treats an empty Disallow as permitting everything", () => {
    // This is bie.ap.gov.in verbatim. Reading it as "disallow /" would lock
    // us out of a host that just said we are welcome.
    const rules = parseRobots("User-agent: *\nDisallow:\n", UA);
    expect(rules.disallow).toEqual([]);
    expect(isAllowed(rules, "https://bie.ap.gov.in/modelpapers")).toBe(true);
  });

  it("obeys a real Disallow", () => {
    const rules = parseRobots("User-agent: *\nDisallow: /admin/\nDisallow: /user/login\n", UA);
    expect(isAllowed(rules, "https://e.gov.in/admin/secret")).toBe(false);
    expect(isAllowed(rules, "https://e.gov.in/papers/x.pdf")).toBe(true);
  });

  it("lets a longer Allow override a broader Disallow", () => {
    // NTA's actual file.
    const rules = parseRobots("User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n", UA);
    expect(isAllowed(rules, "https://exams.nta.nic.in/wp-admin/")).toBe(false);
    expect(isAllowed(rules, "https://exams.nta.nic.in/wp-admin/admin-ajax.php")).toBe(true);
  });

  it("parses DIKSHA's file, including the sitemap line", () => {
    const rules = parseRobots(
      [
        "User-agent: *",
        "Disallow: /sunbird_logo.png",
        "Disallow: /igot/",
        "Disallow: https://igot.gov.in/",
        "Sitemap: https://diksha.gov.in/sitemap.xml",
      ].join("\n"),
      UA,
    );
    expect(rules.sitemaps).toEqual(["https://diksha.gov.in/sitemap.xml"]);
    expect(isAllowed(rules, "https://diksha.gov.in/igot/anything")).toBe(false);
    expect(isAllowed(rules, "https://diksha.gov.in/explore")).toBe(true);
  });

  it("uses the most specific matching user-agent group, not a merge of all", () => {
    const text = [
      "User-agent: *",
      "Disallow: /",
      "",
      "User-agent: ReddivaripalliLearningBot",
      "Disallow: /private/",
    ].join("\n");
    const rules = parseRobots(text, UA);
    expect(isAllowed(rules, "https://e.gov.in/papers/")).toBe(true);
    expect(isAllowed(rules, "https://e.gov.in/private/x")).toBe(false);
  });

  it("shares one rule block across consecutive user-agent lines", () => {
    const rules = parseRobots("User-agent: Googlebot\nUser-agent: *\nDisallow: /x/\n", UA);
    expect(isAllowed(rules, "https://e.gov.in/x/y")).toBe(false);
  });

  it("honours wildcards and end-anchors", () => {
    const rules = parseRobots("User-agent: *\nDisallow: /*.doc$\nDisallow: /tmp*/\n", UA);
    expect(isAllowed(rules, "https://e.gov.in/a.doc")).toBe(false);
    expect(isAllowed(rules, "https://e.gov.in/a.docx")).toBe(true);
    expect(isAllowed(rules, "https://e.gov.in/tmp123/x")).toBe(false);
  });

  it("reads Crawl-delay", () => {
    expect(parseRobots("User-agent: *\nCrawl-delay: 10\n", UA).crawlDelay).toBe(10);
  });

  it("ignores comments and blank lines", () => {
    const rules = parseRobots("# hello\n\nUser-agent: *  # all\nDisallow: /a/ # nope\n", UA);
    expect(rules.disallow).toEqual(["/a/"]);
  });

  it("permits everything when robots.txt was unreadable", () => {
    // A timing-out AP host must not disable the whole source.
    expect(isAllowed({ disallow: ["/"], allow: [], sitemaps: [], unavailable: true }, "https://e.gov.in/x")).toBe(true);
  });
});

describe("RSS parsing", () => {
  const feed = `<?xml version="1.0"?>
  <rss version="2.0"><channel><title>ICAR</title>
    <item>
      <title>खेती अगस्त 2026</title>
      <link>https://icar.org.in/node/123</link>
      <description>&lt;p&gt;Monthly farm magazine&lt;/p&gt;</description>
      <pubDate>Tue, 19 Aug 2026 10:00:00 +0530</pubDate>
    </item>
    <item>
      <title><![CDATA[Farmer training at KVK]]></title>
      <link>https://icar.org.in/node/456</link>
      <enclosure url="https://icar.org.in/files/training.pdf" type="application/pdf"/>
      <pubDate>Wed, 25 Mar 2026 09:00:00 +0530</pubDate>
    </item>
  </channel></rss>`;

  it("reads titles, links, descriptions and dates", () => {
    const items = parseRss(feed, "https://icar.org.in/en/rss.xml");
    expect(items).toHaveLength(2);
    expect(items[0]!.linkText).toBe("खेती अगस्त 2026");
    expect(items[0]!.url).toBe("https://icar.org.in/node/123");
    expect(items[0]!.description).toBe("Monthly farm magazine");
    expect(items[0]!.date).toBe("2026-08-19");
  });

  it("prefers a PDF enclosure over the landing page", () => {
    const items = parseRss(feed, "https://icar.org.in/en/rss.xml");
    expect(items[1]!.url).toBe("https://icar.org.in/files/training.pdf");
    expect(items[1]!.looksLike).toBe("pdf");
  });

  it("unwraps CDATA", () => {
    expect(parseRss(feed, "https://icar.org.in/")[1]!.linkText).toBe("Farmer training at KVK");
  });

  it("reads Atom entries with href links", () => {
    const atom = `<feed xmlns="http://www.w3.org/2005/Atom">
      <entry><title>New course</title><link rel="alternate" href="/course/1"/><updated>2026-07-01T00:00:00Z</updated></entry>
    </feed>`;
    const items = parseRss(atom, "https://e.gov.in/feed");
    expect(items[0]!.url).toBe("https://e.gov.in/course/1");
    expect(items[0]!.date).toBe("2026-07-01");
  });

  it("returns nothing for a page that is not a feed", () => {
    expect(parseRss("<html><body>not a feed</body></html>", "https://e.gov.in/")).toEqual([]);
  });
});

describe("sitemap parsing", () => {
  it("reads a urlset with lastmod", () => {
    const xml = `<urlset><url><loc>https://diksha.gov.in/a</loc><lastmod>2026-05-01</lastmod></url>
      <url><loc>https://diksha.gov.in/b.pdf</loc></url></urlset>`;
    const { entries, children } = parseSitemap(xml);
    expect(children).toEqual([]);
    expect(entries).toEqual([
      { url: "https://diksha.gov.in/a", lastmod: "2026-05-01" },
      { url: "https://diksha.gov.in/b.pdf", lastmod: undefined },
    ]);
  });

  it("reads a sitemapindex as children, not as pages", () => {
    const xml = `<sitemapindex><sitemap><loc>https://e.gov.in/s1.xml</loc></sitemap></sitemapindex>`;
    const { entries, children } = parseSitemap(xml);
    expect(entries).toEqual([]);
    expect(children).toEqual(["https://e.gov.in/s1.xml"]);
  });
});

describe("HTML index parsing", () => {
  // The shape of an ASP.NET listing: the name in one cell, the date in the next.
  const html = `<html><body><table>
    <tr><td><a href="/papers/eapcet-2026.pdf">AP EAPCET 2026 Notification</a></td><td>03-02-2026</td></tr>
    <tr><td><a href="Model_Paper_Maths.pdf">Click here</a></td><td>10-01-2026</td></tr>
    <tr><td><a href="https://other-site.com/thing.pdf">Off-site PDF</a></td><td>01-01-2026</td></tr>
    <tr><td><a href="/login">Login</a></td><td></td></tr>
    <tr><td><a href="https://facebook.com/apsche">Facebook</a></td><td></td></tr>
    <tr><td><a href="https://www.youtube.com/watch?v=abc12345678">Guidance video</a></td><td></td></tr>
  </table></body></html>`;
  const page = "https://cets.apsche.ap.gov.in/EAPCET/list.aspx";

  it("finds same-site documents and resolves relative links", () => {
    const found = htmlIndexCandidates(html, page);
    const urls = found.map((c) => c.url);
    expect(urls).toContain("https://cets.apsche.ap.gov.in/papers/eapcet-2026.pdf");
    expect(urls).toContain("https://cets.apsche.ap.gov.in/EAPCET/Model_Paper_Maths.pdf");
  });

  it("picks up the date from the row beside the link", () => {
    const found = htmlIndexCandidates(html, page);
    const eapcet = found.find((c) => c.url.endsWith("eapcet-2026.pdf"))!;
    expect(eapcet.date).toBe("2026-02-03");
  });

  it("refuses off-site links, logins and social links", () => {
    const urls = htmlIndexCandidates(html, page).map((c) => c.url);
    expect(urls.some((u) => u.includes("other-site.com"))).toBe(false);
    expect(urls.some((u) => u.includes("/login"))).toBe(false);
    expect(urls.some((u) => u.includes("facebook"))).toBe(false);
  });

  it("keeps a YouTube video even though it is off-host", () => {
    const found = htmlIndexCandidates(html, page);
    const video = found.find((c) => c.looksLike === "video");
    expect(video?.url).toContain("watch?v=abc12345678");
  });

  it("treats a subdomain of the same government host as same-site", () => {
    const sub = `<a href="https://portal-psc.ap.gov.in/n/1.pdf">Notification</a>`;
    const found = htmlIndexCandidates(sub, "https://psc.ap.gov.in/list", { allowedHost: "ap.gov.in" });
    expect(found).toHaveLength(1);
  });

  it("can be limited to PDFs only", () => {
    const found = htmlIndexCandidates(html, page, { pdfOnly: true });
    expect(found.every((c) => c.looksLike === "pdf")).toBe(true);
  });

  it("reads an image link's label from alt or title", () => {
    const anchors = extractAnchors(`<a href="/a.pdf" title="Syllabus 2026"><img src="i.png"></a>`, "https://e.gov.in/");
    expect(anchors[0]!.text).toBe("Syllabus 2026");
  });

  it("does not emit the same URL twice", () => {
    const dupes = `<a href="/a.pdf">One</a><a href="/a.pdf">Again</a>`;
    expect(htmlIndexCandidates(dupes, "https://e.gov.in/l")).toHaveLength(1);
  });
});

describe("small parsing helpers", () => {
  it("decodes entities, with &amp; resolved last", () => {
    expect(decodeEntities("a &amp;lt; b")).toBe("a &lt; b");
    expect(decodeEntities("&#x2014; &#8212;")).toBe("— —");
  });

  it("strips tags and drops script and style bodies", () => {
    expect(stripTags("<p>Hello <b>world</b></p><script>evil()</script>")).toBe("Hello world");
  });

  it("normalises dates to a calendar day", () => {
    expect(toIsoDate("Tue, 19 Aug 2026 10:00:00 +0530")).toBe("2026-08-19");
    expect(toIsoDate("2026-08-19T12:00:00Z")).toBe("2026-08-19");
    expect(toIsoDate("gibberish")).toBeUndefined();
    expect(toIsoDate(undefined)).toBeUndefined();
  });

  it("classifies URLs by shape", () => {
    expect(looksLikeUrl("https://e.gov.in/a.PDF?x=1")).toBe("pdf");
    expect(looksLikeUrl("https://youtu.be/abc")).toBe("video");
    expect(looksLikeUrl("https://e.gov.in/page")).toBe("page");
  });

  it("extracts YouTube ids from every URL shape", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(youtubeVideoId("https://vimeo.com/123")).toBeNull();
  });
});

describe("file security", () => {
  const pdf = Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(2000, 0x20)]);

  it("identifies types by magic bytes, not extension", () => {
    expect(sniffKind(pdf)).toBe("pdf");
    // Real bytes, not a utf8 string: Buffer.from("\x89…") would encode U+0089
    // as two bytes and the signature would never match.
    expect(sniffKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image");
    expect(sniffKind(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]))).toBe("image");
    expect(sniffKind(Buffer.from("PK\x03\x04zipbody"))).toBe("archive");
    expect(sniffKind(Buffer.from("<!DOCTYPE html><html>"))).toBe("html");
  });

  it("rejects an HTML error page served for a .pdf link", () => {
    // The single most common failure mode on these portals.
    const html = Buffer.from("<!DOCTYPE html><html><body>Server Error</body></html>");
    const v = validateDownload(html, "pdf", 1e9);
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.reason).toBe("wrong-file-type");
      expect(v.detail).toContain("magic bytes say html");
    }
  });

  it("rejects an empty file and a too-small PDF", () => {
    expect(validateDownload(Buffer.alloc(0), "pdf", 1e9)).toMatchObject({ ok: false, reason: "empty-file" });
    expect(validateDownload(Buffer.from("%PDF-1.4"), "pdf", 1e9)).toMatchObject({ ok: false, reason: "empty-file" });
  });

  it("rejects an oversized file", () => {
    expect(validateDownload(pdf, "pdf", 100)).toMatchObject({ ok: false, reason: "too-large" });
  });

  it("detects a password-protected PDF from its trailer", () => {
    const encrypted = Buffer.concat([
      Buffer.from("%PDF-1.7\n"),
      Buffer.alloc(2000, 0x20),
      Buffer.from("trailer<</Encrypt 12 0 R>>\n%%EOF"),
    ]);
    expect(isEncryptedPdf(encrypted)).toBe(true);
    expect(validateDownload(encrypted, "pdf", 1e9)).toMatchObject({ ok: false, reason: "password-protected" });
  });

  it("passes a plain PDF and returns its hash and size", () => {
    const v = validateDownload(pdf, "pdf", 1e9);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.hash).toBe(sha256(pdf));
      expect(v.size).toBe(pdf.length);
    }
  });

  it("flags PDFs carrying scripts or auto-run actions", () => {
    const nasty = Buffer.concat([Buffer.from("%PDF-1.7\n/OpenAction<</JS(app.alert\\(1\\))/S/JavaScript>>"), Buffer.alloc(2000, 0x20)]);
    const screen = screenPdfContent(nasty);
    expect(screen.suspicious).toBe(true);
    expect(screen.findings).toContain("embedded JavaScript");
    expect(screen.findings).toContain("/OpenAction auto-run");
    expect(screenPdfContent(pdf).suspicious).toBe(false);
  });

  it("builds a storage key from the hash, never the remote filename", () => {
    const key = safeFileKey("ncert", "abcdef0123456789", "pdf");
    expect(key).toBe("resources/ncert/ab/abcdef0123456789.pdf");
    // A hostile source id cannot escape the prefix.
    expect(safeFileKey("../../etc", "aa11", "pdf")).toBe("resources/etc/aa/aa11.pdf");
  });
});

describe("PDF metadata helpers", () => {
  it("parses PDF date strings and rejects junk", () => {
    expect(parsePdfDate("D:20260830143000+05'30'")).toBe("2026-08-30");
    expect(parsePdfDate("20260830")).toBe("2026-08-30");
    expect(parsePdfDate("nonsense")).toBeUndefined();
    expect(parsePdfDate(undefined)).toBeUndefined();
    expect(parsePdfDate("D:18500101")).toBeUndefined();
  });

  it("rejects producer junk as a title", () => {
    expect(usableTitle("Microsoft Word - notification.doc")).toBe("notification");
    expect(usableTitle("eapcet_2026_final")).toBeUndefined();
    expect(usableTitle("Untitled")).toBeUndefined();
    expect(usableTitle("")).toBeUndefined();
    expect(usableTitle("AP EAPCET 2026 Notification")).toBe("AP EAPCET 2026 Notification");
  });

  it("prefers link text, then metadata, then a heading, then the filename", () => {
    expect(bestTitle({ linkText: "AP EAPCET 2026 Notification", url: "https://e.gov.in/x.pdf" })).toBe("AP EAPCET 2026 Notification");
    // "Click here" is not a title.
    expect(bestTitle({ linkText: "Click here", metaTitle: "Model Paper Mathematics", url: "https://e.gov.in/x.pdf" })).toBe("Model Paper Mathematics");
    expect(bestTitle({ text: "\n12\nBoard of Intermediate Education Syllabus 2026\nmore text", url: "https://e.gov.in/x.pdf" })).toBe(
      "Board of Intermediate Education Syllabus 2026",
    );
    expect(bestTitle({ url: "https://e.gov.in/AP_EAPCET_2026_notif.pdf" })).toBe("AP EAPCET 2026 notif");
    expect(bestTitle({ url: "https://e.gov.in/" })).toBe("Untitled document");
  });
});

describe("status decisions", () => {
  const today = "2026-08-30";

  it("holds everything at 'new' while autoPublish is off", () => {
    expect(decideStatus(src({ licenseStatus: "yes", autoPublish: false }), [], 50, undefined, today)).toBe("new");
  });

  it("publishes only once an admin has enabled autoPublish", () => {
    expect(decideStatus(src({ licenseStatus: "yes", autoPublish: true }), [], 50, undefined, today)).toBe("published");
  });

  it("never publishes from a source with an unclear licence", () => {
    // The §17 rule, as code.
    expect(decideStatus(src({ licenseStatus: "unknown", autoPublish: true }), [], 99, undefined, today)).toBe("needs-review");
  });

  it("sends a broken file to review whatever autoPublish says", () => {
    for (const flag of ["empty-file", "password-protected", "wrong-file-type", "too-large", "download-failed", "suspicious-content"] as ResourceFlag[]) {
      expect(decideStatus(src({ licenseStatus: "yes", autoPublish: true }), [flag], 99, undefined, today)).toBe("needs-review");
    }
  });

  it("marks a removed source item source-unavailable, above all else", () => {
    expect(decideStatus(src({ licenseStatus: "yes", autoPublish: true }), ["source-removed"], 99, undefined, today)).toBe("source-unavailable");
  });

  it("expires a past deadline instead of publishing it", () => {
    expect(decideStatus(src({ licenseStatus: "yes", autoPublish: true }), [], 99, "2026-08-01", today)).toBe("expired");
  });

  it("sends a low-confidence categorisation to review", () => {
    expect(decideStatus(src({ licenseStatus: "yes", autoPublish: true }), [], 2, undefined, today)).toBe("needs-review");
  });

  it("sends a resource with no metadata to review", () => {
    expect(decideStatus(src({ licenseStatus: "yes", autoPublish: true }), ["missing-metadata"], 99, undefined, today)).toBe("needs-review");
  });
});

describe("scheduling", () => {
  const now = new Date("2026-08-30T12:00:00Z");

  it("is due when it has never succeeded", () => {
    expect(isDue(src(), now, 24)).toBe(true);
  });

  it("is not due inside its window", () => {
    const s = src({ health: { ...emptyHealth(), lastSuccess: "2026-08-30T06:00:00Z" } });
    expect(isDue(s, now, 24)).toBe(false);
    expect(isDue(s, now, 6)).toBe(true);
  });

  it("measures from the last SUCCESS, so a failing host is retried", () => {
    const s = src({
      health: { ...emptyHealth(), lastChecked: "2026-08-30T11:00:00Z", lastSuccess: "2026-08-01T00:00:00Z" },
    });
    expect(isDue(s, now, 24)).toBe(true);
  });
});

describe("expiry sweep and merge", () => {
  const today = "2026-08-30";
  const nowIso = "2026-08-30T12:00:00.000Z";

  it("archives a past-deadline resource without deleting it", () => {
    const { resources, expired } = archiveExpired([res({ id: "a", expiryDate: "2026-08-01" })], today, nowIso);
    expect(expired).toBe(1);
    expect(resources).toHaveLength(1);
    expect(resources[0]!.status).toBe("expired");
    expect(resources[0]!.flags).toContain("expired");
  });

  it("leaves live and already-archived resources alone", () => {
    const input = [
      res({ id: "live", expiryDate: "2026-12-31" }),
      res({ id: "none" }),
      res({ id: "already", expiryDate: "2026-01-01", status: "expired" }),
    ];
    const { resources, expired } = archiveExpired(input, today, nowIso);
    expect(expired).toBe(0);
    expect(resources.map((r) => r.status)).toEqual(["published", "published", "expired"]);
  });

  it("merges by id, newest winning, and keeps untouched records", () => {
    const merged = mergeResources(
      [res({ id: "a", title: "old" }), res({ id: "b", title: "keep" })],
      [res({ id: "a", title: "new" }), res({ id: "c", title: "added" })],
    );
    expect(merged).toHaveLength(3);
    expect(merged.find((r) => r.id === "a")!.title).toBe("new");
    expect(merged.find((r) => r.id === "b")!.title).toBe("keep");
  });
});

describe("source normalisation", () => {
  it("defaults a source with no licence verdict to the restrictive answer", () => {
    const s = normalizeSource({ id: "x", name: "X", url: "https://x.gov.in/" });
    expect(s.licenseStatus).toBe("unknown");
    expect(s.active).toBe(false);
    expect(s.autoPublish).toBe(false);
    expect(s.method).toBe("manual");
  });

  it("fills in a missing health block", () => {
    const s = normalizeSource({ id: "x", name: "X", url: "https://x.gov.in/" });
    expect(s.health.consecutiveFailures).toBe(0);
    expect(s.health.etags).toEqual({});
  });
});
