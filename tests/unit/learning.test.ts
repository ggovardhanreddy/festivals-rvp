import { describe, expect, it } from "vitest";
import {
  isPlayable,
  isPublished,
  mediaUrl,
  ordered,
  statusKey,
  text,
  type MediaAsset,
} from "@/lib/learning";
import { KIDS_ROUTES, isKidsLibrary } from "@/lib/kids/catalog";
import { ENGLISH_ALPHABET, TELUGU_CONSONANTS, TELUGU_VOWELS } from "@/lib/kids/alphabet";

const permitted = {
  grantedBy: "A Person",
  grantedOn: "2026-08-28",
};

describe("a recording is only playable with named permission", () => {
  it("refuses an asset with no permission at all", () => {
    expect(isPlayable({ type: "audio", src: "a.mp3" } as MediaAsset)).toBe(false);
  });

  it("refuses an asset whose permission has no named person", () => {
    expect(
      isPlayable({
        type: "audio",
        src: "a.mp3",
        permission: { grantedBy: "", grantedOn: "2026-08-28" },
      } as MediaAsset),
    ).toBe(false);
  });

  it("refuses an asset with permission but nothing to play", () => {
    expect(isPlayable({ type: "audio", permission: permitted } as MediaAsset)).toBe(false);
    expect(
      isPlayable({ type: "video", provider: "youtube", permission: permitted } as MediaAsset),
    ).toBe(false);
  });

  it("accepts a permitted recording and a permitted embed", () => {
    expect(isPlayable({ type: "audio", src: "a.mp3", permission: permitted })).toBe(true);
    expect(
      isPlayable({ type: "video", provider: "youtube", externalId: "x", permission: permitted }),
    ).toBe(true);
  });

  it("undefined is never playable", () => {
    expect(isPlayable(undefined)).toBe(false);
  });
});

describe("only published items render as content", () => {
  it("every other status is withheld", () => {
    for (const status of [
      "draft",
      "awaiting-permission",
      "awaiting-teacher-review",
      "coming-soon",
      "planned",
      undefined,
    ] as const) {
      expect(isPublished({ status }), String(status)).toBe(false);
    }
    expect(isPublished({ status: "published" })).toBe(true);
  });

  it("each held-back status explains what it is waiting on", () => {
    expect(statusKey("awaiting-permission")).toBe("kids.pending.sourced");
    expect(statusKey("awaiting-teacher-review")).toBe("kids.pending.reviewed");
    expect(statusKey("planned")).toBe("learn.status.planned");
    expect(statusKey("draft")).toBe("learn.status.draft");
  });

  it("published items sort ahead of held-back ones", () => {
    const items = [
      { id: "1", slug: "b", title: { en: "B" }, description: { en: "" }, status: "draft" as const },
      { id: "2", slug: "a", title: { en: "A" }, description: { en: "" }, status: "published" as const },
    ];
    expect(ordered(items).map((i) => i.id)).toEqual(["2", "1"]);
  });
});

describe("localised text falls back rather than showing a key", () => {
  it("uses Telugu when present and English when not", () => {
    expect(text({ en: "House", te: "ఇల్లు" }, "te")).toBe("ఇల్లు");
    expect(text({ en: "House" }, "te")).toBe("House");
    expect(text(undefined, "en")).toBe("");
  });
});

describe("media URLs", () => {
  it("passes an absolute URL through untouched", () => {
    expect(mediaUrl({ type: "audio", src: "https://cdn.example/x.mp3", permission: permitted })).toBe(
      "https://cdn.example/x.mp3",
    );
  });
  it("never produces a double slash from a key", () => {
    expect(mediaUrl({ type: "audio", src: "/audio/x.mp3", permission: permitted })).not.toContain("//audio");
  });
});

describe("the alphabet data is complete", () => {
  it("has the full Latin alphabet, each with a word", () => {
    expect(ENGLISH_ALPHABET).toHaveLength(26);
    for (const letter of ENGLISH_ALPHABET) {
      expect(letter.example, letter.glyph).toBeTruthy();
      expect(letter.emoji, letter.glyph).toBeTruthy();
    }
  });

  it("has the aksharamala as it is taught: 16 vowels, 36 consonants", () => {
    expect(TELUGU_VOWELS).toHaveLength(16);
    expect(TELUGU_CONSONANTS).toHaveLength(36);
  });

  it("every letter has a transliteration, and no glyph is empty", () => {
    for (const letter of [...ENGLISH_ALPHABET, ...TELUGU_VOWELS, ...TELUGU_CONSONANTS]) {
      expect(letter.glyph.length).toBeGreaterThan(0);
      expect(letter.roman.length).toBeGreaterThan(0);
    }
  });
});

describe("kids routing", () => {
  it("the library sections are routable and distinguished from activities", () => {
    for (const slug of ["stories", "rhymes", "science", "videos"]) {
      expect(KIDS_ROUTES).toContain(slug);
      expect(isKidsLibrary(slug)).toBe(true);
    }
    expect(isKidsLibrary("math")).toBe(false);
    expect(KIDS_ROUTES).toContain("alphabet");
  });
});
