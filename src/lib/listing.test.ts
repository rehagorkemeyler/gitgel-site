import { describe, expect, it } from "vitest";
import { groupLinesByMode, letterKey, searchStops } from "./listing";
import type { LineMeta, Stop } from "./data";

const stop = (id: string, name: string): Stop => ({ id, name, lat: 0, lon: 0, mode: "bus", lines: [] });

describe("letterKey", () => {
  it("folds Turkish letters to ascii", () => {
    expect(letterKey("Şişli")).toBe("s");
    expect(letterKey("İkitelli")).toBe("i");
    expect(letterKey("Ihlamur")).toBe("i");
    expect(letterKey("Çamlıca")).toBe("c");
    expect(letterKey("19 Mayıs")).toBe("0-9");
  });
});

describe("searchStops", () => {
  const stops = [stop("1", "Kadıköy İskele"), stop("2", "Kızılay"), stop("3", "Kadife Sk.")];
  it("matches regardless of Turkish diacritics", () => {
    expect(searchStops(stops, "kadikoy").map((s) => s.id)).toEqual(["1"]);
    expect(searchStops(stops, "KADI").map((s) => s.id)).toEqual(["1", "3"]);
  });
  it("ignores too-short queries", () => {
    expect(searchStops(stops, "k")).toEqual([]);
  });
});

describe("groupLinesByMode", () => {
  it("orders modes and sorts names naturally", () => {
    const l = (id: string, name: string, mode: string): LineMeta => ({ id, name, long_name: "", mode });
    const g = groupLinesByMode([l("b", "10", "bus"), l("a", "9", "bus"), l("m", "M1", "metro")]);
    expect(g.map((x) => x.mode)).toEqual(["metro", "bus"]);
    expect(g[1].lines.map((x) => x.name)).toEqual(["9", "10"]);
  });
});
