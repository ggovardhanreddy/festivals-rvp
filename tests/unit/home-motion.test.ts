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
    expect(css).toMatch(/animation: hero-settle 16s var\(--ease\) both/);
    expect(css).toMatch(/to\s*\{\s*transform: scale\(1\.045\)/);
  });

  it("moves the copy against the photograph, not with it", () => {
    // Same direction at the same rate is not parallax, it is a pan.
    expect(css).toMatch(/\.village-hero-copy[\s\S]{0,160}var\(--par-x\) \* -0\.42/);
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


/**
 * The remaining sections the brief lists, and the one bug it surfaced.
 */
describe("history unfolds instead of appearing", () => {
  const timeline = read("components/home/HistoryTimeline.tsx");

  it("no longer starts a history card at zero opacity", () => {
    // It used to. A missed whileInView left a piece of the village's history
    // permanently invisible -- the one failure the motion system exists to
    // prevent.
    expect(timeline).not.toMatch(/initial=\{reduce \? false : \{ opacity: 0,/);
    expect(timeline).toContain("opacity: 1, y: DIST.mid");
  });

  it("triggers early enough for a tall card carrying an image", () => {
    expect(timeline).toContain("viewport={VIEWPORT_SAFE}");
  });

  it("staggers entries and caps the wait", () => {
    expect(timeline).toMatch(/Math\.min\(index, 5\) \* 0\.1/);
  });
});

describe("development cards join the staggered sections", () => {
  it("wraps the progress grid and keeps its layout hook", () => {
    const progress = read("components/home/VillageProgress.tsx");
    expect(progress).toContain("StaggerChildren");
    expect(progress).toContain('"data-count": shown.length');
  });
});

describe("CinematicImage replaces four hand-rolled copies", () => {
  const img = read("components/motion/CinematicImage.tsx");

  it("clips on the frame so a hover never reflows the layout", () => {
    expect(img).toContain('overflow: "hidden"');
  });

  it("animates transform and opacity only", () => {
    expect(img).not.toMatch(/filter:/);
    expect(img).not.toMatch(/blur\(/);
  });

  it("gives keyboard users the same response as a pointer", () => {
    expect(img).toContain("whileFocus");
  });

  it("keeps the scale small enough to read as settling", () => {
    expect(img).toMatch(/from = 1\.02/);
    expect(img).toMatch(/hover = 1\.035/);
  });

  it("stands down entirely under reduced motion", () => {
    expect(img).toContain("useReducedMotion");
    expect(img).toMatch(/reduce \|\| hover === 1 \? undefined/);
  });
});

describe("navigation gains motion without redesign", () => {
  it("grows a link indicator from the centre", () => {
    expect(css).toMatch(/\.nav-links a::after[\s\S]{0,200}transform: scaleX\(0\)/);
    expect(css).toContain("transform-origin: center");
  });

  it("marks the current page, not only hover", () => {
    expect(css).toContain('.nav-links a[aria-current]::after');
  });

  it("lifts the temple scrim with opacity, not a filter", () => {
    expect(css).toMatch(/\.home-temple-media::after[\s\S]{0,240}transition: opacity/);
  });
});
