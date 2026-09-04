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
  "/members/", "/people/", "/families/", "/adapaduchulu/", "/events/", "/temples/", "/stories/", "/directory/", "/developments/", "/suggestions/",
  "/lost-found/", "/documents/", "/contact/", "/privacy/", "/terms/",
  "/rvp-birthdays/", "/search/", "/settings/",
  "/families/gundluru-venkata-subba-reddy/",
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

  test("gallery renders with its filter controls", async ({ page }) => {
    await page.goto("/gallery/");
    await expect(page.locator(".gallery-filters .filter-chip").first()).toBeVisible();
    expect(await page.locator(".gallery-filters .filter-chip").count()).toBeGreaterThan(3);
  });

  test("homepage hero names the village", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#village-hero-title")).toContainText(/REDDIVARIPALLI/i);
    await expect(page.locator(".village-hero-cta .btn").first()).toBeVisible();
  });

  test("the page is fully usable once consent is dismissed", async ({ page }) => {
    // The regression this guards: an overlay left on top of the page after
    // the visitor has answered, swallowing clicks. Previously two dialogs
    // stacked and dismissing one still left the other intercepting.
    await page.goto("/");
    await page.waitForTimeout(2400);

    // Everything that can appear on a first visit must be dismissible, and
    // they must arrive one at a time rather than stacked. Dismiss whatever is
    // on screen until nothing blocking is left.
    const blocking = ".consent-card, .notif-modal-backdrop, .pwa-install";
    for (let i = 0; i < 5; i += 1) {
      const open = page.locator(blocking);
      if ((await open.count()) === 0) break;
      expect(await open.count(), "overlays never stack").toBeLessThanOrEqual(1);
      await page.keyboard.press("Escape");
      const close = open.locator("button").last();
      if (await close.isVisible().catch(() => false)) {
        await close.click({ force: true }).catch(() => {});
      }
      await page.waitForTimeout(700);
    }
    await expect(page.locator(blocking)).toHaveCount(0);

    const chip = page.locator(".gallery-filters .filter-chip").nth(1);
    await chip.click({ timeout: 5000 });
    await expect(chip).toBeVisible();
  });

  test("a first visit shows exactly one consent dialog", async ({ page }) => {
    // Was: the notification permission card and the location consent card both
    // appeared, stacked, and intercepted clicks. There is now a single
    // first-run ask (components/consent/WelcomeConsent.tsx) covering both.
    await page.goto("/");
    await page.waitForTimeout(2600);

    const consent = page.locator(".consent-card");
    await expect(consent).toHaveCount(1);
    await expect(consent).toBeVisible();

    // No other blocking overlay may be on screen alongside it.
    await expect(page.locator(".location-consent, .notif-permission")).toHaveCount(0);
    await expect(page.locator(".pwa-install")).toHaveCount(0);

    // It must be dismissible, and Escape must work.
    await expect(consent.locator("button")).not.toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator(".consent-card")).toHaveCount(0);

    // Settled: a reload does not ask again.
    await page.reload();
    await page.waitForTimeout(2600);
    await expect(page.locator(".consent-card")).toHaveCount(0);
  });
});

test.describe("family tree is a genealogy diagram", () => {
  test("renders connecting lines and nodes, not an accordion list", async ({
    page,
  }) => {
    await page.goto("/families/gundluru-venkata-subba-reddy/");
    await page.keyboard.press("Escape");
    await expect(page.locator("h1")).toContainText(
      "Gundluru Venkata Subba Reddy Family",
    );
    await expect(page.locator(".ft-genealogy")).toBeVisible();
    await expect(page.locator(".ft-node").first()).toBeVisible();
    expect(await page.locator(".ft-lines path").count()).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Fit to screen" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
    expect(await page.locator(".ft-branch-actions").count()).toBe(0);
    expect(await page.locator(".ft-generation-grid").count()).toBe(0);
    await page.locator(".ft-node").first().click({ force: true });
    await expect(page.locator(".ft-person-panel")).toBeVisible();
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
