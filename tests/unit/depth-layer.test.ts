import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const css = read("app/globals.css");

/**
 * The depth layer: scroll progress, back-to-top, glass surface, masked image.
 *
 * Each is checked for the thing most likely to make it a liability rather
 * than an improvement -- a scroll handler that measures layout, a control
 * that traps keyboard focus, a highlight that loops forever, or a glass panel
 * that only works on a dark page.
 */
describe("scroll progress does not make scrolling expensive", () => {
  const src = read("components/motion/ScrollProgress.tsx");

  it("measures the document outside the scroll path", () => {
    // Reading scrollHeight per frame forces a layout on every scroll event,
    // which makes the progress bar the jankiest thing on the page.
    const handler = src.slice(src.indexOf("const onScroll"), src.indexOf("measure();"));
    expect(handler).not.toContain("scrollHeight");
  });

  it("re-measures when the page grows", () => {
    expect(src).toContain("ResizeObserver");
  });

  it("paints with a transform, not a width", () => {
    expect(src).toContain("scaleX(");
    expect(src).not.toMatch(/style\.width/);
  });

  it("uses a passive scroll listener throttled to a frame", () => {
    expect(src).toContain("{ passive: true }");
    expect(src).toContain("requestAnimationFrame");
  });
});

describe("back to top behaves like a real control", () => {
  const src = read("components/motion/BackToTop.tsx");

  it("is a labelled button, not a decorative glyph", () => {
    expect(src).toContain("<button");
    expect(src).toContain("aria-label");
  });

  it("leaves the tab order while it is off screen", () => {
    // Sending a keyboard user to an invisible control is worse than no control.
    expect(src).toContain("tabIndex={shown ? 0 : -1}");
    expect(src).toContain("aria-hidden={shown ? undefined : true}");
  });

  it("does not force smooth scrolling on someone who asked for less motion", () => {
    expect(src).toMatch(/behavior: reduce \? "auto" : "smooth"/);
  });

  it("clears the mobile bottom navigation", () => {
    expect(css).toMatch(/@media \(max-width: 720px\)[\s\S]{0,140}\.back-to-top/);
  });
});

describe("the glass surface works in both themes", () => {
  const src = read("components/motion/GlossyCard.tsx");

  it("builds on the existing glass token rather than a hard-coded dark tint", () => {
    // The site defaults to the system theme; a panel tuned only for a dark
    // page goes muddy on a light one.
    expect(css).toMatch(/\.glossy-card[\s\S]{0,200}background: var\(--glass\)/);
    expect(css).toMatch(/\.glossy-card[\s\S]{0,260}border: 1px solid var\(--line\)/);
  });

  it("sweeps the highlight a finite number of times", () => {
    // "Periodically", not "continuously": a highlight crossing every card
    // forever is a screensaver and a battery cost.
    expect(css).toMatch(/animation: sheen [\d]+ms var\(--ease\) 400ms 1 both/);
    expect(css).not.toMatch(/animation: sheen[^;]*infinite/);
  });

  it("drops the blur on phones, where it is the expensive part", () => {
    expect(css).toMatch(
      /@media \(max-width: 640px\)[\s\S]{0,320}\.glossy-card[\s\S]{0,160}backdrop-filter: none/,
    );
  });

  it("stands down under reduced motion", () => {
    expect(src).toContain("useReducedMotion");
    expect(src).toContain('data-sheen={sheen && !reduce ? "" : undefined}');
  });
});

describe("masked image reveal", () => {
  const src = read("components/motion/CinematicImage.tsx");

  it("opens with clip-path rather than scaling the photograph", () => {
    expect(src).toContain('clipPath: "inset(10% 0% 10% 0%)"');
    expect(src).toContain('clipPath: "inset(0% 0% 0% 0%)"');
  });

  it("is off by default, so a thumbnail grid does not read as noise", () => {
    expect(src).toMatch(/mask = false/);
  });

  it("is used on the temple photographs it was built for", () => {
    expect(read("components/home/HomeTemples.tsx")).toContain("mask");
  });
});

describe("no two systems write the same transform", () => {
  it("leaves the temple photograph's motion to CinematicImage alone", () => {
    /**
     * Both the CSS and the component were writing scale() to this image.
     * Only the ACTIVE rule is the conflict: the same selector inside the
     * reduced-motion block sets transform: none, which is one system being
     * switched off rather than a second one competing. So this checks the
     * stylesheet with the reduced-motion blocks removed.
     */
    const active = css
      .split("@media (prefers-reduced-motion: reduce)")
      .filter((_, i) => i === 0)
      .join("");
    expect(active).not.toMatch(
      /\.home-temple-card:hover \.home-temple-media img[\s\S]{0,80}scale\(/,
    );
  });
});
