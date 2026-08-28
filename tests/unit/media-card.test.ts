import { describe, expect, it } from "vitest";
import { toMediaCards } from "@/lib/media-card";
import type { Album, MediaWithAlbum } from "@/lib/types";

function album(n: number): Album {
  return {
    year: "2026", category: "Festivals", slug: "vinayaka-chavithi",
    title: "Vinayaka Chavithi", description: "long description ".repeat(20),
    published: true, order: 0, bucket: "vinayaka-chavithi",
    media: Array.from({ length: n }, (_, i) => ({
      id: `m${i}`, file: `/images/${i}.webp`, thumb: `/thumbs/${i}.webp`,
      type: "image" as const, title: `Photo ${i}`, date: "2026-01-01", tags: [],
      sha256: "a".repeat(64), phash: "b".repeat(16),
    })),
  };
}

describe("toMediaCards", () => {
  it("drops the nested album media array", () => {
    const a = album(100);
    const items: MediaWithAlbum[] = a.media.map((m) => ({ ...m, album: a }));
    const cards = toMediaCards(items);
    expect(cards).toHaveLength(100);
    for (const c of cards) expect(c.album.media).toEqual([]);
  });

  it("shrinks the serialised payload by an order of magnitude", () => {
    const a = album(100);
    const items: MediaWithAlbum[] = a.media.map((m) => ({ ...m, album: a }));
    const before = JSON.stringify(items).length;
    const after = JSON.stringify(toMediaCards(items)).length;
    expect(after).toBeLessThan(before / 10);
  });

  it("keeps every field the gallery renders", () => {
    const a = album(3);
    const cards = toMediaCards(a.media.map((m) => ({ ...m, album: a })));
    const c = cards[0]!;
    expect(c.id).toBeDefined();
    expect(c.file).toBeDefined();
    expect(c.thumb).toBeDefined();
    expect(c.type).toBe("image");
    expect(c.title).toBeDefined();
    expect(Array.isArray(c.tags)).toBe(true);
    // Filters read these two; losing them would silently break the gallery.
    expect(c.album.year).toBe("2026");
    expect(c.album.bucket).toBe("vinayaka-chavithi");
  });

  it("strips server-only hash fields", () => {
    const a = album(2);
    const cards = toMediaCards(a.media.map((m) => ({ ...m, album: a })));
    expect(JSON.stringify(cards)).not.toContain("aaaaaaaa");
    expect(JSON.stringify(cards)).not.toContain("bbbbbbbb");
  });

  it("preserves the album count that AlbumCard displays", () => {
    const a = album(42);
    const cards = toMediaCards(a.media.map((m) => ({ ...m, album: a })));
    expect(cards[0]!.album.mediaCount).toBe(42);
  });

  it("reuses one album object per source album", () => {
    const a = album(5);
    const cards = toMediaCards(a.media.map((m) => ({ ...m, album: a })));
    expect(cards[0]!.album).toBe(cards[4]!.album);
  });
});
