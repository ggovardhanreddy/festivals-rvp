import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("production regression guards", () => {
  it("keeps member counts synced through live member data on homepage", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/home/HomePeople.tsx"),
      "utf8",
    );
    expect(src).toContain("useLiveMembers");
    expect(src).toContain("publishedMembers(liveMembers)");
    expect(src).toContain("rosterStats(liveMembers)");
  });

  it("uses shared event phase logic for upcoming vs completed split", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/events/EventsBirthdaysHub.tsx"),
      "utf8",
    );
    expect(src).toContain("eventPhase(");
    expect(src).not.toContain("toISOString().slice(0, 10)");
  });

  it("uses shared status + date formatting in events cards", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/events/EventsCalendar.tsx"),
      "utf8",
    );
    expect(src).toContain("eventStatusLabel(");
    expect(src).toContain("formatEventDateRange(");
  });

  it("enables Telugu temples route with a real page implementation", () => {
    const registry = fs.readFileSync(
      path.join(process.cwd(), "lib/routes/registry.ts"),
      "utf8",
    );
    expect(registry).toContain('path: "/temples/"');
    expect(registry).toContain("hasTelugu: true");

    const teTemples = path.join(process.cwd(), "app/te/temples/page.tsx");
    expect(fs.existsSync(teTemples)).toBe(true);
    const src = fs.readFileSync(teTemples, "utf8");
    expect(src).toContain('locale="te"');
  });
});
