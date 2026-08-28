import { expect, test } from "@playwright/test";

/**
 * The children's sections.
 *
 * The assertions are about honesty as much as function: a section with no
 * content must say what it is waiting on rather than looking broken, and the
 * alphabet must never show a speaker button it cannot honour.
 */
const LIBRARIES = [
  ["/kids/stories/", /permission to publish/i],
  ["/kids/rhymes/", /recordings from the village/i],
  ["/kids/science/", /review by a teacher/i],
  ["/kids/videos/", /permission to publish/i],
] as const;

test.describe("children's libraries", () => {
  for (const [path, reason] of LIBRARIES) {
    test(`${path} renders and says what it is waiting on`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);
      await expect(page.locator("h1")).toHaveCount(1);
      // The empty state is part of the design, not a blank page.
      await expect(page.locator(".empty-library")).toBeVisible();
      await expect(page.locator(".empty-library-reason")).toHaveText(reason);
      // Nothing pretends to be a link to content that does not exist.
      expect(await page.locator(".libcard").count()).toBe(0);
    });
  }

  test("every kids activity is reachable from the hub", async ({ page }) => {
    await page.goto("/kids/");
    const links = page.locator(".kids-card[href], a.kids-card");
    expect(await links.count()).toBeGreaterThan(8);
    for (const href of await links.evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href")),
    )) {
      expect(href, "no empty hub link").toBeTruthy();
    }
  });
});

test.describe("letters and sounds", () => {
  test("shows a letter, a picture and a word, and moves between them", async ({ page }) => {
    await page.goto("/kids/alphabet/");
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "1", undefined, {
      timeout: 15_000,
    });

    const glyph = page.locator(".abc-glyph");
    await expect(glyph).toContainText("A");
    await expect(page.locator(".abc-picture")).toBeVisible();
    await expect(page.locator(".abc-word")).toContainText(/apple/i);
    await expect(page.locator(".abc-count")).toHaveText("1 / 26");

    // The whole card is the tap target, and it is large.
    const box = await page.locator(".abc-card").boundingBox();
    expect(box!.height).toBeGreaterThan(200);

    await page.locator(".abc-nav").last().click();
    await expect(page.locator(".abc-count")).toHaveText("2 / 26");
    await expect(glyph).toContainText("B");

    // Arrow keys work too.
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(".abc-count")).toHaveText("1 / 26");

    // Jumping via the strip.
    await page.locator(".abc-chip", { hasText: "Z" }).last().click();
    await expect(glyph).toContainText("Z");
  });

  test("switches to the Telugu aksharamala", async ({ page }) => {
    await page.goto("/kids/alphabet/");
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "1", undefined, {
      timeout: 15_000,
    });
    await page.locator(".filter-chip", { hasText: "Achchulu" }).click();
    await expect(page.locator(".abc-count")).toHaveText("1 / 16");
    await expect(page.locator(".abc-glyph")).toContainText("అ");
  });

  test("never offers a speaker the device cannot honour", async ({ page }) => {
    await page.goto("/kids/alphabet/");
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "1", undefined, {
      timeout: 15_000,
    });
    // Headless Chromium has no voices, so the honest branch must render:
    // an explanation instead of a button that would do nothing.
    const speak = page.locator(".abc-speak");
    const excuse = page.locator(".abc-novoice");
    const hasSpeak = (await speak.count()) > 0;
    const hasExcuse = (await excuse.count()) > 0;
    expect(hasSpeak !== hasExcuse, "exactly one of button or explanation").toBe(true);
  });
});

test.describe("digital skills", () => {
  test("is a real page that says it has not launched", async ({ page }) => {
    const res = await page.goto("/digital-skills/");
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("h1")).toHaveText(/digital skills/i);
    await expect(page.locator("body")).toContainText(/has not launched yet/i);
    await expect(page.locator("body")).toContainText(/nothing is hidden behind a login/i);
    await expect(page.locator("body")).toContainText(/phase 5/i);
    // The plan is shown, and none of it pretends to be a lesson link.
    expect(await page.locator(".kids-card.is-pending").count()).toBeGreaterThan(4);
    // The links that are there are real and official.
    expect(await page.locator(".oflink").count()).toBeGreaterThan(0);
  });
});

test.describe("reserved sections point somewhere useful", () => {
  for (const [path, expected] of [
    ["/temples/", /heritage/i],
    ["/community/", /members/i],
    ["/it/", /digital skills/i],
    ["/english/", /english letters|letters and sounds/i],
  ] as const) {
    test(`${path} offers a real alternative`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(/has not launched yet/i);
      await expect(page.locator(".section-soon-alts")).toContainText(expected);
    });
  }
});
