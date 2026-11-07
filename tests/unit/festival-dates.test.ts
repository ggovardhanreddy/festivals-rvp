import { describe, expect, it } from "vitest";
import {
  daysUntil,
  eventPhase,
  eventStatusLabel,
  istDateKey,
  VILLAGE_TIME_ZONE,
} from "@/lib/dates";

describe("festival date logic (Asia/Kolkata)", () => {
  it("uses village timezone day boundaries around midnight IST", () => {
    // 23:59:59 IST on 2026-09-10.
    const justBeforeMidnightIst = new Date("2026-09-10T18:29:59.000Z");
    // 00:00:00 IST on 2026-09-11.
    const atMidnightIst = new Date("2026-09-10T18:30:00.000Z");

    expect(VILLAGE_TIME_ZONE).toBe("Asia/Kolkata");
    expect(istDateKey(justBeforeMidnightIst)).toBe("2026-09-10");
    expect(istDateKey(atMidnightIst)).toBe("2026-09-11");
    expect(daysUntil("2026-09-10", justBeforeMidnightIst)).toBe(0);
    expect(daysUntil("2026-09-10", atMidnightIst)).toBe(-1);
  });

  it("marks past festivals as completed", () => {
    const from = new Date("2026-09-12T06:00:00.000Z");
    expect(eventPhase("2026-09-10", undefined, from)).toBe("completed");
    expect(eventStatusLabel("2026-09-10", undefined, from)).toBe("Completed");
  });

  it("keeps multi-day festivals as today until end date passes", () => {
    const middleDay = new Date("2026-09-12T08:00:00.000Z");
    const dayAfter = new Date("2026-09-14T08:00:00.000Z");

    expect(eventPhase("2026-09-11", "2026-09-13", middleDay)).toBe("today");
    expect(eventStatusLabel("2026-09-11", "2026-09-13", middleDay)).toBe("Today");
    expect(eventPhase("2026-09-11", "2026-09-13", dayAfter)).toBe("completed");
  });
});
