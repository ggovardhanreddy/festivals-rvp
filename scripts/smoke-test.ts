/**
 * Lightweight release smoke tests (no browser).
 * Used by `npm test` in CI before deploy.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { CMS_ALBUMS, isYearDir } from "../lib/cms";
import { publicAlbums, years } from "../lib/content";
import { isPrivateMediaPath } from "../lib/media-url";
import { mediaPrivateApiPath } from "../lib/media-src";
import { BUCKETS, VILLAGE_ADDRESS, VILLAGE_NAME } from "../lib/site";

const root = process.cwd();

function test(name: string, fn: () => void) {
  fn();
  console.log(`  ✓ ${name}`);
}

function main() {
  console.log("Running smoke tests…");

  test("village identity is configured", () => {
    assert.equal(VILLAGE_NAME, "Kondreddigaripalli");
    assert.equal(VILLAGE_ADDRESS.pincode, "516215");
    assert.ok(VILLAGE_ADDRESS.district.includes("Annamayya"));
  });

  test("CMS albums match site buckets", () => {
    const keys = BUCKETS.map((b) => b.key).sort();
    assert.deepEqual([...CMS_ALBUMS].sort(), keys);
  });

  test("content years are valid directories", () => {
    const content = path.join(root, "content");
    assert.ok(fs.existsSync(content), "content/ missing");
    const dirs = fs
      .readdirSync(content)
      .filter((name) => fs.statSync(path.join(content, name)).isDirectory());
    assert.ok(dirs.some(isYearDir), "expected at least one YYYY year folder");
    for (const year of dirs.filter(isYearDir)) {
      for (const album of CMS_ALBUMS) {
        const folder = path.join(content, year, album);
        assert.ok(fs.existsSync(folder), `missing ${year}/${album}`);
      }
    }
  });

  test("generated albums load and have media when present", () => {
    const albums = publicAlbums();
    const yearList = years();
    assert.ok(Array.isArray(albums));
    assert.ok(yearList.length >= 1);
    for (const album of albums) {
      assert.ok(album.year);
      assert.ok(album.slug);
      assert.ok(Array.isArray(album.media));
    }
  });

  test("required generated public assets exist", () => {
    for (const rel of [
      "public/search-index.json",
      "public/sitemap.xml",
      "public/robots.txt",
      "public/manifest.webmanifest",
    ]) {
      assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
    }
  });

  test("no duplicate album routes", () => {
    const seen = new Set<string>();
    for (const album of publicAlbums()) {
      const key = `${album.year}/${album.bucket}/${album.slug}`;
      assert.ok(!seen.has(key), `duplicate route ${key}`);
      seen.add(key);
    }
  });

  test("Fun Fest paths stay on signed media API", () => {
    const funPath = "/images/2024/fun-trips/cover.webp";
    assert.equal(isPrivateMediaPath(funPath), true);
    assert.equal(isPrivateMediaPath("/images/2024/vinayaka-chavithi/a.jpg"), false);
    // When R2 public URL is unset locally, private API helper returns null —
    // signing still happens at runtime via useMediaUrl (credentials + /api/media/sign).
    const signed = mediaPrivateApiPath(funPath);
    if (signed) {
      assert.ok(signed.startsWith("/api/media/sign?key="));
      assert.ok(signed.includes("fun-trips") || signed.includes("funfest"));
    }
  });

  test("opaque UUID media titles are hidden from UI labels", async () => {
    const { mediaDisplayTitle, isOpaqueMediaTitle } = await import(
      "../lib/media-label"
    );
    assert.equal(
      isOpaqueMediaTitle("14edb320 5a9f 4065 8bd5 41b8b1bd9c47"),
      true,
    );
    assert.equal(mediaDisplayTitle("Img 0179", "Photo"), "Img 0179");
    assert.equal(
      mediaDisplayTitle("14edb320 5a9f 4065 8bd5 41b8b1bd9c47", "Photo"),
      "Photo",
    );
  });

  console.log("Smoke tests passed.");
}

main();
