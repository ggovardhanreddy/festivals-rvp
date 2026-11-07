import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const file = path.join(process.cwd(), "components/temples/TemplesFestivalsPage.tsx");

describe("temple missing-image placeholder", () => {
  it("uses a visual placeholder image instead of raw missing-info text", () => {
    const src = fs.readFileSync(file, "utf8");
    expect(src).toContain('/logo/logo-mark.webp');
    expect(src).toContain("Authentic temple photograph will be added when available");
    expect(src).not.toContain("Information not yet provided");
  });
});
