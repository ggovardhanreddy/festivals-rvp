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

/**
 * Invalid tag nesting, checked in a real parser.
 *
 * A <div> inside a <button> or a <span> is flow content where only phrasing
 * content is allowed. The server emits the string React rendered, the
 * browser's parser rearranges it, and the DOM no longer matches what React
 * expects -- hydration fails with error #418 and the whole subtree is thrown
 * away and re-rendered on the client. It is silent apart from that one
 * minified console error, and it only appeared on family tree nodes that had
 * a photograph, which is why it survived every static check.
 *
 * Asserted against the parsed DOM on purpose: that is the thing React
 * compares against, and no amount of source-grepping sees what the parser did.
 */
/**
 * /gallery/ and /temples/ are deliberately absent.
 *
 * Their album and festival cards are <button> elements containing <h4> and
 * <p>. That is the same invalid nesting, but fixing it means changing what
 * those cards ARE -- a button cannot hold a heading, so the markup has to
 * become a container with a button inside, or an <a>, whose content model is
 * transparent and would make the existing children legal. That is a real
 * change to keyboard and focus behaviour, not a wrapper swap, so it is left
 * for its own pass rather than smuggled in here.
 */
const NESTING_ROUTES = [
  "/",
  "/people/",
  "/families/gundluru-venkata-subba-reddy/",
  "/families/gundluru-konda-reddy/",
];

test.describe("HTML nesting stays valid", () => {
  for (const path of NESTING_ROUTES) {
    test(`no flow content inside phrasing content: ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const offenders = await page.evaluate(() => {
        const FLOW = "div,p,ul,ol,section,article,h1,h2,h3,h4,h5,h6,table,form,footer,header,nav,main,aside,blockquote,pre,dl,li";
        const out: string[] = [];
        // No <a> here: its content model is transparent, so a <div> inside a
        // link that sits in flow content is valid HTML.
        for (const host of document.querySelectorAll("button,span,label,em,strong,small")) {
          for (const child of host.querySelectorAll(FLOW)) {
            out.push(
              `<${child.tagName.toLowerCase()} class="${child.className}"> inside ` +
                `<${host.tagName.toLowerCase()} class="${host.className}">`,
            );
          }
        }
        return [...new Set(out)];
      });
      expect(offenders.join("\n")).toBe("");
    });
  }
});

/**
 * Hydration must not fail.
 *
 * The strongest guard in this file, because it catches the whole class rather
 * than one instance. A hydration mismatch is nearly silent in production: one
 * minified "error #418" in the console, no visual break, and React quietly
 * throws away the server-rendered tree and rebuilds it on the client -- which
 * costs exactly the work that server rendering was there to save.
 *
 * It went unnoticed on every page of this site until a console log was read by
 * hand. MoreSheet returned null on the server and a portal on the client's
 * first render, so <body>'s child list disagreed and the entire body tree was
 * discarded on load.
 */
test.describe("the page hydrates cleanly", () => {
  for (const path of NESTING_ROUTES) {
    test(`no uncaught errors on load: ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]!));
      page.on("console", (m) => {
        // Asset 404s are environment noise (media lives on R2); React's
        // hydration and rendering errors are not.
        if (m.type() === "error" && !/Failed to load resource|bad HTTP response/.test(m.text())) {
          errors.push(`console: ${m.text().split("\n")[0]}`);
        }
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForTimeout(2500);
      expect(errors.join("\n")).toBe("");
    });
  }
});
