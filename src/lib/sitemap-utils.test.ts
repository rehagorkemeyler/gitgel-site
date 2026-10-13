import { describe, expect, it } from "vitest";
import { chunk } from "./sitemap-utils";

describe("chunk", () => {
  it("splits at the limit", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("keeps one empty chunk for empty input", () => {
    expect(chunk([])).toEqual([[]]);
  });
});
