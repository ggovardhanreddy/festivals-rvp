/**
 * End-to-end pipeline test with a stubbed network.
 *
 * The government hosts are unreachable from CI sandboxes, and a test that hits
 * live state portals would be both flaky and rude. So `fetch` is replaced with
 * a fixture server whose payloads are the real shapes seen during source
 * vetting. That makes the interesting behaviour testable: the permission gate,
 * dedupe, status assignment and version archiving all run for real.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collectSource } from "@/lib/collector/pipeline";
import { normalizeSource } from "@/lib/collector/store";
import { clearRobotsCache } from "@/lib/collector/robots";
import { resetHostThrottle } from "@/lib/collector/fetcher";
import type { CollectorNotification, Resource, Source } from "@/lib/resources/types";

const NOW = new Date("2026-08-30T12:00:00Z");

function source(over: Partial<Source> = {}): Source {
  return normalizeSource({
    id: "test",
    name: "Test Source",
    url: "https://test.gov.in/",
    feedUrl: "https://test.gov.in/list",
    method: "html-index",
    type: "state-education",
    categories: ["school"],
    licenseStatus: "no",
    licenseNote: "test",
    active: true,
    frequency: "daily",
    autoPublish: false,
    ...over,
  });
}

/** A real, minimal, parseable PDF with extractable text. */
function pdfBytes(text: string): Buffer {
  const content = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>endobj",
    `4 0 obj<</Length ${content.length}>>stream\n${content}\nendstream endobj`,
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj",
  ];
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const o of objects) {
    offsets.push(body.length);
    body += `${o}\n`;
  }
  const xrefAt = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) body += `${String(off).padStart(10, "0")} 00000 n \n`;
  body += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefAt}\n%%EOF`;
  // Padded so it clears the MIN_PDF_BYTES floor for a real document.
  return Buffer.concat([Buffer.from(body, "latin1"), Buffer.from(`\n% ${"pad ".repeat(300)}`, "latin1")]);
}

type Route = { body: Buffer | string; status?: number; contentType?: string; etag?: string };
let routes: Map<string, Route>;
let requested: string[];

function serve(url: string): Route | undefined {
  return routes.get(url) ?? routes.get(url.replace(/\/$/, ""));
}

beforeEach(() => {
  routes = new Map();
  requested = [];
  clearRobotsCache();
  resetHostThrottle();
  vi.stubGlobal("fetch", async (input: string | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    requested.push(`${init?.method ?? "GET"} ${url}`);
    const route = serve(url);
    if (!route) {
      return new Response(null, { status: 404, headers: { "content-type": "text/plain" } });
    }
    const body = typeof route.body === "string" ? Buffer.from(route.body, "utf8") : route.body;
    if (init?.method === "HEAD") {
      return new Response(null, {
        status: route.status ?? 200,
        headers: { "content-length": String(body.length), etag: route.etag ?? "" },
      });
    }
    return new Response(new Uint8Array(body), {
      status: route.status ?? 200,
      headers: {
        "content-type": route.contentType ?? "application/octet-stream",
        "content-length": String(body.length),
        ...(route.etag ? { etag: route.etag } : {}),
      },
    });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const noopDeps = () => {
  const notes: CollectorNotification[] = [];
  return {
    deps: {
      now: NOW,
      dryRun: true,
      notify: (n: Omit<CollectorNotification, "id" | "at">) =>
        notes.push({ ...n, id: "n", at: NOW.toISOString() }),
      log: () => {},
    },
    notes,
  };
};

describe("permission gate", () => {
  const listing = `<table>
    <tr><td><a href="/papers/maths-2026.pdf">Class 10 Mathematics Model Paper 2026</a></td><td>10-01-2026</td></tr>
  </table>`;

  it("does NOT download when the licence is 'no' — link-only", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", { body: listing, contentType: "text/html" });
    routes.set("https://test.gov.in/papers/maths-2026.pdf", { body: pdfBytes("should never be fetched"), contentType: "application/pdf" });

    const { deps } = noopDeps();
    const { resources, result } = await collectSource(source({ licenseStatus: "no" }), [], deps, { force: true });

    expect(result.added).toBe(1);
    const r = resources[0]!;
    expect(r.localFileUrl).toBeUndefined();
    expect(r.fileHash).toBeUndefined();
    expect(r.originalUrl).toBe("https://test.gov.in/papers/maths-2026.pdf");
    // The PDF itself was never requested. This is the whole point of §17.
    expect(requested.some((x) => x.includes("maths-2026.pdf"))).toBe(false);
  });

  it("does NOT download when the licence is 'unknown', and holds for review", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", { body: listing, contentType: "text/html" });

    const { deps, notes } = noopDeps();
    const { resources } = await collectSource(
      source({ licenseStatus: "unknown", autoPublish: true }),
      [],
      deps,
      { force: true },
    );
    const r = resources[0]!;
    expect(r.localFileUrl).toBeUndefined();
    expect(r.status).toBe("needs-review");
    expect(r.flags).toContain("license-unclear");
    expect(notes.some((n) => n.kind === "license-unclear")).toBe(true);
  });

  it("DOES download and host when the licence is 'yes'", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", { body: listing, contentType: "text/html" });
    routes.set("https://test.gov.in/papers/maths-2026.pdf", {
      body: pdfBytes("Class 10 Mathematics Model Question Paper"),
      contentType: "application/pdf",
    });

    const { deps } = noopDeps();
    const { resources } = await collectSource(
      source({ licenseStatus: "yes", attribution: "Source: Test" }),
      [],
      deps,
      { force: true },
    );
    const r = resources[0]!;
    expect(requested.some((x) => x.includes("maths-2026.pdf"))).toBe(true);
    expect(r.fileHash).toMatch(/^[0-9a-f]{64}$/);
    expect(r.localFileUrl).toMatch(/^\/resources\/test\/[0-9a-f]{2}\/[0-9a-f]{64}\.pdf$/);
    expect(r.attribution).toBe("Source: Test");
    expect(r.resourceType).toBe("question-paper");
    expect(r.category).toBe("school");
    expect(r.classLevel).toBe("class-10");
    expect(r.subject).toBe("mathematics");
  });
});

describe("robots.txt is obeyed", () => {
  it("skips a source whose index path is disallowed", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow: /list\n" });
    routes.set("https://test.gov.in/list", { body: "<a href='/a.pdf'>A</a>", contentType: "text/html" });

    const { deps } = noopDeps();
    const { result } = await collectSource(source(), [], deps, { force: true });
    expect(result.ok).toBe(false);
    expect(result.skipped).toBe("robots-disallowed");
    expect(requested.some((x) => x.endsWith("/list"))).toBe(false);
  });
});

describe("sources the collector must not touch", () => {
  it("never fetches a manual source, however active", async () => {
    const { deps } = noopDeps();
    const { result } = await collectSource(source({ method: "manual", active: true }), [], deps, { force: true });
    expect(result.skipped).toBe("manual-only");
    expect(requested).toEqual([]);
  });

  it("never fetches an inactive source", async () => {
    const { deps } = noopDeps();
    const { result } = await collectSource(source({ active: false }), [], deps, { force: true });
    expect(result.skipped).toBe("inactive");
    expect(requested).toEqual([]);
  });

  it("skips an api source with no key rather than crawling the website", async () => {
    const prior = process.env.DATA_GOV_IN_API_KEY;
    delete process.env.DATA_GOV_IN_API_KEY;
    const { deps } = noopDeps();
    const { result } = await collectSource(source({ method: "api" }), [], deps, { force: true });
    expect(result.skipped).toBe("manual-only");
    expect(requested).toEqual([]);
    if (prior !== undefined) process.env.DATA_GOV_IN_API_KEY = prior;
  });
});

describe("RSS collection", () => {
  it("collects link-only entries from a feed", async () => {
    routes.set("https://icar.org.in/robots.txt", { body: "User-agent: *\nDisallow: /admin/\n" });
    routes.set("https://icar.org.in/en/rss.xml", {
      contentType: "application/xml",
      body: `<rss><channel>
        <item><title>Package of Practices for Groundnut</title><link>https://icar.org.in/node/1</link>
          <description>Sowing time, pest management and soil guidance for rainfed groundnut</description>
          <pubDate>Tue, 19 Aug 2026 10:00:00 +0530</pubDate></item>
      </channel></rss>`,
    });

    const { deps } = noopDeps();
    const { resources, result } = await collectSource(
      source({ id: "icar", name: "ICAR", url: "https://icar.org.in/en", feedUrl: "https://icar.org.in/en/rss.xml", method: "rss", categories: ["agriculture"] }),
      [],
      deps,
      { force: true },
    );
    expect(result.added).toBe(1);
    const r = resources[0]!;
    expect(r.category).toBe("agriculture");
    expect(r.publishedDate).toBe("2026-08-19");
    expect(r.localFileUrl).toBeUndefined();
    expect(r.status).toBe("new");
  });
});

describe("expiry at collection time", () => {
  it("archives a notification whose deadline has already passed", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", {
      contentType: "text/html",
      body: `<table><tr><td><a href="/n/old.pdf">Scholarship notification — last date 01-07-2026</a></td><td>01-06-2026</td></tr></table>`,
    });

    const { deps } = noopDeps();
    const { resources } = await collectSource(
      source({ licenseStatus: "no", categories: ["scholarships"], autoPublish: true }),
      [],
      deps,
      { force: true },
    );
    const r = resources[0]!;
    expect(r.expiryDate).toBe("2026-07-01");
    expect(r.status).toBe("expired");
  });
});

describe("duplicate handling", () => {
  it("does not re-add a resource already in the catalog", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", {
      contentType: "text/html",
      body: `<table><tr><td><a href="/papers/a.pdf">Class 9 Science Model Paper</a></td><td></td></tr></table>`,
    });
    const existing: Resource[] = [
      {
        id: "test-existing",
        title: "Class 9 Science Model Paper",
        description: "",
        category: "school",
        language: "en",
        resourceType: "question-paper",
        sourceId: "test",
        sourceUrl: "https://test.gov.in/list",
        originalUrl: "https://test.gov.in/papers/a.pdf",
        canonicalUrl: "https://test.gov.in/papers/a.pdf",
        collectedDate: "2026-08-01",
        licenseStatus: "no",
        status: "published",
        flags: [],
        tags: [],
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
    ];

    const { deps } = noopDeps();
    const { result, resources } = await collectSource(source(), existing, deps, { force: true });
    // Same canonical URL and no change signal: nothing added, nothing updated.
    expect(result.added).toBe(0);
    expect(result.updated).toBe(0);
    expect(resources).toEqual([]);
  });
});

describe("update detection and version archiving", () => {
  it("archives the old version when a hosted PDF changes", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", {
      contentType: "text/html",
      body: `<table><tr><td><a href="/papers/syllabus.pdf">Intermediate Syllabus 2026</a></td><td>15-08-2026</td></tr></table>`,
    });
    routes.set("https://test.gov.in/papers/syllabus.pdf", {
      body: pdfBytes("Intermediate Syllabus 2026 revised edition with extra chapters"),
      contentType: "application/pdf",
    });

    const existing: Resource[] = [
      {
        id: "test-old",
        title: "Intermediate Syllabus 2026",
        description: "",
        category: "intermediate",
        language: "en",
        resourceType: "syllabus",
        sourceId: "test",
        sourceUrl: "https://test.gov.in/list",
        originalUrl: "https://test.gov.in/papers/syllabus.pdf",
        canonicalUrl: "https://test.gov.in/papers/syllabus.pdf",
        localFileUrl: "/resources/test/aa/aaaa.pdf",
        fileHash: "aaaa",
        fileSize: 111,
        collectedDate: "2026-07-01",
        lastUpdatedDate: "2026-07-01",
        licenseStatus: "yes",
        status: "published",
        flags: [],
        tags: [],
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ];

    const { deps, notes } = noopDeps();
    const { result, resources } = await collectSource(
      source({ licenseStatus: "yes" }),
      existing,
      deps,
      { force: true },
    );

    expect(result.updated).toBe(1);
    const r = resources[0]!;
    expect(r.id).toBe("test-old");
    expect(r.versions?.[0]).toMatchObject({ hash: "aaaa", fileKey: "resources/test/aa/aaaa.pdf" });
    expect(r.fileHash).not.toBe("aaaa");
    expect(r.lastUpdatedDate).toBe("2026-08-15");
    // A document that changed has not been reviewed in its new form.
    expect(r.status).toBe("needs-review");
    expect(r.reviewedAt).toBeNull();
    expect(notes.some((n) => n.kind === "resource-updated")).toBe(true);
  });
});

describe("quality checks in the live path", () => {
  it("flags an HTML error page served for a .pdf link", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", {
      contentType: "text/html",
      body: `<table><tr><td><a href="/papers/broken.pdf">Class 8 Social Studies Paper</a></td><td></td></tr></table>`,
    });
    routes.set("https://test.gov.in/papers/broken.pdf", {
      body: "<!DOCTYPE html><html><body>Runtime Error</body></html>",
      contentType: "text/html",
    });

    const { deps } = noopDeps();
    const { resources } = await collectSource(
      source({ licenseStatus: "yes", autoPublish: true }),
      [],
      deps,
      { force: true },
    );
    const r = resources[0]!;
    expect(r.flags).toContain("wrong-file-type");
    expect(r.status).toBe("needs-review");
    expect(r.localFileUrl).toBeUndefined();
  });

  it("marks a removed PDF source-unavailable", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", {
      contentType: "text/html",
      body: `<table><tr><td><a href="/papers/gone.pdf">Class 7 Telugu Model Paper</a></td><td></td></tr></table>`,
    });
    // /papers/gone.pdf is not in routes, so the stub answers 404.

    const { deps } = noopDeps();
    const { resources } = await collectSource(
      source({ licenseStatus: "yes", autoPublish: true }),
      [],
      deps,
      { force: true },
    );
    expect(resources[0]!.status).toBe("source-unavailable");
  });
});

describe("source health", () => {
  it("records success and stores the ETag for a conditional re-check", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", { body: "<a href='/x.pdf'>Doc</a>", contentType: "text/html", etag: 'W/"abc"' });

    const { deps } = noopDeps();
    const { source: after } = await collectSource(source(), [], deps, { force: true });
    expect(after.health.lastSuccess).toBe(NOW.toISOString());
    expect(after.health.consecutiveFailures).toBe(0);
    expect(after.health.etags["https://test.gov.in/list"]).toBe('W/"abc"');
  });

  it("counts a failure and warns on the third consecutive one", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    // /list is absent → 404 → "the source URL may have moved".
    const { deps, notes } = noopDeps();
    const failing = source({ health: { lastChecked: null, lastSuccess: null, consecutiveFailures: 2, lastError: "x", resourceCount: 0, etags: {}, lastModified: {} } });
    const { result, source: after } = await collectSource(failing, [], deps, { force: true });
    expect(result.ok).toBe(false);
    expect(after.health.consecutiveFailures).toBe(3);
    expect(notes.some((n) => n.kind === "source-failing")).toBe(true);
    expect(notes.some((n) => n.kind === "source-url-changed")).toBe(true);
  });
});

describe("identifying ourselves", () => {
  it("sends a User-Agent naming the site and a contact address", async () => {
    routes.set("https://test.gov.in/robots.txt", { body: "User-agent: *\nDisallow:\n" });
    routes.set("https://test.gov.in/list", { body: "<a href='/x.pdf'>Doc</a>", contentType: "text/html" });
    const seen: string[] = [];
    vi.stubGlobal("fetch", async (input: string | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      seen.push(headers.get("user-agent") ?? "");
      const url = typeof input === "string" ? input : input.toString();
      const route = serve(url);
      if (!route) return new Response(null, { status: 404 });
      const body = typeof route.body === "string" ? Buffer.from(route.body) : route.body;
      return new Response(new Uint8Array(body), { status: 200, headers: { "content-type": route.contentType ?? "text/html" } });
    });

    const { deps } = noopDeps();
    await collectSource(source(), [], deps, { force: true });
    expect(seen.length).toBeGreaterThan(0);
    for (const ua of seen) {
      expect(ua).toContain("ReddivaripalliLearningBot");
      expect(ua).toContain("reddivaripalli.com");
      expect(ua).toContain("contact");
    }
  });
});
