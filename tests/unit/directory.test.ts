import { describe, expect, it } from "vitest";
import {
  DIRECTORY,
  HELPLINES,
  HUBS,
  hostOf,
  isAllowedUrl,
  byIds,
} from "@/lib/directory";

/**
 * These tests exist because the failure mode is not a broken page — it is a
 * villager typing their Aadhaar number into a site we sent them to.
 */
describe("the official directory only points at official addresses", () => {
  it("every officialUrl is on an allowlisted government or bank domain", () => {
    for (const e of DIRECTORY) {
      expect(isAllowedUrl(e.officialUrl), `${e.id} → ${e.officialUrl}`).toBe(true);
    }
  });

  it("rejects look-alike domains", () => {
    for (const bad of [
      "https://uidai-gov.in/",
      "https://www.gov.in.example.com/",
      "http://meeseva.apply-online.in/",
      "https://sbi.bank.in.evil.com/",
      "not a url",
    ]) {
      expect(isAllowedUrl(bad), bad).toBe(false);
    }
  });

  it("officialDomain always matches officialUrl", () => {
    for (const e of DIRECTORY) {
      expect(e.officialDomain, e.id).toBe(hostOf(e.officialUrl));
    }
  });

  it("ids are unique", () => {
    const ids = DIRECTORY.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("provenance is present on every entry", () => {
  it("source, sourceUrl and a sane lastVerified", () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const e of DIRECTORY) {
      expect(e.source, e.id).toBeTruthy();
      expect(e.sourceUrl, e.id).toMatch(/^https:\/\//);
      expect(e.lastVerified, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.lastVerified <= today, `${e.id} verified in the future`).toBe(true);
    }
  });

  it("helplines cite an official page", () => {
    for (const h of HELPLINES) {
      expect(h.number, h.id).toMatch(/^\d{3,12}$/);
      expect(isAllowedUrl(h.sourceUrl), h.id).toBe(true);
    }
  });
});

describe("hubs reference real entries", () => {
  it("no hub points at a missing id", () => {
    for (const hub of HUBS) {
      for (const group of hub.groups) {
        for (const id of group.ids ?? []) {
          expect(
            DIRECTORY.some((e) => e.id === id),
            `hub ${hub.slug} → ${id}`,
          ).toBe(true);
        }
      }
    }
  });

  it("every featured entry has a Telugu name", () => {
    for (const hub of HUBS) {
      for (const group of hub.groups) {
        for (const e of byIds(group.ids ?? [])) {
          expect(e.nameTe, `${hub.slug} → ${e.id}`).toBeTruthy();
        }
      }
    }
  });
});
