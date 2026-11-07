import { describe, expect, it } from "vitest";
import { selectLatestMemories } from "@/lib/content";
import type { MediaWithAlbum } from "@/lib/types";

function item(id: string, albumSlug: string, year: string, date: string): MediaWithAlbum {
  return {
    id,
    file: `/x/${id}.jpg`,
    thumb: `/x/${id}.jpg`,
    type: "image",
    title: id,
    date,
    tags: [],
    album: {
      year,
      slug: albumSlug,
      title: `${albumSlug} ${year}`,
      category: "Festivals",
      festival: undefined,
      media: [],
      description: "",
      createdAt: "",
      updatedAt: "",
      bucket: "dasara",
      isPublished: true,
      location: undefined,
      contentType: undefined,
      contentTypeDetail: undefined,
      showInGallery: undefined,
      minAge: undefined,
    },
  } as unknown as MediaWithAlbum;
}

describe("latest memories selection", () => {
  it("prefers unique albums before filling duplicates", () => {
    const input = [
      item("a1", "album-a", "2026", "2026-11-08"),
      item("a2", "album-a", "2026", "2026-11-07"),
      item("b1", "album-b", "2026", "2026-11-06"),
      item("c1", "album-c", "2026", "2026-11-05"),
    ];
    const out = selectLatestMemories(input, 3);
    expect(out.map((i) => `${i.album.slug}:${i.id}`)).toEqual([
      "album-a:a1",
      "album-b:b1",
      "album-c:c1",
    ]);
  });
});
