import { describe, expect, it } from "vitest";
import {
  ACCESS_LABEL,
  AUTHORS,
  DHARMA_ABOUT,
  DHARMA_CONCEPTS,
  DHARMA_PAGES,
  DHARMA_PAGE_SLUGS,
  GITA,
  GITA_CHAPTER_SLUGS,
  MAHABHARATAM,
  PURANAS,
  RAMAYANAM,
  SLOKAS,
  SRI_SRI_PAGE,
  UPANISHADS,
  VEDAS,
  dharmaPage,
  gitaChapter,
  isPublicDomainInIndia,
  publicDomainFrom,
} from "@/lib/dharma";
import { DEVOTIONAL_MUSIC } from "@/lib/dharma/culture";

const ALL = [DHARMA_ABOUT, ...Object.values(DHARMA_PAGES), SRI_SRI_PAGE];

describe("Indian copyright arithmetic", () => {
  it("gives lifetime plus sixty years from the end of the year of death", () => {
    // Death 1965 → term ends 31 Dec 2025 → free in 2026.
    expect(isPublicDomainInIndia(1965, 2026)).toBe(true);
    // Death 1966 → free only from 2027.
    expect(isPublicDomainInIndia(1966, 2026)).toBe(false);
    expect(isPublicDomainInIndia(1966, 2027)).toBe(true);
  });

  it("treats an unknown death year as not public domain", () => {
    // The safe answer, and the one that keeps an unresearched author off the site.
    expect(isPublicDomainInIndia(undefined, 2026)).toBe(false);
  });

  it("states the year a work becomes free", () => {
    expect(publicDomainFrom(1983)).toBe("1 January 2044");
    expect(publicDomainFrom(1971)).toBe("1 January 2032");
    expect(publicDomainFrom(1976)).toBe("1 January 2037");
  });
});

describe("the authors table matches the law", () => {
  it("marks every author consistently with their year of death", () => {
    for (const a of AUTHORS) {
      expect(a.publicDomain, `${a.name} (died ${a.died})`).toBe(
        isPublicDomainInIndia(a.died, 2026),
      );
    }
  });

  it("gives every restricted author the date they become free", () => {
    for (const a of AUTHORS.filter((x) => !x.publicDomain)) {
      expect(a.publicDomainFrom, a.name).toBeTruthy();
      expect(a.publicDomainFrom).toBe(publicDomainFrom(a.died!));
    }
  });

  it("holds the three modern authors most often assumed to be free", () => {
    // These feel like classics and are not. Getting any of them wrong would
    // put in-copyright text on a village website.
    const held = Object.fromEntries(AUTHORS.map((a) => [a.slug, a]));
    expect(held.jashuva!.publicDomain).toBe(false);
    expect(held.jashuva!.publicDomainFrom).toBe("1 January 2032");
    expect(held.viswanatha!.publicDomain).toBe(false);
    expect(held.viswanatha!.publicDomainFrom).toBe("1 January 2037");
    expect(held.krishnasastri!.publicDomain).toBe(false);
    expect(held.krishnasastri!.publicDomainFrom).toBe("1 January 2041");
  });

  it("frees the medieval and early-modern poets", () => {
    const free = AUTHORS.filter((a) => a.publicDomain).map((a) => a.slug);
    for (const s of ["annamayya", "potana", "kavitrayam", "molla", "ramadasu", "vemana", "thyagaraja", "gurajada", "veeresalingam"]) {
      expect(free).toContain(s);
    }
  });

  it("never offers a source for an author still in copyright", () => {
    // A "where to read this" link beside a restricted author would invite
    // exactly the copying the flag exists to prevent.
    for (const a of AUTHORS.filter((x) => !x.publicDomain)) {
      expect(a.sources, a.name).toHaveLength(0);
    }
  });
});

describe("Sri Sri", () => {
  it("carries no poetry, only facts about the work", () => {
    const text = [SRI_SRI_PAGE.summary, ...SRI_SRI_PAGE.body].join(" ");
    // The page must state the constraint, so nobody editing it later removes
    // the reason and then adds a poem.
    expect(text).toContain("1 January 2044");
    expect(text).toContain("Copyright Act");
  });

  it("names the publisher to approach for permission", () => {
    expect(SRI_SRI_PAGE.body.join(" ")).toContain("Visalaandhra");
  });

  it("offers only embeds, never a hosted copy", () => {
    for (const s of SRI_SRI_PAGE.sources) {
      expect(s.access, s.label).not.toBe("open");
    }
  });

  it("has a copyright division so the position is visible on the page", () => {
    const slugs = SRI_SRI_PAGE.divisions?.map((d) => d.slug) ?? [];
    expect(slugs).toContain("copyright");
  });
});

describe("source access verdicts", () => {
  it("marks only Wikisource as hostable", () => {
    // Exactly one source in the whole library grants a licence we can host
    // under. If a second ever appears, it should be a deliberate decision.
    const open = ALL.flatMap((e) => e.sources).filter((s) => s.access === "open");
    expect(open.length).toBeGreaterThan(0);
    for (const s of open) {
      expect(s.url, s.label).toContain("wikisource.org");
    }
  });

  it("never marks TTD, Andhra Bharati, sanskritdocuments or vedabase as open", () => {
    const restricted = ["tirumala.org", "andhrabharati.com", "sanskritdocuments.org", "vedabase.io", "annamayya.org", "gitasupersite"];
    for (const s of ALL.flatMap((e) => e.sources)) {
      if (restricted.some((host) => s.url.includes(host))) {
        expect(s.access, `${s.label} — ${s.url}`).not.toBe("open");
      }
    }
  });

  it("marks YouTube sources as embed, never as a download", () => {
    for (const s of ALL.flatMap((e) => e.sources)) {
      if (s.url.includes("youtube.com")) expect(s.access, s.label).toBe("embed");
    }
  });

  it("gives every source a licence line and an https URL", () => {
    for (const s of ALL.flatMap((e) => e.sources)) {
      expect(s.licence.trim().length, s.label).toBeGreaterThan(8);
      expect(s.url.startsWith("https://"), `${s.label}: ${s.url}`).toBe(true);
    }
  });

  it("labels all three access states", () => {
    expect(ACCESS_LABEL.open).toBe("Freely licensed");
    expect(ACCESS_LABEL.link).toBe("Read at the source");
    expect(ACCESS_LABEL.embed).toBe("Plays here");
  });
});

describe("the Bhagavad Gita", () => {
  it("has all eighteen chapters, numbered 1 to 18 in order", () => {
    expect(GITA_CHAPTER_SLUGS).toEqual(
      Array.from({ length: 18 }, (_, i) => String(i + 1)),
    );
  });

  it("totals seven hundred verses", () => {
    const total = (GITA.divisions ?? []).reduce((n, d) => n + (d.verses ?? 0), 0);
    expect(total).toBe(700);
  });

  it("gives every chapter a name in three forms and an introduction", () => {
    for (const d of GITA.divisions ?? []) {
      expect(d.name.trim(), `chapter ${d.slug} Telugu name`).not.toBe("");
      expect(d.nameRoman.trim(), `chapter ${d.slug} roman`).not.toBe("");
      expect(d.nameEnglish.trim(), `chapter ${d.slug} english`).not.toBe("");
      expect(d.intro.length, `chapter ${d.slug} intro`).toBeGreaterThan(40);
    }
  });

  it("looks a chapter up by number and refuses one that does not exist", () => {
    expect(gitaChapter("2")?.nameRoman).toBe("Sankhya Yoga");
    expect(gitaChapter("11")?.nameRoman).toBe("Vishwarupa Darshana Yoga");
    expect(gitaChapter("19")).toBeUndefined();
    expect(gitaChapter("0")).toBeUndefined();
  });
});

describe("the rest of the library", () => {
  it("has the four Vedas", () => {
    expect(VEDAS.divisions?.map((d) => d.slug)).toEqual(["rig", "yajur", "sama", "atharva"]);
  });

  it("has the eleven principal Upanishads §6 lists", () => {
    const slugs = UPANISHADS.divisions?.map((d) => d.slug) ?? [];
    for (const s of ["isha", "kena", "katha", "prashna", "mundaka", "mandukya", "taittiriya", "aitareya", "chandogya", "brihadaranyaka", "shvetashvatara"]) {
      expect(slugs).toContain(s);
    }
    expect(slugs).toHaveLength(11);
  });

  it("has the seven Ramayana kandas §8 lists", () => {
    expect(RAMAYANAM.divisions?.map((d) => d.slug)).toEqual([
      "bala", "ayodhya", "aranya", "kishkindha", "sundara", "yuddha", "uttara",
    ]);
  });

  it("notes that the Uttara Kanda is disputed rather than presenting it flatly", () => {
    const uttara = RAMAYANAM.divisions?.find((d) => d.slug === "uttara");
    expect(uttara?.intro.toLowerCase()).toContain("later addition");
  });

  it("has Mahabharata parvas including the Gita's own", () => {
    const slugs = MAHABHARATAM.divisions?.map((d) => d.slug) ?? [];
    expect(slugs).toContain("bhishma");
    expect(slugs).toContain("shanti");
  });

  it("has the Puranas §9 lists", () => {
    const slugs = PURANAS.divisions?.map((d) => d.slug) ?? [];
    for (const s of ["bhagavata", "vishnu", "shiva", "devi-bhagavatam", "skanda", "markandeya", "garuda", "padma"]) {
      expect(slugs).toContain(s);
    }
  });

  it("has every sloka category §10 lists", () => {
    const slugs = SLOKAS.divisions?.map((d) => d.slug) ?? [];
    for (const s of ["ganesha", "shiva", "vishnu", "lakshmi", "saraswati", "devi", "hanuman", "surya", "navagraha", "guru", "morning", "evening", "daily", "stotrams", "temple"]) {
      expect(slugs).toContain(s);
    }
  });

  it("has the music categories §11 lists", () => {
    const slugs = DEVOTIONAL_MUSIC.divisions?.map((d) => d.slug) ?? [];
    for (const s of ["annamayya", "thyagaraja", "ramadasu", "bhajans", "keerthanas", "harikatha", "temple", "festival"]) {
      expect(slugs).toContain(s);
    }
  });

  it("explains on the music page why recordings are not hosted", () => {
    const text = DEVOTIONAL_MUSIC.body.join(" ");
    expect(text).toContain("sixty years");
    expect(text).toContain("never downloads audio");
    // And the worked example, because the abstract rule is easy to nod at and
    // the concrete one is what stops someone uploading an MP3.
    expect(text).toContain("2039");
  });

  it("has every concept §4 lists", () => {
    const slugs = DHARMA_CONCEPTS.map((c) => c.slug);
    for (const s of ["dharma", "karma", "moksha", "bhakti", "jnana", "seva", "yoga", "dhyana", "guru", "samskaras", "temple"]) {
      expect(slugs).toContain(s);
    }
  });
});

describe("page integrity", () => {
  it("resolves every /dharma/ slug to an entry", () => {
    for (const slug of DHARMA_PAGE_SLUGS) {
      expect(dharmaPage(slug), slug).toBeDefined();
    }
    expect(dharmaPage("nonsense")).toBeUndefined();
  });

  it("gives every page a summary, a body and at least one source", () => {
    for (const e of ALL) {
      expect(e.summary.length, e.slug).toBeGreaterThan(20);
      expect(e.body.length, e.slug).toBeGreaterThan(1);
      expect(e.sources.length, e.slug).toBeGreaterThan(0);
    }
  });

  it("points every related link at a path this site builds", () => {
    const built = new Set([
      "/dharma/", "/dharma/knowledge/", "/telugu-culture/", "/telugu-culture/literature/",
      "/telugu-culture/sri-sri/", "/spiritual-heritage/", "/events/", "/gallery/", "/contact/",
      "/heritage/", "/about/", "/members/",
      ...DHARMA_PAGE_SLUGS.map((s) => `/dharma/${s}/`),
      ...["poetry", "stories", "spiritual"].map((v) => `/telugu-culture/${v}/`),
    ]);
    for (const e of ALL) {
      for (const r of e.related ?? []) {
        expect(built.has(r.href), `${e.slug} → ${r.href}`).toBe(true);
      }
    }
  });

  it("gives the Telugu title where one is offered", () => {
    for (const e of ALL) {
      if (e.titleTe !== undefined) expect(e.titleTe.trim(), e.slug).not.toBe("");
    }
  });
});
