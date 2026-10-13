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

import { sitemapIds, sitemapIndexXml } from "./sitemap-utils";

describe("sitemap index", () => {
  it("lists a guide sitemap and three types per city and language", () => {
    const ids = sitemapIds(["tr"], ["istanbul", "ankara"]);
    expect(ids).toEqual([
      "tr-guide", "tr-istanbul-stop", "tr-istanbul-line", "tr-istanbul-list",
      "tr-ankara-stop", "tr-ankara-line", "tr-ankara-list",
    ]);
  });
  it("builds valid index xml", () => {
    expect(sitemapIndexXml("https://x.test", ["tr-guide"])).toContain(
      "<loc>https://x.test/sitemap/tr-guide.xml</loc>",
    );
  });
});
