import { expect, test } from "@playwright/test";

/**
 * The official-resource directory, end to end.
 *
 * The assertions are chosen around the harm each one prevents: a link that
 * leaves the site without saying so, a page that forgets the "we never ask
 * for your OTP" banner, an external link without rel="noopener", a Telugu
 * page that is really an English page.
 */
const HUBS = ["/government/", "/banking/", "/government/documents/"];

test.describe("official resource hubs", () => {
  for (const path of HUBS) {
    test(`renders with official links and a safety banner: ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".safety-banner")).toHaveCount(1);

      const links = page.locator(".oflink");
      expect(await links.count(), `${path} has official links`).toBeGreaterThan(3);

      // Every destination is an allowlisted official domain, opened safely.
      const hrefs = await links.evaluateAll((els) =>
        els.map((e) => ({
          href: (e as HTMLAnchorElement).href,
          target: (e as HTMLAnchorElement).target,
          rel: (e as HTMLAnchorElement).rel,
        })),
      );
      for (const l of hrefs) {
        const host = new URL(l.href).hostname;
        expect(
          /\.(gov\.in|nic\.in|bank\.in)$/.test(host) ||
            /^(www\.)?(rbi\.org\.in|pfrda\.org\.in|npci\.org\.in|bhimupi\.org\.in|nabard\.org|nta\.ac\.in|aicte-india\.org)$/.test(host) ||
            host === "nptel.ac.in" ||
            host === "ndl.iitkgp.ac.in",
          `${path}: ${host} is not an official domain`,
        ).toBe(true);
        expect(l.target, host).toBe("_blank");
        expect(l.rel, host).toContain("noopener");
      }

      // The domain is shown before the visitor clicks.
      expect(await page.locator(".oflink-domain").count()).toBe(await links.count());
      // And so is the provenance line.
      expect(await page.locator(".oflink-source").count()).toBe(await links.count());
    });
  }

  test("the banking page carries the credential warning", async ({ page }) => {
    await page.goto("/banking/");
    const banner = page.locator(".safety-banner--bank");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/OTP/i);
    await expect(banner).toContainText(/PIN/i);
    // No credential field may exist anywhere on the page.
    expect(await page.locator('input[type="password"]').count()).toBe(0);
    expect(await page.locator("iframe").count()).toBe(0);
  });

  test("filtering a hub narrows it and can come up empty honestly", async ({ page }) => {
    await page.goto("/government/");
    const filter = page.locator("#dirhub-filter");
    // The filter is React state, so typing into it before hydration sets the
    // DOM value and nothing else. Wait for the island to be live.
    await page.waitForFunction(
      () => document.documentElement.dataset.hydrated === "1",
      undefined,
      { timeout: 15_000 },
    );
    const before = await page.locator(".oflink").count();
    expect(before).toBeGreaterThan(10);

    // Filtering runs through useDeferredValue, so poll rather than reading
    // the count once — the assertion is "it narrows", not "it narrows
    // synchronously".
    await filter.fill("aadhaar");
    await expect
      .poll(() => page.locator(".oflink").count(), { timeout: 5000 })
      .toBeLessThan(before);
    await expect(page.locator(".oflink").first()).toContainText(/aadhaar/i);

    await filter.fill("zzzzqqqq");
    await expect(page.locator(".careers-empty")).toBeVisible();
    await expect(page.locator(".oflink")).toHaveCount(0);
  });

  test("Telugu hubs render Telugu, not English", async ({ page }) => {
    await page.goto("/te/government/");
    await expect(page.locator("h1")).toContainText("ప్రభుత్వ");
    await expect(page.locator(".safety-banner")).toContainText("OTP");
    expect(await page.locator(".oflink").count()).toBeGreaterThan(3);
  });
});

test.describe("search finds official services", () => {
  for (const [query, expected] of [
    ["aadhaar", /aadhaar|ఆధార్/i],
    ["ఆధార్", /aadhaar|ఆధార్/i],
    ["sbi", /state bank|స్టేట్ బ్యాంక్/i],
    ["adangal", /meebhoomi|మీభూమి/i],
  ] as Array<[string, RegExp]>) {
    test(`"${query}" returns a relevant first result`, async ({ page }) => {
      await page.goto(`/search/?q=${encodeURIComponent(query)}`);
      const first = page.locator(".searchpage-item-text strong").first();
      await expect(first).toBeVisible({ timeout: 10_000 });
      await expect(first).toHaveText(expected);
    });
  }

  test("an empty search offers popular searches instead of a blank page", async ({ page }) => {
    await page.goto("/search/");
    await expect(page.locator(".searchpage-popular")).toBeVisible({ timeout: 10_000 });
    expect(await page.locator(".searchpage-popular-chips .filter-chip").count()).toBeGreaterThan(2);
  });

  test("a query with no results says so", async ({ page }) => {
    await page.goto("/search/?q=zzzzqqqqxxxx");
    await expect(page.locator(".searchpage-empty-title")).toBeVisible({ timeout: 10_000 });
  });

  test("the search box is reachable by keyboard alone", async ({ page }) => {
    await page.goto("/search/");
    await page.locator("#site-search").focus();
    await page.keyboard.type("pension");
    await page.keyboard.press("Enter");
    await expect(page.locator(".searchpage-item-text strong").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
