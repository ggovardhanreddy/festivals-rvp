import { test, expect } from "@playwright/test";

test.describe("language architecture", () => {
  test("English stays at the root", async ({ page }) => {
    await page.goto("/");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
  });

  test("Telugu is served from /te/", async ({ page }) => {
    const res = await page.goto("/te/");
    expect(res?.status()).toBeLessThan(400);
    // LanguageProvider sets this from the URL after hydration.
    await expect(page.locator("html")).toHaveAttribute("lang", "te");
  });

  test("the Telugu page renders Telugu chrome", async ({ page }) => {
    await page.goto("/te/");
    const text = await page.locator("body").innerText();
    expect(/[ఀ-౿]/.test(text), "expected Telugu script on /te/").toBe(true);
  });

  test("Telugu text resolves to the self-hosted Telugu face", async ({ page }) => {
    await page.goto("/te/");
    const family = await page.evaluate(() => {
      const el = document.createElement("span");
      el.lang = "te";
      el.textContent = "రెడ్డివారిపల్లి";
      document.body.appendChild(el);
      const f = getComputedStyle(el).fontFamily;
      el.remove();
      return f;
    });
    // Fails loudly if the font variable did not apply — the exact silent
    // breakage that left Telugu on a system fallback before Phase 1A.
    expect(family.toLowerCase()).toContain("telugu");
  });

  test("hreflang is only emitted where a translation exists", async ({ page }) => {
    await page.goto("/");
    const alts = await page.locator('link[rel="alternate"][hreflang]').all();
    const pairs = await Promise.all(
      alts.map(async (a) => [await a.getAttribute("hreflang"), await a.getAttribute("href")]),
    );
    const langs = pairs.map((p) => p[0]);
    expect(langs).toContain("te");

    // A route with no Telugu version must NOT advertise one.
    await page.goto("/about/");
    const aboutAlts = await page.locator('link[rel="alternate"][hreflang="te"]').count();
    expect(aboutAlts, "/about/ has no Telugu page yet").toBe(0);
  });

  test("the switcher never links to a page that 404s", async ({ page, request }) => {
    await page.goto("/about/");
    const links = await page.locator('a[hreflang="te"]').all();
    for (const link of links) {
      const href = await link.getAttribute("href");
      if (!href) continue;
      const res = await request.get(href);
      expect(res.status(), `${href} from /about/`).toBeLessThan(400);
    }
  });
});
