import { describe, expect, it } from "vitest";
import { search, facetCounts } from "@/lib/search/query";
import { normalize, tokens, expandQuery, hasTelugu } from "@/lib/search/normalize";
import { isIndexable } from "@/lib/search/schema";
import type { SearchDoc } from "@/lib/search/schema";

const doc = (over: Partial<SearchDoc>): SearchDoc => ({
  id: "1", title: "", description: "", url: "/", section: "village",
  language: "en", keywords: [], content: "", ...over,
});

const CORPUS: SearchDoc[] = [
  doc({ id: "m1", title: "Ramalayam", description: "Sri Rama temple", url: "/heritage/", section: "temples", keywords: ["temple"], weight: 2 }),
  doc({ id: "m2", title: "రామాలయం", description: "శ్రీ రామ దేవాలయం", url: "/te/", section: "temples", language: "te" }),
  doc({ id: "m3", title: "Sankranthi 2026", description: "Harvest festival", url: "/sankranthi/2026/", section: "media" }),
  doc({ id: "m4", title: "G Ramesh Kumar Reddy", description: "Government Employee", url: "/members/", section: "community", weight: 3 }),
  doc({ id: "m5", title: "Fun Fest", description: "private", url: "/fun-trips/", section: "gated" }),
];

describe("normalisation", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalize("Sri Rama, Navami!")).toBe("sri rama navami");
  });
  it("detects Telugu script", () => {
    expect(hasTelugu("రామాలయం")).toBe(true);
    expect(hasTelugu("Ramalayam")).toBe(false);
  });
  it("emits bigrams for Telugu so partial words match", () => {
    const t = tokens("రామాలయం");
    expect(t.length).toBeGreaterThan(1);
  });
  it("expands a query across scripts", () => {
    expect(expandQuery("ramalayam")).toContain("రామాలయం");
    expect(expandQuery("రామాలయం")).toContain("ramalayam");
  });
});

describe("search", () => {
  it("finds an exact title first", () => {
    const hits = search(CORPUS, "Ramalayam");
    expect(hits[0]!.doc.id).toBe("m1");
  });
  it("finds Telugu content from a Latin query", () => {
    const ids = search(CORPUS, "ramalayam").map((h) => h.doc.id);
    expect(ids).toContain("m2");
  });
  it("finds a member by name", () => {
    expect(search(CORPUS, "Ramesh")[0]!.doc.id).toBe("m4");
  });
  it("returns nothing for content that does not exist yet", () => {
    // "Java" must return zero until Phase 3 adds real courses. Returning a
    // plausible-looking placeholder would be fabricated content.
    expect(search(CORPUS, "Java")).toHaveLength(0);
  });
  it("respects a section filter", () => {
    const hits = search(CORPUS, "", { section: "temples" });
    expect(hits.every((h) => h.doc.section === "temples")).toBe(true);
  });
  it("honours the limit", () => {
    expect(search(CORPUS, "", { limit: 2 })).toHaveLength(2);
  });
  it("counts facets", () => {
    const counts = facetCounts(search(CORPUS, "", { limit: 99 }));
    expect(counts.temples).toBe(2);
  });
});

describe("index safety", () => {
  it("refuses to index private sections", () => {
    expect(isIndexable({ section: "gated", url: "/fun-trips/" })).toBe(false);
    expect(isIndexable({ section: "admin", url: "/admin/" })).toBe(false);
    expect(isIndexable({ section: "village", url: "/about/" })).toBe(true);
  });
  it("refuses private URLs even under a public section", () => {
    expect(isIndexable({ section: "village", url: "/admin/secret/" })).toBe(false);
  });
});
