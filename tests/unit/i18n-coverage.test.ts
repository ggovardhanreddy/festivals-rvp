import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { translate } from "@/lib/i18n";
import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Coverage that matters is the keys the site actually renders.
 *
 * The catalogue is 87% translated, but that figure counts keys nothing uses.
 * What a Telugu reader sees is decided by the keys in components -- and a key
 * with no Telugu falls back to English silently, which is how a page ends up
 * half translated with nothing reporting a problem.
 */
describe("Telugu covers every string the site renders", () => {
  const root = process.cwd();


  /**
   * Walk the components and pick out real translator calls.
   *
   * Done here rather than with grep because a naive /t\(/ also matches
   * import(, getContext( and querySelector( -- every identifier that happens
   * to end in "t". The lookbehind is what makes this a translator call and not
   * the tail of another function name.
   */
  function collectKeys(dir: string, out: Set<string>) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        collectKeys(full, out);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const src = readFileSync(full, "utf8");
        for (const m of src.matchAll(/(?<![A-Za-z0-9_.$])t\(\s*"([^"]+)"/g)) {
          out.add(m[1]!);
        }
      }
    }
  }

  const used = new Set<string>();
  collectKeys(join(root, "components"), used);
  collectKeys(join(root, "app"), used);

  /**
   * Resolved through the real translator, not by matching the catalogue file.
   * Some keys are legacy href aliases ("/search/") that map onto a nav entry,
   * so a raw string search reports them missing when they resolve perfectly.
   * A key is present when translating it returns something other than itself.
   */
  const defined = (locale: "en" | "te", key: string) =>
    translate(locale, key) !== key;

  it("finds the translator in use across the site", () => {
    expect(used.size).toBeGreaterThan(150);
  });

  it("has an English string for every key a component asks for", () => {
    const missing = [...used].filter((key) => !defined("en", key));
    expect(missing, `missing in en: ${missing.join(", ")}`).toEqual([]);
  });

  it("has a Telugu string for every key a component asks for", () => {
    /**
     * A language switcher names each language in its own script -- "English"
     * stays "English" and "తెలుగు" stays "తెలుగు" -- so identical values are
     * correct here rather than a missing translation.
     */
    const SAME_IN_BOTH = new Set(["language-en", "language-te"]);
    const missing = [...used].filter(
      (key) =>
        !SAME_IN_BOTH.has(key) &&
        defined("en", key) &&
        translate("te", key) === translate("en", key),
    );
    expect(missing, `missing in te: ${missing.join(", ")}`).toEqual([]);
  });

  it("translates the person-card labels, which repeat on every card", () => {
    for (const key of [
      "person.married",
      "person.deceased",
      "person.adapaduchu",
      "person.needsVerification",
      "person.infoNotProvided",
    ]) {
      expect(defined("te", key), `${key} has no Telugu`).toBe(true);
    }
  });
});
