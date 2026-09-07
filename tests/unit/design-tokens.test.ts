import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

const tokensCss = read("styles/tokens.css");
const globalsCss = read("app/globals.css");

/** Pull a block like `:root { ... }` or `.light { ... }` out of tokens.css. */
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

const dark = tokenMap(":root");
const light = tokenMap(".light");

/** Resolve one level of `var(--x)` indirection within a theme. */
function resolve(theme: Record<string, string>, value: string, depth = 0): string {
  if (depth > 6) return value;
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(value.trim());
  if (!m) return value.trim();
  const next = theme[m[1]!] ?? dark[m[1]!];
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
  ["dark (:root)", dark],
  ["light (.light)", light],
])("%s palette meets WCAG AA", (_name, theme) => {
  const hex = (token: string) => {
    const v = resolve(theme, theme[token] ?? "");
    expect(v, `${token} should be a plain hex colour`).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    return v;
  };

  it.each([
    ["--color-ink", "--color-bg"],
    ["--color-ink", "--color-bg-elevated"],
    ["--color-ink-soft", "--color-bg"],
    ["--color-muted", "--color-bg"],
    ["--color-muted", "--color-bg-elevated"],
    ["--color-accent", "--color-bg"],
    ["--color-accent-ink", "--color-bg-elevated"],
    ["--color-danger", "--color-bg"],
    ["--color-success", "--color-bg"],
  ])("%s on %s", (ink, surface) => {
    expect(contrast(hex(ink), hex(surface))).toBeGreaterThanOrEqual(AA);
  });

  /**
   * A gradient button is only as readable as its lightest stop. Checking the
   * midpoint would hide a failing end, so every stop is checked.
   */
  it("every --btn-bg gradient stop clears AA against --btn-fg", () => {
    const stops = [...(theme["--btn-bg"] ?? "").matchAll(/#[0-9a-fA-F]{3,6}/g)].map((m) => m[0]);
    expect(stops.length).toBeGreaterThanOrEqual(2);
    for (const stop of stops) {
      expect(contrast(stop, hex("--btn-fg")), `${stop} vs button ink`).toBeGreaterThanOrEqual(AA);
    }
  });
});

describe("the palette has one source of truth", () => {
  it("globals.css defines no theme palette of its own", () => {
    // A `.dark` or `.light` block in globals.css is how the ambient --glow
    // was silently overridden to a weaker value before the redesign.
    expect(globalsCss).not.toMatch(/^\.dark\s*\{/m);
    expect(globalsCss).not.toMatch(/^\.light\s*\{/m);
  });

  it("keeps no warm-gold literals, which would clash with the violet ground", () => {
    const gold = /#(?:b8860b|c4a574|c4a35a|c9a227|8f6a32|fff6df|8b6914|f0d7a0|f0d78c|f7f3ea)\b/i;
    expect(gold.test(globalsCss)).toBe(false);
    expect(gold.test(tokensCss)).toBe(false);
  });

  it("still keeps the semantic and brand hues that carry meaning", () => {
    // Instagram gradient and the rainbow logo treatment are real brand marks;
    // recolouring them to violet would misrepresent them.
    for (const keep of ["#f58529", "#dd2a7b", "#8134af", "#515bd4", "#ff3b5c", "#3ddc84"]) {
      expect(globalsCss, `${keep} should survive the recolour`).toContain(keep);
    }
  });
});

describe("the ambient aurora stays cheap and non-blocking", () => {
  const aurora = read("components/atmosphere/AuroraField.tsx");

  it("is hidden from assistive tech and cannot swallow clicks", () => {
    expect(aurora).toContain('aria-hidden="true"');
    expect(globalsCss).toMatch(/\.aurora-field\s*\{[^}]*pointer-events:\s*none/);
  });

  it("drops a blob and shrinks the blur on phones and reduced motion", () => {
    expect(aurora).toContain("(max-width: 820px), (prefers-reduced-motion: reduce)");
    expect(globalsCss).toMatch(/\.aurora-field\[data-lean\]/);
  });

  it("freezes the drift under prefers-reduced-motion", () => {
    const reduced = globalsCss
      .split("@media (prefers-reduced-motion: reduce)")
      .slice(1)
      .join("\n");
    expect(reduced).toMatch(/\.aurora-blob--1/);
  });
});
