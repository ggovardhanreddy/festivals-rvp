import { describe, expect, it } from "vitest";
import {
  filterPublicMedia,
  isPublicMedia,
  shouldWatermarkMedia,
} from "@/lib/media-protection";
import type { Media, MediaProtection } from "@/lib/types";

function photo(id: string, file = `/images/${id}.webp`): Media {
  return {
    id,
    file,
    thumb: file,
    type: "image",
    title: id,
    date: "2026-01-01",
    tags: [],
  };
}

describe("media protection", () => {
  it("treats unmarked photographs as public", () => {
    expect(isPublicMedia(photo("a"))).toBe(true);
  });

  it("hides private overlay photographs from public listings", () => {
    const rules: MediaProtection[] = [
      { id: "secret", visibility: "private", watermark: true },
    ];
    const items = [photo("secret"), photo("open")];
    expect(filterPublicMedia(items, rules).map((item) => item.id)).toEqual([
      "open",
    ]);
  });

  it("does not expose private file paths in the filtered list", () => {
    const rules: MediaProtection[] = [
      {
        id: "/images/family.webp",
        visibility: "private",
        watermark: true,
      },
    ];
    const hidden = photo("fam", "/images/family.webp");
    expect(filterPublicMedia([hidden], rules)).toEqual([]);
  });

  it("follows per-image watermark when a rule exists", () => {
    const rules: MediaProtection[] = [
      { id: "a", visibility: "public", watermark: false },
    ];
    expect(shouldWatermarkMedia(photo("a"), rules, { watermarkEnabled: true })).toBe(
      false,
    );
    expect(shouldWatermarkMedia(photo("b"), rules, { watermarkEnabled: true })).toBe(
      true,
    );
  });
});
