import fs from "node:fs";
import path from "node:path";
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

/**
 * Bilingual search over the built index.
 *
 * These assert the behaviour a villager depends on: the same query in either
 * script reaches the same service, and a search box never surfaces a private
 * document. They run against the real index when one has been built.
 */
describe("bilingual search over the built index", () => {
  const indexPath = path.join(process.cwd(), "public", "search-index.json");
  const shard = fs.existsSync(indexPath)
    ? (JSON.parse(fs.readFileSync(indexPath, "utf8")) as { docs: SearchDoc[] })
    : null;

  const cases: Array<[string, RegExp]> = [
    ["aadhaar", /aadhaar|ఆధార్/i],
    ["ఆధార్", /aadhaar|ఆధార్/i],
    ["pan", /pan|పాన్/i],
    ["marksheet", /digilocker|డిజిలాకర్/i],
    ["scholarship", /scholarship|jnanabhumi|స్కాలర్|జ్ఞానభూమి/i],
    ["PM Kisan", /kisan|కిసాన్/i],
    ["crop insurance", /bima|insurance|బీమా/i],
    ["adangal", /meebhoomi|మీభూమి/i],
    ["passport", /passport|పాస్‌పోర్ట్/i],
    ["driving licence", /parivahan|పరివాహన్/i],
    ["pension", /pension|epfo|nps|పింఛను|ఈపీఎఫ్/i],
    ["SBI", /state bank|స్టేట్ బ్యాంక్/i],
    ["UPI", /upi|npci|యూపీఐ/i],
    ["cyber scam", /cyber|1930|సైబర్/i],
    ["రైతు", /farmer|kisan|రైతు|కిసాన్/i],
    ["ఉద్యోగాలు", /career|job|ఉద్యోగ/i],
    ["భూమి", /meebhoomi|land|భూమి/i],
  ];

  for (const [query, expected] of cases) {
    it(`"${query}" finds a relevant result`, () => {
      if (!shard) return; // index is a build artefact
      const hits = search(shard.docs, query, { limit: 5 });
      expect(hits.length, query).toBeGreaterThan(0);
      expect(hits[0]!.doc.title, query).toMatch(expected);
    });
  }

  it("an empty query returns the pool, not an error", () => {
    if (!shard) return;
    expect(search(shard.docs, "").length).toBeGreaterThan(0);
  });

  it("a nonsense query returns nothing rather than noise", () => {
    if (!shard) return;
    expect(search(shard.docs, "zzzzqqqqxxxx").length).toBe(0);
  });

  it("nothing private is in the public index", () => {
    if (!shard) return;
    for (const doc of shard.docs) {
      expect(doc.url, doc.id).not.toMatch(/^\/(admin|login|chat|fun-trips)\//);
      expect(["gated", "admin"]).not.toContain(doc.section);
    }
  });
});
