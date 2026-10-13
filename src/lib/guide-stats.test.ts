import { describe, expect, it } from "vitest";
import { summarizeLines } from "./guide-stats";
import type { LineDetail } from "./data";

const line = (first: string, last: string): LineDetail => ({
  id: "x", name: "X", long_name: "", mode: "bus",
  directions: [{ headsign: "", stops: [], offsets: [], first_last: { weekday: [first, last] } }],
});

describe("summarizeLines", () => {
  it("treats after-midnight times as the latest", () => {
    const s = summarizeLines([line("06:00", "23:50"), line("05:30", "00:35")]);
    expect(s).toMatchObject({ lineCount: 2, earliestFirst: "05:30", latestLast: "00:35", overnightLines: 0 });
  });
  it("counts overnight lines without using them as a clock time", () => {
    const s = summarizeLines([line("05:40", "night"), line("06:00", "22:00")]);
    expect(s.latestLast).toBe("22:00");
    expect(s.overnightLines).toBe(1);
  });
});
