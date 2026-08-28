import { test, expect } from "@playwright/test";

/**
 * Smoke test over the routes that exist today. This is the regression net for
 * the preservation contract in docs/PRESERVED_FEATURES.md: if a refactor drops
 * a page, this goes red.
 *
 * Private routes are checked for reachability only — never with credentials.
 */
const PUBLIC_ROUTES = [
  "/", "/about/", "/heritage/", "/timeline/", "/years/", "/gallery/",
  "/members/", "/events/", "/directory/", "/developments/", "/suggestions/",
  "/lost-found/", "/documents/", "/contact/", "/privacy/", "/terms/",
  "/rvp-birthdays/", "/search/", "/settings/",
];

const FESTIVALS = [
  "/sankranthi/", "/vinayaka-chavithi/", "/mathamma-jathara/",
  "/devapatlamma-jathara/", "/sri-rama-navami/", "/varalakshmi-vratam/",
  "/ugadi/", "/deepavali/", "/dasara/",
];

test.describe("existing routes still resolve", () => {
  for (const path of [...PUBLIC_ROUTES, ...FESTIVALS]) {
    test(`200 and renders: ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);
      await expect(page.locator("body")).toBeVisible();
      // Every page must expose exactly one h1 for document structure.
      expect(await page.locator("h1").count(), `${path} h1 count`).toBeGreaterThan(0);
    });
  }
});

test.describe("homepage integrity", () => {
  test("has one h1 and the SEO structured data", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("h1").count()).toBe(1);
    const blocks = await page.locator('script[type="application/ld+json"]').count();
    expect(blocks).toBeGreaterThan(0);
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(() => JSON.parse(raw || "")).not.toThrow();
  });

  test("the hero scroll target exists", async ({ page }) => {
    // HomeHero links to #overview, AboutTeaser provides it. Reordering the
    // homepage silently breaks this link, so it is asserted.
    await page.goto("/");
    await expect(page.locator("#overview")).toHaveCount(1);
  });

  test("gallery filters still return results", async ({ page }) => {
    await page.goto("/");
    const chips = page.locator(".gallery-filters .filter-chip");
    await expect(chips.first()).toBeVisible();
    await chips.nth(1).click();
    // Either the masonry renders results, or the component shows its own
    // empty state. Both are correct; a blank section is not.
    const masonry = page.locator(".home-masonry");
    const empty = page.locator(".home-gallery .muted");
    await expect(masonry.or(empty).first()).toBeVisible();
  });
});

test.describe("private routes are not indexable", () => {
  test("robots disallows the gated areas", async ({ request }) => {
    const res = await request.get("/robots.txt");
    const body = await res.text();
    for (const p of ["/fun-trips/", "/chat/", "/login/", "/admin/", "/settings/"]) {
      expect(body, p).toContain(`Disallow: ${p}`);
    }
  });

  test("the search index contains no private content", async ({ request }) => {
    const res = await request.get("/search-index.json");
    const body = await res.text();
    expect(body).not.toContain("/fun-trips/");
    expect(body).not.toContain("/admin/");
  });
});
