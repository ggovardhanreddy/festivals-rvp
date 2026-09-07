import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/", "/about/", "/people/", "/temples/", "/gallery/", "/contact/", "/te/",
  "/government/", "/banking/", "/safety/", "/search/", "/te/government/",
];

/**
 * Run the sweep with reduced motion.
 *
 * Not for coverage -- to remove a flake. The site animates entrances all over
 * (reveals, the consent sheet, hero settle), and axe measures whatever colour
 * an element has at the instant it runs. Catching a panel mid-fade yields a
 * blended foreground and background and a contrast "violation" that does not
 * exist once the transition finishes: a run of this sweep reported
 * .consent-option-btn at 2.22:1 with colours (#94aaa2 on #f5f3f0) that appear
 * nowhere in the stylesheet, and the same route passed on the next run.
 *
 * Every animation here honours prefers-reduced-motion, so emulating it settles
 * the page instead of guessing at a timeout, and tests the palette as authored.
 *
 * Applied per page rather than via test.use so it stays scoped to this spec:
 * the route and i18n specs should exercise the site as a visitor gets it.
 */

test.describe("accessibility", () => {
  for (const path of ROUTES) {
    test(`no serious or critical violations: ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const bad = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(
        bad.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join("\n"),
      ).toBe("");
    });
  }

  test("the Telugu calendar uses a valid ARIA grid", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/events/");
    const grid = page.locator('[role="grid"]').first();
    if ((await grid.count()) === 0) test.skip();
    // grid > row > gridcell. Before Phase 1A there were no rows at all, which
    // is what made aria-pressed on a gridcell invalid.
    const rows = grid.locator('[role="row"]');
    expect(await rows.count()).toBeGreaterThan(1);
    const cells = rows.nth(1).locator('[role="gridcell"]');
    expect(await cells.count()).toBe(7);
    expect(await grid.locator("[aria-pressed]").count()).toBe(0);
  });

  test("skip link is the first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const href = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    expect(href).toBe("#main-content");
  });
});
