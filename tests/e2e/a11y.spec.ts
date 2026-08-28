import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/about/", "/members/", "/events/", "/gallery/", "/contact/", "/te/"];

test.describe("accessibility", () => {
  for (const path of ROUTES) {
    test(`no serious or critical violations: ${path}`, async ({ page }) => {
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
