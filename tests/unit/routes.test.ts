import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ALL_ROUTES, LIVE_ROUTES, PLANNED_ROUTES, findRoute, indexableRoutes,
  localeAlternate, teluguRoutes,
} from "@/lib/routes/registry";

describe("route registry", () => {
  it("every path is absolute and ends in a slash", () => {
    for (const r of ALL_ROUTES) {
      expect(r.path.startsWith("/"), r.path).toBe(true);
      expect(r.path.endsWith("/"), r.path).toBe(true);
    }
  });
  it("has no duplicate paths", () => {
    const seen = new Set<string>();
    for (const r of ALL_ROUTES) {
      expect(seen.has(r.path), `duplicate ${r.path}`).toBe(false);
      seen.add(r.path);
    }
  });
  it("planned routes are never marked live", () => {
    for (const r of PLANNED_ROUTES) expect(r.status).toBe("planned");
  });
  it("private and utility routes stay out of the sitemap", () => {
    const idx = indexableRoutes().map((r) => r.path);
    for (const p of ["/admin/", "/login/", "/chat/", "/fun-trips/", "/search/", "/settings/"]) {
      expect(idx, p).not.toContain(p);
    }
  });
  it("merged and retired public pages stay out of the sitemap", () => {
    const idx = indexableRoutes().map((r) => r.path);
    for (const p of [
      "/heritage/",
      "/timeline/",
      "/years/",
      "/events/",
      "/directory/",
      "/dharma/",
      "/telugu-culture/",
    ]) {
      expect(idx, p).not.toContain(p);
    }
  });
  it("search index does not advertise retired knowledge hubs", () => {
    const searchPath = path.join(process.cwd(), "public", "search-index.json");
    if (!fs.existsSync(searchPath)) return;
    const json = fs.readFileSync(searchPath, "utf8");
    expect(json).not.toContain("/dharma/");
    expect(json).not.toContain("/telugu-culture/");
  });
});

describe("language alternates are honest", () => {
  it("only offers /te/ where a translation exists", () => {
    for (const r of LIVE_ROUTES) {
      const alt = localeAlternate(r.path, "te");
      if (r.hasTelugu) {
        expect(alt.exact).toBe(true);
        expect(alt.href).toBe(`/te${r.path}`);
      } else {
        // Falls back to the Telugu root rather than a URL that would 404.
        expect(alt.exact).toBe(false);
        expect(alt.href).toBe("/te/");
      }
    }
  });
  it("every Telugu route has a real page directory", () => {
    for (const r of teluguRoutes()) {
      const dir = r.path === "/" ? "app/te" : `app/te${r.path}`.replace(/\/$/, "");
      expect(fs.existsSync(path.join(process.cwd(), dir)), dir).toBe(true);
    }
  });
  it("switching back to English is always exact", () => {
    for (const r of LIVE_ROUTES) {
      expect(localeAlternate(r.path, "en")).toEqual({ href: r.path, exact: true });
    }
  });
});

describe("existing URLs are preserved", () => {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  it("every indexable registry route appears in the built sitemap", () => {
    if (!fs.existsSync(sitemapPath)) return; // sitemap is a build artefact
    const xml = fs.readFileSync(sitemapPath, "utf8");
    for (const r of indexableRoutes()) {
      expect(xml.includes(`${r.path}<`) || xml.includes(r.path), r.path).toBe(true);
    }
  });
  it("findRoute tolerates a missing trailing slash", () => {
    expect(findRoute("/about")?.path).toBe("/about/");
    expect(findRoute("/about/")?.path).toBe("/about/");
  });
});
