import { describe, expect, it } from "vitest";
import { parseStopSegment, slugify, stopSegment } from "./slug";

describe("slugs", () => {
  it("transliterates Turkish letters", () => {
    expect(slugify("Şişli Mecidiyeköy Metro İstasyonu")).toBe("sisli-mecidiyekoy-metro-istasyonu");
    expect(slugify("Rıfat Ilgaz Caddesi")).toBe("rifat-ilgaz-caddesi");
    expect(slugify("İ.ü. Cerrahpaşa Avc. Kamp.")).toBe("i-u-cerrahpasa-avc-kamp");
  });
  it("round-trips a stop segment", () => {
    const seg = stopSegment("eg_10001", "Aka Cami");
    expect(seg).toBe("eg_10001-aka-cami");
    expect(parseStopSegment(seg)).toEqual({ code: "eg_10001", slug: "aka-cami" });
  });
  it("falls back to the bare code", () => {
    expect(stopSegment("42", "...")).toBe("42");
  });
});
