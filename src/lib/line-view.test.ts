import { describe, expect, it } from "vitest";
import { buildLineView } from "./line-view";
import type { LineDetail, Stop } from "./data";

const stop = (id: string): Stop => ({ id, name: `S${id}`, lat: 0, lon: 0, mode: "bus", lines: ["x"] });

describe("buildLineView", () => {
  it("keeps order, dedupes stops across directions and skips unknown ids", () => {
    const line: LineDetail = {
      id: "x", name: "X", long_name: "X line", mode: "bus",
      directions: [
        { headsign: "B", stops: ["1", "2", "9"], offsets: [0, 5, 8], first_last: {} },
        { headsign: "A", stops: ["2", "1"], offsets: [0, 6], first_last: {} },
      ],
    };
    const v = buildLineView(line, new Map([["1", stop("1")], ["2", stop("2")]]));
    expect(v.directions[0].rows.map((r) => r.stop.id)).toEqual(["1", "2"]);
    expect(v.directions[0].durationMinutes).toBe(8);
    expect(v.uniqueStops.map((s) => s.id)).toEqual(["1", "2"]);
  });
});
