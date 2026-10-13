import { describe, expect, it } from "vitest";
import { stopText } from "./sentences";
import type { StopView } from "./stop-view";

const view = (first: string, last: string): StopView => ({
  stop: { id: "1", name: "Üsküdar", lat: 0, lon: 0, mode: "ferry", lines: ["x"] },
  lines: [{ id: "x", name: "X1", longName: "A-B", mode: "ferry", departures: [{ headsign: "Kadıköy", first, last }] }],
  opposite: null,
  nearby: [],
});

describe("stopText", () => {
  it("uses ferry wording and a single-service sentence in Turkish", () => {
    const t = stopText("tr", view("08:30", "08:30"), "1", "istanbul");
    expect(t.h1).toBe("Üsküdar iskelesi");
    expect(t.intro).toBe("İstanbul'da Üsküdar iskelesinden 1 hat geçer: X1.");
    expect(t.lineSentences[0].sentences[0]).toBe(
      "Kadıköy yönünde hafta içi tek sefer yaklaşık 08:30'da bu iskeleden geçer.",
    );
  });
  it("writes natural English", () => {
    const t = stopText("en", view("08:30", "09:30"), "1", "istanbul");
    expect(t.intro).toBe("Üsküdar is a ferry pier in Istanbul, served by 1 line: X1.");
    expect(t.lineSentences[0].sentences[0]).toContain("first service reaches this stop around 08:30");
  });
});
