import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIST, DUR, EASE, STAGGER, VIEWPORT } from "@/components/motion/tokens";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

/**
 * The rule that matters most on this site.
 *
 * A reveal that starts at opacity 0 and never fires leaves the content
 * invisible for good. On a family archive that is not a degraded animation,
 * it is a missing person -- so the primitives animate the transform and leave
 * opacity alone, except where a fade is the whole point.
 */
describe("no reveal can hide content permanently", () => {
  const motion = read("components/motion/index.tsx");

  it("never parks a moving element at zero opacity", () => {
    // 0.001 is deliberate: enough for the compositor to treat it as a fade,
    // not enough to vanish if the observer never fires.
    expect(motion).not.toMatch(/opacity:\s*0\s*[,}]/);
  });

  it("skips the initial state entirely under reduced motion", () => {
    const initials = motion.match(/initial=\{reduce \? false :/g) ?? [];
    expect(initials.length).toBeGreaterThanOrEqual(5);
  });

  it("asks the platform rather than guessing", () => {
    expect(motion).toContain("useReducedMotion");
  });

  it("splits headings on words, not characters", () => {
    // Per-character animation would break Telugu apart: consonants and vowel
    // signs form single clusters that must not be animated separately.
    expect(motion).toContain('text.split(" ")');
  });
});

describe("one shared vocabulary", () => {
  it("keeps the tokens in the range that reads as premium, not sluggish", () => {
    expect(DUR.micro).toBeLessThan(0.25);
    expect(DUR.reveal).toBeGreaterThanOrEqual(0.4);
    expect(DUR.image).toBeGreaterThan(DUR.reveal);
    expect(STAGGER).toBeLessThanOrEqual(0.12);
  });

  it("keeps travel short enough that content leads, not motion", () => {
    expect(DIST.near).toBeLessThanOrEqual(24);
    expect(DIST.far).toBeLessThanOrEqual(60);
  });

  it("fires once the element is properly in view", () => {
    expect(VIEWPORT.amount).toBeGreaterThanOrEqual(0.1);
    expect(VIEWPORT.amount).toBeLessThanOrEqual(0.25);
    expect(VIEWPORT.once).toBe(true);
  });

  it("uses the same easing curve in CSS as in JavaScript", () => {
    const css = read("app/globals.css");
    const [a, b, c, d] = EASE;
    expect(css).toContain(`cubic-bezier(${a}, ${b}, ${c}, ${d})`);
  });

  it("has the older Reveal component borrow the same tokens", () => {
    const reveal = read("components/Reveal.tsx");
    expect(reveal).toContain("@/components/motion/tokens");
    expect(reveal).toMatch(/duration: DUR\.reveal/);
  });
});

describe("the family tree draws itself", () => {
  const view = read("components/families/FamilyTreeView.tsx");
  const css = read("app/globals.css");

  it("normalises every line so one rule can draw them all", () => {
    expect(view).toContain("pathLength={1}");
    expect(css).toContain("stroke-dasharray: 1");
    expect(css).toContain("stroke-dashoffset: 1");
  });

  it("stages nodes and lines by generation", () => {
    expect(view).toContain("--ft-delay");
    expect(view).toMatch(/depthOf\(person\.id\) \* 160/);
    expect(css).toContain("animation-delay: var(--ft-delay, 0ms)");
  });

  it("dims unrelated people instead of hiding them", () => {
    // The tree must stay whole: a visitor needs to see what they are not
    // being shown, and nothing should move when a selection changes.
    expect(css).toMatch(/\.ft-node\[data-dim\][\s\S]{0,120}opacity: 0\.34/);
    expect(css).not.toMatch(/\.ft-node\[data-dim\][\s\S]{0,120}display:\s*none/);
  });

  it("limits the highlight to immediate family", () => {
    expect(view).toContain("const kin = new Set<string>([selectedId])");
  });
});

describe("reduced motion and small screens are handled once", () => {
  const css = read("app/globals.css");

  it("neutralises the shared tokens where reduced motion is honoured", () => {
    /**
     * Searches every reduced-motion block rather than one of them. An earlier
     * version of this test looked only at the last block in the file and
     * broke the moment a second one was appended -- the code was fine, the
     * locator was not. What matters is that the tokens are neutralised
     * somewhere under the query, not which block does it.
     */
    const blocks = css
      .split("@media (prefers-reduced-motion: reduce)")
      .slice(1)
      .join("\n");
    for (const token of ["--dur-micro", "--dur-reveal", "--dur-image", "--lift", "--zoom"]) {
      expect(blocks, `${token} not neutralised`).toContain(token);
    }
    expect(blocks).toContain("animation: none");
  });

  it("drops hover flourishes on phones, where there is no hover", () => {
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]{0,200}--zoom: 1/);
  });
});
