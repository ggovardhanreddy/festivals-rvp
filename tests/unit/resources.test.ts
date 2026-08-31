import { describe, expect, it } from "vitest";
import { detectLanguage, hasTelugu } from "@/lib/resources/language";
import { extractExpiryDate, isExpired, parseIndianDate } from "@/lib/resources/expiry";
import {
  categorize,
  CONFIDENCE_FLOOR,
  detectClassLevel,
  detectExam,
  detectResourceType,
  detectSubject,
} from "@/lib/resources/categorize";
import {
  canonicalizeUrl,
  findDuplicate,
  jaccard,
  titleSimilarity,
  titleTokens,
} from "@/lib/resources/dedupe";
import { CATEGORY_TREE, categoryLabel, subcategoryLabel } from "@/lib/resources/taxonomy";
import type { Resource } from "@/lib/resources/types";

/** A minimal published resource, for dedupe tests. */
function res(over: Partial<Resource> = {}): Resource {
  return {
    id: "x-1",
    title: "Sample",
    description: "",
    category: "school",
    language: "en",
    resourceType: "pdf",
    sourceId: "s",
    sourceUrl: "https://example.gov.in/list",
    originalUrl: "https://example.gov.in/a.pdf",
    collectedDate: "2026-08-30",
    licenseStatus: "no",
    status: "published",
    flags: [],
    tags: [],
    createdAt: "2026-08-30T00:00:00.000Z",
    updatedAt: "2026-08-30T00:00:00.000Z",
    ...over,
  };
}

describe("language detection", () => {
  it("calls plain English English", () => {
    expect(detectLanguage("AP EAPCET 2026 Notification", "Apply online before the last date")).toBe("en");
  });

  it("calls a Telugu document Telugu", () => {
    expect(detectLanguage("పదవ తరగతి తెలుగు వాచకం", "ఆంధ్రప్రదేశ్ ప్రభుత్వ పాఠ్యపుస్తకం")).toBe("te");
  });

  it("calls a mostly-English AP PDF with a Telugu body Telugu", () => {
    // The real shape of an AP textbook: English letterhead, Telugu content.
    const title = "Government of Andhra Pradesh Free Distribution 2026-27";
    const body = "తెలుగు వాచకం మొదటి పాఠం. ఈ పుస్తకం ఆంధ్రప్రదేశ్ ప్రభుత్వం ఉచితంగా అందిస్తుంది.";
    expect(detectLanguage(title, "", body)).toBe("te");
  });

  it("does not call an English notice Telugu for one stray word", () => {
    const long = `Andhra Pradesh Public Service Commission recruitment notification. ${"Applications are invited from eligible candidates for the post of Assistant Executive Engineer. ".repeat(12)}`;
    expect(detectLanguage(long, "తె")).toBe("en");
  });

  it("detects Hindi and Urdu scripts", () => {
    expect(detectLanguage("खेती अगस्त 2026 पत्रिका")).toBe("hi");
    expect(detectLanguage("اردو کتاب برائے جماعت دہم")).toBe("ur");
  });

  it("returns en for empty input rather than throwing", () => {
    expect(detectLanguage(undefined, "", undefined)).toBe("en");
  });

  it("hasTelugu spots any Telugu at all", () => {
    expect(hasTelugu("Model paper తెలుగు")).toBe(true);
    expect(hasTelugu("Model paper")).toBe(false);
  });
});

describe("Indian date parsing", () => {
  it("reads day-first numeric dates in all three separators", () => {
    expect(parseIndianDate("31-10-2026")).toBe("2026-10-31");
    expect(parseIndianDate("30/11/2026")).toBe("2026-11-30");
    expect(parseIndianDate("03.02.2026")).toBe("2026-02-03");
  });

  it("reads 03-02-2026 as 3 February, not 2 March", () => {
    // Every portal in the registry is day-first. Getting this backwards
    // would silently mis-date a third of the catalog.
    expect(parseIndianDate("03-02-2026")).toBe("2026-02-03");
  });

  it("reads written months in both orders", () => {
    expect(parseIndianDate("31 October 2026")).toBe("2026-10-31");
    expect(parseIndianDate("31st Oct, 2026")).toBe("2026-10-31");
    expect(parseIndianDate("October 31, 2026")).toBe("2026-10-31");
  });

  it("rejects impossible and out-of-range dates", () => {
    expect(parseIndianDate("31-02-2026")).toBeNull();
    expect(parseIndianDate("45-10-2026")).toBeNull();
    expect(parseIndianDate("01-01-1899")).toBeNull();
    expect(parseIndianDate("no date here")).toBeNull();
  });
});

describe("expiry extraction", () => {
  it("finds a deadline behind an explicit cue", () => {
    expect(extractExpiryDate("PM-USP renewal", "Last date for student application: 31-10-2026")).toBe("2026-10-31");
  });

  it("takes the latest deadline when several are listed", () => {
    // The real NSP shape, including its two date formats on one page.
    const text = [
      "Last date for submission of application by the student: 31-10-2026",
      "Last date for institute verification: 15-11-2026",
      "Last date for L2 verification: 30/11/2026",
    ].join("\n");
    expect(extractExpiryDate("PM-USP", text)).toBe("2026-11-30");
  });

  it("ignores dates that are not deadlines", () => {
    // A G.O. date and an exam date are not expiry dates.
    const text = "G.O.Ms.No. 45 dated 12-03-2026. Examination will be held on 12-05-2026.";
    expect(extractExpiryDate("Notification", text)).toBeNull();
  });

  it("handles the APSCHE phrasing", () => {
    expect(extractExpiryDate("AP EAPCET 2026", "Last date for submission of online application 24-03-2026 (Tuesday)")).toBe("2026-03-24");
  });

  it("isExpired compares calendar days, not timestamps", () => {
    expect(isExpired("2026-08-29", "2026-08-30")).toBe(true);
    expect(isExpired("2026-08-30", "2026-08-30")).toBe(false);
    expect(isExpired("2026-08-31", "2026-08-30")).toBe(false);
    expect(isExpired(undefined, "2026-08-30")).toBe(false);
  });
});

describe("categorisation", () => {
  it("files an SSC model paper under school education", () => {
    const g = categorize("SSC Public Examination March 2026 Mathematics Model Question Paper", "Class 10 model paper", "", ["school"]);
    expect(g.category).toBe("school");
    expect(g.confidence).toBeGreaterThanOrEqual(CONFIDENCE_FLOOR);
  });

  it("files an EAPCET notification under entrance exams", () => {
    const g = categorize("AP EAPCET 2026 Notification", "Engineering and Agriculture entrance test", "", ["entrance"]);
    expect(g.category).toBe("entrance");
    expect(g.subcategory).toBe("engineering");
  });

  it("files a scholarship notice under scholarships", () => {
    const g = categorize("PM-USP Post Matric Scholarship 2026-27", "Fee reimbursement renewal", "", ["scholarships"]);
    expect(g.category).toBe("scholarships");
    expect(g.subcategory).toBe("post-matric");
  });

  it("files a crop advisory under agriculture", () => {
    const g = categorize("Package of Practices for Groundnut", "Sowing time and pest management for rainfed groundnut", "", ["agriculture"]);
    expect(g.category).toBe("agriculture");
  });

  it("weights the title above deep body text", () => {
    // A scholarship notice on government letterhead must not become a
    // "government" document because of its boilerplate.
    const body = "Government of Andhra Pradesh ".repeat(50) + "circular memo proceedings gazette";
    const g = categorize("National Scholarship Portal — apply for scholarship", "scholarship deadline", body, []);
    expect(g.category).toBe("scholarships");
  });

  it("reports low confidence for an unclassifiable title", () => {
    const g = categorize("Document 47", "", "", []);
    expect(g.confidence).toBeLessThan(CONFIDENCE_FLOOR);
  });

  it("uses the source's own categories as a prior", () => {
    const withPrior = categorize("Notice", "", "", ["agriculture"]);
    const without = categorize("Notice", "", "", []);
    expect(withPrior.confidence).toBeGreaterThan(without.confidence);
  });

  it("detects subject, class, exam and type", () => {
    expect(detectSubject("Class 10 Mathematics Model Paper")).toBe("mathematics");
    expect(detectSubject("సాంఘిక శాస్త్రం")).toBe("social-studies");
    expect(detectClassLevel("SSC Class X Telugu")).toBe("class-10");
    expect(detectClassLevel("Intermediate First Year Physics")).toBe("inter-1");
    expect(detectExam("AP EAPCET 2026 hall ticket")).toBe("AP EAPCET");
    expect(detectResourceType("Previous Year Question Paper 2025")).toBe("question-paper");
    expect(detectResourceType("Recruitment Notification No. 12/2026")).toBe("notification");
    expect(detectResourceType("Something neutral", "", "link")).toBe("link");
  });

  it("prefers the longer exam name when two match", () => {
    // "SSC" is a substring of the competitive-exam list and of "SSC CGL".
    expect(detectExam("SSC CGL 2026 notification")).toBe("SSC CGL");
  });
});

describe("URL canonicalisation", () => {
  it("strips tracking noise, fragments and www, and sorts params", () => {
    expect(canonicalizeUrl("http://WWW.Example.gov.in/a.pdf?utm_source=x&id=7#page=2")).toBe(
      "https://example.gov.in/a.pdf?id=7",
    );
  });

  it("collapses param order differences", () => {
    expect(canonicalizeUrl("https://e.gov.in/p?b=2&a=1")).toBe(canonicalizeUrl("https://e.gov.in/p?a=1&b=2"));
  });

  it("strips a trailing slash after a filename but keeps it on a directory", () => {
    expect(canonicalizeUrl("https://e.gov.in/a.pdf/")).toBe("https://e.gov.in/a.pdf");
    expect(canonicalizeUrl("https://e.gov.in/papers/")).toBe("https://e.gov.in/papers/");
  });

  it("does not throw on a malformed URL", () => {
    expect(canonicalizeUrl("not a url")).toBe("not a url");
  });
});

describe("duplicate detection", () => {
  it("matches on identical file hash", () => {
    const existing = [res({ id: "a", fileHash: "deadbeef" })];
    const dup = findDuplicate({ title: "Totally different name", originalUrl: "https://other.gov.in/z.pdf", fileHash: "deadbeef" }, existing);
    expect(dup?.reason).toBe("hash");
  });

  it("matches the same file behind different tracking params", () => {
    const existing = [res({ id: "a", originalUrl: "https://e.gov.in/a.pdf" })];
    const dup = findDuplicate({ title: "x", originalUrl: "https://www.e.gov.in/a.pdf?utm_source=news" }, existing);
    expect(dup?.reason).toBe("canonical-url");
  });

  it("needs BOTH title and text to agree before merging on similarity", () => {
    const existing = [
      res({ id: "a", title: "AP EAPCET 2026 Notification", textExcerpt: "engineering agriculture pharmacy common entrance test schedule application" }),
    ];
    // Similar title, different document. Must NOT be called a duplicate.
    const notDup = findDuplicate(
      { title: "AP EAPCET 2026 Notification Revised", originalUrl: "https://e.gov.in/rev.pdf", textExcerpt: "revised reservation policy for physically challenged candidates only" },
      existing,
    );
    expect(notDup).toBeNull();

    // Same title and same text: genuinely the same document, remirrored.
    const isDup = findDuplicate(
      { title: "AP EAPCET 2026 Notification", originalUrl: "https://mirror.gov.in/e.pdf", textExcerpt: "engineering agriculture pharmacy common entrance test schedule application" },
      existing,
    );
    expect(isDup?.reason).toBe("title-and-text");
  });

  it("returns null for a genuinely new document", () => {
    expect(findDuplicate({ title: "Brand new thing", originalUrl: "https://e.gov.in/new.pdf" }, [res()])).toBeNull();
  });

  it("title tokens drop boilerplate so it cannot create a match", () => {
    const tokens = titleTokens("Government of Andhra Pradesh Official PDF Download");
    expect(tokens.has("government")).toBe(false);
    expect(tokens.has("andhra")).toBe(false);
    expect(tokens.has("pdf")).toBe(false);
  });

  it("jaccard is 1 for identical sets and 0 for disjoint", () => {
    expect(jaccard(new Set(["a", "b"]), new Set(["a", "b"]))).toBe(1);
    expect(jaccard(new Set(["a"]), new Set(["b"]))).toBe(0);
    expect(jaccard(new Set(), new Set(["a"]))).toBe(0);
    expect(titleSimilarity("Mathematics model paper", "Mathematics model paper")).toBe(1);
  });
});

describe("taxonomy", () => {
  it("covers every category the brief lists", () => {
    const keys = CATEGORY_TREE.map((c) => c.key);
    for (const expected of [
      "school", "intermediate", "entrance", "competitive",
      "digital", "english", "agriculture", "careers", "scholarships", "government",
    ]) {
      expect(keys).toContain(expected);
    }
  });

  it("has every school subcategory the brief lists", () => {
    const school = CATEGORY_TREE.find((c) => c.key === "school")!;
    const subs = school.subcategories.map((s) => s.key);
    expect(subs).toEqual(["primary", "class-6", "class-7", "class-8", "class-9", "class-10", "ssc"]);
  });

  it("has every intermediate stream the brief lists", () => {
    const inter = CATEGORY_TREE.find((c) => c.key === "intermediate")!;
    const subs = inter.subcategories.map((s) => s.key);
    for (const s of ["first-year", "second-year", "mpc", "bipc", "cec", "mec"]) expect(subs).toContain(s);
  });

  it("has every competitive-exam subcategory the brief lists", () => {
    const comp = CATEGORY_TREE.find((c) => c.key === "competitive")!;
    const subs = comp.subcategories.map((s) => s.key);
    for (const s of ["appsc", "ssc-exam", "banking", "railways", "police", "defence", "other-govt"]) {
      expect(subs).toContain(s);
    }
  });

  it("uses unique subcategory keys within a category", () => {
    for (const cat of CATEGORY_TREE) {
      const keys = cat.subcategories.map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("labels fall back to the key rather than rendering undefined", () => {
    expect(categoryLabel("school")).toBe("School Education");
    expect(categoryLabel("school", "te")).toBe("పాఠశాల విద్య");
    expect(categoryLabel("nonsense")).toBe("nonsense");
    expect(subcategoryLabel("school", "class-10", "te")).toBe("10వ తరగతి");
    expect(subcategoryLabel("school", "nonsense")).toBe("nonsense");
    // An English-only subcategory falls back to English under a Telugu locale
    // rather than showing a blank.
    expect(subcategoryLabel("intermediate", "mpc", "te")).toBe("MPC");
  });
});
