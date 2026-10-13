import { describe, expect, it } from "vitest";
import { GUIDES } from "./guides";

describe("guides", () => {
  it("have unique slugs and complete copy in both languages", () => {
    expect(new Set(GUIDES.map((g) => g.slug)).size).toBe(GUIDES.length);
    for (const g of GUIDES) {
      for (const c of [g.tr, g.en]) {
        expect(c.title.length).toBeGreaterThan(10);
        expect(c.description.length).toBeLessThanOrEqual(200);
        expect(c.sections.length).toBeGreaterThan(0);
      }
    }
  });
});
