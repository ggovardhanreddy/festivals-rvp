import { describe, expect, it } from "vitest";
import { translate, interpolate, localeCoverage } from "@/lib/i18n";
import { en } from "@/lib/i18n/messages/en";
import { te } from "@/lib/i18n/messages/te";
import {
  DEFAULT_LOCALE, localeFromPath, stripLocale, withLocale, isLocale,
} from "@/lib/i18n/config";

describe("locale from path", () => {
  it("treats the bare tree as English", () => {
    expect(localeFromPath("/")).toBe("en");
    expect(localeFromPath("/about/")).toBe("en");
    // A path that merely starts with the letters "te" is not Telugu.
    expect(localeFromPath("/terms/")).toBe("en");
    expect(localeFromPath("/temples/")).toBe("en");
  });
  it("detects the Telugu tree", () => {
    expect(localeFromPath("/te")).toBe("te");
    expect(localeFromPath("/te/")).toBe("te");
    expect(localeFromPath("/te/about/")).toBe("te");
  });
});

describe("locale path helpers round-trip", () => {
  it("strips and re-adds the prefix", () => {
    expect(stripLocale("/te/about/")).toBe("/about/");
    expect(stripLocale("/about/")).toBe("/about/");
    expect(stripLocale("/te/")).toBe("/");
    expect(withLocale("/about/", "te")).toBe("/te/about/");
    expect(withLocale("/te/about/", "en")).toBe("/about/");
    expect(withLocale("/", "te")).toBe("/te/");
  });
  it("never loses the trailing slash", () => {
    for (const p of ["/", "/about/", "/te/", "/te/about/"]) {
      expect(withLocale(p, "te").endsWith("/")).toBe(true);
      expect(withLocale(p, "en").endsWith("/")).toBe(true);
    }
  });
});

describe("translate fallback chain", () => {
  it("returns the requested locale when present", () => {
    expect(translate("te", "nav.home")).toBe("హోమ్");
  });
  it("falls back to English, never a key name", () => {
    const onlyEn = Object.keys(en).find((k) => !(k in te))!;
    const out = translate("te", onlyEn);
    expect(out).toBe(en[onlyEn as keyof typeof en]);
    expect(out).not.toBe(onlyEn);
  });
  it("uses the caller fallback for an unknown key", () => {
    expect(translate("en", "does.not.exist", "Literal")).toBe("Literal");
  });
  it("resolves legacy href keys used by the header and footer", () => {
    // The header labels /members/ "People" and /about/ "Our Village"; the page
    // headings still read Members and Our Heritage. The aliases are what keeps
    // those two vocabularies from having to be the same word.
    expect(translate("en", "/members/")).toBe("People");
    expect(translate("te", "/members/")).toBe("మన వారు");
    expect(translate("en", "/about/")).toBe("Our Village");
    expect(translate("en", "/services/")).toBe("Village Services");
    expect(translate("en", "nav.members")).toBe("Members");
  });
  it("interpolates and leaves unknown placeholders visible", () => {
    expect(interpolate("{a} and {b}", { a: "1", b: "2" })).toBe("1 and 2");
    expect(interpolate("{a} and {b}", { a: "1" })).toBe("1 and {b}");
  });
});

describe("catalogue integrity", () => {
  it("every Telugu key exists in English", () => {
    const extra = Object.keys(te).filter((k) => !(k in en));
    expect(extra).toEqual([]);
  });
  it("no message is an empty string", () => {
    for (const [k, v] of Object.entries({ ...en, ...te })) {
      expect(v, k).not.toBe("");
    }
  });
  it("reports real coverage", () => {
    const c = localeCoverage("te");
    expect(c.total).toBe(Object.keys(en).length);
    expect(c.translated).toBeGreaterThan(0);
    expect(localeCoverage(DEFAULT_LOCALE).pct).toBe(100);
  });
  it("isLocale rejects junk", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
