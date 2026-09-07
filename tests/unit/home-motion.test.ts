import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");
const css = read("app/globals.css");

/**
 * The homepage animates real Reddivaripalli content, section by section.
 *
 * Every check below points at a component that renders records already in the
 * project -- 39 members, five temples, six memory tiles from the 2026 albums,
 * and the two founders in village-heritage.json. Nothing was added to have
 * something to animate.
 */
describe("hero", () => {
  const hero = read("components/home/VillageHero.tsx");

  it("settles the photograph once rather than looping forever", () => {
    // A looping zoom keeps pulling the eye back to the top of the page.
    expect(css).toContain("@keyframes hero-settle");
    expect(css).toMatch(/animation: hero-settle 18s var\(--ease\) both/);
    expect(css).toMatch(/to\s*\{\s*transform: scale\(1\.05\)/);
  });

  it("moves the copy against the photograph, not with it", () => {
    // Same direction at the same rate is not parallax, it is a pan.
    expect(css).toMatch(/\.village-hero-copy[\s\S]{0,160}var\(--par-x\) \* -0\.45/);
  });

  it("drives parallax through CSS variables, not React state", () => {
    expect(hero).toContain('setProperty("--par-x"');
    expect(hero).toContain("requestAnimationFrame");
    expect(hero).not.toMatch(/useState[^\n]*par/i);
  });

  it("skips parallax where there is no fine pointer", () => {
    expect(hero).toContain('matchMedia("(hover: hover) and (pointer: fine)")');
  });

  it("skips parallax entirely under reduced motion", () => {
    expect(hero).toMatch(/if \(reduce\) return;/);
  });
});

describe("the seven sections are wired to the shared system", () => {
  const files: [string, string][] = [
    ["components/home/HomeTemples.tsx", "StaggerChildren"],
    ["components/home/HomePeople.tsx", "StaggerChildren"],
    ["components/home/HomeUpcomingEvents.tsx", "StaggerChildren"],
    ["components/home/LatestMemories.tsx", "StaggerChildren"],
    ["components/home/HomeStories.tsx", "FadeUp"],
  ];

  for (const [file, primitive] of files) {
    it(`${file.split("/").pop()} uses ${primitive}`, () => {
      const src = read(file);
      expect(src).toContain("@/components/motion");
      expect(src).toContain(primitive);
    });
  }

  it("gives the founder and his successor separate beats", () => {
    const stories = read("components/home/HomeStories.tsx");
    // The founder arrives alone; the successor follows.
    expect(stories).toMatch(/delay=\{0\.22\}/);
  });
});

describe("Ken Burns is reserved for the featured photograph", () => {
  it("applies only to the single-tile variant", () => {
    // Six tiles drifting at once is an aquarium, not an archive.
    expect(css).toMatch(
      /\.home-memory-grid\[data-single\] \.home-memory-tile img[\s\S]{0,120}animation: ken-burns/,
    );
  });

  it("keeps the move small", () => {
    expect(css).toMatch(/@keyframes ken-burns[\s\S]{0,160}scale\(1\.04\)/);
  });
});

describe("wrapping a grid never drops its layout hooks", () => {
  it("forwards the memory grid's data attributes", () => {
    // These select the single-photo and three-up variants; losing them
    // silently collapses the grid to its default.
    const memories = read("components/home/LatestMemories.tsx");
    expect(memories).toContain('"data-single"');
    expect(memories).toContain('"data-count"');
    expect(read("components/motion/index.tsx")).toContain("dataset");
  });
});

describe("every home flourish is switched off for reduced motion", () => {
  const blocks = css
    .split("@media (prefers-reduced-motion: reduce)")
    .slice(1)
    .join("\n");

  it("stops the hero settle, the parallax and the scroll cue", () => {
    expect(blocks).toContain(".village-hero-photo img");
    expect(blocks).toContain(".village-hero-scrollcue span");
  });

  it("stops Ken Burns and the hover zooms", () => {
    expect(blocks).toContain(".home-memory-grid[data-single] .home-memory-tile img");
    expect(blocks).toContain(".home-temple-card:hover");
  });
});
