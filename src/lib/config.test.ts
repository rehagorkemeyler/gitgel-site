import { describe, expect, it } from "vitest";
import { ENABLED_LANGS, dirOf, isEnabledLang } from "./config";

describe("language config", () => {
  it("launches with tr and en only", () => {
    expect([...ENABLED_LANGS]).toEqual(["tr", "en"]);
    expect(isEnabledLang("ru")).toBe(false);
  });
  it("uses rtl for ar and fa", () => {
    expect(dirOf("ar")).toBe("rtl");
    expect(dirOf("fa")).toBe("rtl");
    expect(dirOf("tr")).toBe("ltr");
  });
});
