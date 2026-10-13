import { describe, expect, it } from "vitest";
import { pickDerivedLines, relatedGuides, summarizeLines } from "./guide-stats";
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

describe("pickDerivedLines", () => {
  it("prefers lines serving more stops and puts non-bus modes first", () => {
    const meta = new Map([
      ["b1", { id: "b1", name: "B1", long_name: "", mode: "bus" }],
      ["b2", { id: "b2", name: "B2", long_name: "", mode: "bus" }],
      ["t1", { id: "t1", name: "T1", long_name: "", mode: "tram" }],
    ]);
    const stop = (lines: string[]) => ({ id: "s", name: "s", lat: 0, lon: 0, mode: "bus", lines });
    expect(pickDerivedLines([stop(["b1", "b2"]), stop(["b2", "t1"])], meta, 2)).toEqual(["t1", "b2"]);
  });
});

describe("relatedGuides", () => {
  const g = (slug: string, city: string, lines: string[]) => ({ slug, city, lines, stops: [] as string[] });
  it("ranks same-city guides by overlap", () => {
    const a = g("a", "x", ["m1", "m2"]);
    const out = relatedGuides([a, g("b", "x", ["m9"]), g("c", "x", ["m1"]), g("d", "y", ["m1"])], a, 5);
    expect(out.map((x) => x.slug)).toEqual(["c", "b"]);
  });
});
