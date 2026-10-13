import { describe, expect, it } from "vitest";
import { addMinutes, buildStopView, departuresAt } from "./stop-view";
import type { LineMeta, Stop } from "./data";

const stop = (id: string, lat: number, lon: number, lines: string[]): Stop => ({
  id, name: `Stop ${id}`, lat, lon, mode: "bus", lines,
});

describe("addMinutes", () => {
  it("adds and wraps past midnight", () => {
    expect(addMinutes("05:30", 12)).toBe("05:42");
    expect(addMinutes("23:50", 20)).toBe("00:10");
    expect(addMinutes("night", 5)).toBe("night");
  });
});

describe("departuresAt", () => {
  it("shifts first/last by the stop offset", () => {
    const dirs = [{
      headsign: "X", stops: ["a", "b", "c"], offsets: [0, 4, 9],
      first_last: { weekday: ["06:00", "22:00"] as [string, string] },
    }];
    expect(departuresAt("c", dirs)).toEqual([{ headsign: "X", first: "06:09", last: "22:09" }]);
    expect(departuresAt("z", dirs)).toEqual([]);
  });
});

describe("buildStopView", () => {
  const meta = new Map<string, LineMeta>([
    ["1", { id: "1", name: "1", long_name: "One", mode: "bus" }],
    ["2", { id: "2", name: "2", long_name: "Two", mode: "bus" }],
  ]);
  const me = stop("me", 41, 29, ["1"]);
  const across = stop("across", 41.0005, 29, ["1"]); // ~55 m, shares line 1
  const other = stop("other", 41.003, 29, ["2"]); // ~330 m
  const far = stop("far", 42, 30, ["1"]);

  it("finds the opposite stop and nearby stops", () => {
    const v = buildStopView(me, [me, across, other, far], meta, new Map());
    expect(v.opposite?.stop.id).toBe("across");
    expect(v.nearby.map((n) => n.stop.id)).toEqual(["other"]);
  });
});
