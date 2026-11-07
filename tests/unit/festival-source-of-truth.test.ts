import { describe, expect, it } from "vitest";
import { splitFestivalsByPhase } from "@/lib/events";
import type { SiteEvent } from "@/lib/types";

function fest(
  id: string,
  date: string,
  endDate?: string,
  category: SiteEvent["category"] = "festival",
): SiteEvent {
  return {
    id,
    title: id,
    date,
    endDate,
    description: `${id} description`,
    category,
  };
}

describe("festival source-of-truth buckets", () => {
  it("keeps only festival-category events and splits upcoming/completed", () => {
    const events: SiteEvent[] = [
      fest("dasara", "2026-10-10"),
      fest("deepavali", "2026-11-08"),
      fest("meeting", "2026-11-09", undefined, "other"),
    ];
    const from = new Date("2026-11-07T03:30:00.000Z"); // morning IST
    const out = splitFestivalsByPhase(events, from);
    expect(out.upcoming.map((event) => event.id)).toEqual(["deepavali"]);
    expect(out.completed.map((event) => event.id)).toEqual(["dasara"]);
  });

  it("treats an in-progress multi-day festival as upcoming/ongoing", () => {
    const events: SiteEvent[] = [fest("jathara", "2026-11-06", "2026-11-08")];
    const from = new Date("2026-11-07T08:00:00.000Z");
    const out = splitFestivalsByPhase(events, from);
    expect(out.upcoming.map((event) => event.id)).toEqual(["jathara"]);
    expect(out.completed).toHaveLength(0);
  });
});
