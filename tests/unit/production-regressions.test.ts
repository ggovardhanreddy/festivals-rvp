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

  it("computes homepage and temple festival status from live village date", () => {
    const homeUpcoming = fs.readFileSync(
      path.join(process.cwd(), "components/home/HomeUpcomingEvents.tsx"),
      "utf8",
    );
    const festivalCalendar = fs.readFileSync(
      path.join(process.cwd(), "components/home/FestivalCalendar.tsx"),
      "utf8",
    );
    const temples = fs.readFileSync(
      path.join(process.cwd(), "components/temples/TemplesFestivalsPage.tsx"),
      "utf8",
    );
    expect(homeUpcoming).toContain("useVillageNow");
    expect(festivalCalendar).toContain("useVillageNow");
    expect(temples).toContain("useVillageNow");
  });

  it("keeps service-worker navigation requests network-fresh", () => {
    const script = fs.readFileSync(
      path.join(process.cwd(), "scripts/generate-all.ts"),
      "utf8",
    );
    expect(script).toContain('fetch(req,isNav?{cache:"no-store"}:undefined)');
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

  it("enables Telugu events route with a real page implementation", () => {
    const registry = fs.readFileSync(
      path.join(process.cwd(), "lib/routes/registry.ts"),
      "utf8",
    );
    expect(registry).toContain('path: "/events/"');
    expect(registry).toContain("hasTelugu: true");

    const teEvents = path.join(process.cwd(), "app/te/events/page.tsx");
    expect(fs.existsSync(teEvents)).toBe(true);
    const src = fs.readFileSync(teEvents, "utf8");
    expect(src).toContain("EventsBirthdaysHub");
  });

  it("keeps cinematic intro gate and enter-village CTA on hero", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "components/home/VillageHero.tsx"),
      "utf8",
    );
    expect(src).toContain("village-hero-intro");
    expect(src).toContain("Enter Village");
    expect(src).toContain("VillageLandingScene entered={entered}");
  });

  it("marks 3D temple/map experiences as conceptual or illustrative", () => {
    const temples = fs.readFileSync(
      path.join(process.cwd(), "components/temples/TemplesFestivalsPage.tsx"),
      "utf8",
    );
    expect(temples).toContain("illustrative model");
    const map = fs.readFileSync(
      path.join(process.cwd(), "components/three/VillageMapScene.tsx"),
      "utf8",
    );
    expect(map).toContain("Historic temple remembrance site");
  });
});
