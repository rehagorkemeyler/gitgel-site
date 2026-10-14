import { describe, expect, it } from "vitest";
import route from "@/content/landing-route.json";
import { landingText, type RideRoute } from "./landing";

const r = route as RideRoute;

describe("landingText", () => {
  it("builds the story from the 413 snapshot with correct suffixes", () => {
    const t = landingText("tr", r);
    expect(t.scrollHint).toBe("Kaydır: 413 ile Altınpark'tan Atakule'ye gidelim");
    expect(t.steps.at(-1)?.body).toMatch(/^Altınpark'tan Atakule'ye 24 durak, [\d,]+ km, 24 dakika\./);
    expect(t.steps.every((s) => s.stop >= 0 && s.stop < r.stops.length)).toBe(true);
  });
  it("has a feature and a demo for every middle step, in both languages", () => {
    for (const lang of ["tr", "en"] as const) {
      const middle = landingText(lang, r).steps.slice(1, -1);
      expect(middle.every((s) => s.feature && s.demo)).toBe(true);
    }
  });
  it("orders the story stops along the route", () => {
    const meters = landingText("en", r).steps.map((s) => r.stops[s.stop].meters);
    expect([...meters].sort((a, b) => a - b)).toEqual(meters);
  });
});
