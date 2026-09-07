import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const tokensCss = read("styles/tokens.css");
const globalsCss = read("app/globals.css");

/** Pull a block like `:root { ... }` or `.dark { ... }` out of tokens.css. */
function block(selector: string): string {
  const start = tokensCss.indexOf(`${selector} {`);
  expect(start, `${selector} block missing from styles/tokens.css`).toBeGreaterThan(-1);
  const end = tokensCss.indexOf("\n}", start);
  return tokensCss.slice(start, end);
}

function tokenMap(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block(selector).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    out[m[1]!] = m[2]!.trim();
  }
  return out;
}

const light = tokenMap(":root");
const dark = tokenMap(".dark");

/** Resolve one level of `var(--x)` indirection within a theme. */
function resolve(theme: Record<string, string>, value: string, depth = 0): string {
  if (depth > 6) return value;
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(value.trim());
  if (!m) return value.trim();
  const next = theme[m[1]!] ?? light[m[1]!];
  return next ? resolve(theme, next, depth + 1) : value.trim();
}

function srgbToLinear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgbToLinear(r!) + 0.7152 * srgbToLinear(g!) + 0.0722 * srgbToLinear(b!);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * WCAG AA for small text. The Playwright a11y suite checks the rendered page,
 * but it needs a browser; this checks the palette itself, which is where a
 * contrast regression is actually introduced.
 */
const AA = 4.5;

describe.each([
  ["light (:root)", light],
  ["dark (.dark)", dark],
])("%s palette meets WCAG AA", (_name, theme) => {
  const hex = (token: string) => {
    const v = resolve(theme, theme[token] ?? "");
    expect(v, `${token} should be a plain hex colour`).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    return v;
  };

  it.each([
    ["--color-ink", "--color-bg"],
    ["--color-ink", "--color-bg-elevated"],
    ["--color-ink", "--color-bg-band"],
    ["--color-ink-soft", "--color-bg"],
    ["--color-muted", "--color-bg"],
    ["--color-muted", "--color-bg-band"],
    ["--color-muted", "--color-bg-elevated"],
    ["--color-accent-ink", "--color-bg"],
    ["--color-accent-ink", "--color-bg-band"],
    ["--color-danger", "--color-bg"],
    ["--color-success", "--color-bg"],
  ])("%s on %s", (ink, surface) => {
    expect(contrast(hex(ink), hex(surface))).toBeGreaterThanOrEqual(AA);
  });

  /**
   * A gradient button is only as readable as its lightest stop, so every stop
   * is checked rather than the midpoint.
   */
  it.each([
    ["--btn-bg", "--btn-fg"],
    ["--btn-alt-bg", "--btn-alt-fg"],
  ])("every %s gradient stop clears AA against %s", (bgToken, fgToken) => {
    const raw = theme[bgToken] ?? light[bgToken] ?? "";
    // A stop is either a token reference or a literal hex: the dark theme pins
    // its gradients to literals because the structural tones it would
    // otherwise reference are too light to carry the button ink.
    const stops = [...raw.matchAll(/var\((--[a-z0-9-]+)\)|#[0-9a-fA-F]{3,6}\b/g)].map((m) =>
      m[1] ? resolve(theme, `var(${m[1]})`) : m[0],
    );
    expect(stops.length, `${bgToken} should be a gradient of at least two stops`).toBeGreaterThanOrEqual(2);
    for (const stop of stops) {
      expect(stop, `${bgToken} stop should resolve to a hex`).toMatch(/^#[0-9a-fA-F]{3,6}$/);
      expect(contrast(stop, hex(fgToken)), `${stop} vs ${fgToken}`).toBeGreaterThanOrEqual(AA);
    }
  });

  /**
   * --color-gold is ornament. It does NOT pass as small text and must never be
   * used as one -- that is what --color-accent-ink is for. Asserting the
   * failure keeps someone from "fixing" the split by pointing text at gold.
   */
  /**
   * Headings and eyebrows are forest green in light and gold in dark, because
   * forest green on the dark ground is only ~2:1. Whichever the theme uses for
   * that role has to clear AA on both page surfaces.
   */
  it("has a heading colour that clears AA on the page and the band", () => {
    const heading = theme === light ? hex("--color-forest") : hex("--color-gold-soft");
    expect(contrast(heading, hex("--color-bg"))).toBeGreaterThanOrEqual(AA);
    expect(contrast(heading, hex("--color-bg-band"))).toBeGreaterThanOrEqual(AA);
  });

  it("keeps ornament gold distinct from text gold", () => {
    expect(hex("--color-gold")).not.toBe(hex("--color-accent-ink"));
    expect(contrast(hex("--color-accent-ink"), hex("--color-bg"))).toBeGreaterThanOrEqual(AA);
  });
});

describe("the green chrome is legible", () => {
  /**
   * The header and footer are one solid green band, the SAME green in both
   * themes, with light ink. That is why the fill is --chrome-bg and not
   * --color-forest: --color-forest lightens in dark, which would drop this ink
   * below 4.5:1, and using --ink instead would go dark-on-dark in light mode.
   */
  const band = resolve(light, light["--chrome-bg"]!);

  it("is defined once, not per theme", () => {
    expect(dark["--chrome-bg"], "--chrome-bg must not be redefined in .dark").toBeUndefined();
    expect(band).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it.each(["--chrome-ink", "--chrome-ink-soft", "--chrome-ink-muted"])(
    "%s clears AA on the band",
    (token) => {
      expect(contrast(resolve(light, light[token]!), band)).toBeGreaterThanOrEqual(AA);
    },
  );

  it("uses the light gold on green, not the ornament gold", () => {
    // --color-gold is only ~2.96:1 on the band, so nav hover uses the softer
    // gold. Asserting both halves keeps the distinction from being collapsed.
    expect(contrast(resolve(light, light["--color-gold"]!), band)).toBeLessThan(AA);
    expect(contrast(resolve(light, light["--color-gold-soft"]!), band)).toBeGreaterThanOrEqual(AA);
    expect(globalsCss).toMatch(/\.nav a:hover\s*\{\s*color:\s*var\(--color-gold-soft\)/);
  });

  /**
   * Anything sitting ON the band must not take its colours from theme tokens.
   * The active language pill did, and in dark mode became #2a5c49 on #121915
   * -- 1.9:1, i.e. the current language was unreadable.
   */
  it("gives the active language pill fixed colours, not theme tokens", () => {
    const rule = /\.nav \.lang-switch-btn\[data-active\]\s*\{([^}]*)\}/.exec(globalsCss);
    expect(rule, "active language pill rule missing").not.toBeNull();
    const body = rule![1]!;
    expect(body).not.toMatch(/var\(--color-(?:bg|forest|ink)\b/);
    const hexes = [...body.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0]);
    expect(hexes.length).toBe(2);
    expect(contrast(hexes[0]!, hexes[1]!)).toBeGreaterThanOrEqual(AA);
  });

  it("does not paint the band with a theme-varying token", () => {
    expect(globalsCss).toMatch(/\.nav\b[^}]*background:\s*var\(--chrome-bg\)/);
    expect(globalsCss).toMatch(/\.site-footer\b[^}]*background:\s*var\(--chrome-bg\)/);
  });
});

describe("the palette has one source of truth", () => {
  it("globals.css defines no theme palette of its own", () => {
    // A `.dark` or `.light` block at the top level of globals.css is how the
    // ambient tokens got quietly overridden with a second set of values.
    expect(globalsCss).not.toMatch(/^\.dark\s*\{/m);
    expect(globalsCss).not.toMatch(/^\.light\s*\{/m);
  });

  it("ships no violet from the reverted redesign", () => {
    const violet = /#(?:a78bfa|c4b5fd|8b5cf6|6d28d9|4f46e5|c026d3|0a0a18|12122a|7c3aed|e9d5ff)\b/i;
    expect(violet.test(globalsCss)).toBe(false);
    expect(violet.test(tokensCss)).toBe(false);
  });

  it("keeps the semantic and brand hues that carry meaning", () => {
    // Instagram gradient and the rainbow logo treatment are real brand marks.
    for (const keep of ["#f58529", "#dd2a7b", "#8134af", "#515bd4", "#ff3b5c", "#3ddc84"]) {
      expect(globalsCss, `${keep} should be present`).toContain(keep);
    }
  });
});

describe("the hero backdrop is framed for its aspect ratio", () => {
  /**
   * The backdrop is a wide landscape image inside a hero that is portrait on
   * a phone, so cover crops horizontally and only the x focal point matters.
   * At the default 65% the temple and the road fall outside the crop.
   */
  it("pushes the focal point right on narrow screens", () => {
    expect(globalsCss).toMatch(/object-position:\s*80% 50%/);
    expect(globalsCss).toMatch(/object-position:\s*68% 50%/);
  });

  it("keeps the hero heading a solid colour over the photograph", () => {
    // A gradient-clipped heading loses legibility exactly where the image is
    // bright, which over a sunrise is most of it.
    const rule = globalsCss.slice(globalsCss.lastIndexOf(".village-hero-title {"));
    expect(rule.slice(0, 200)).toMatch(/color:\s*#fffaf0/);
  });
});
