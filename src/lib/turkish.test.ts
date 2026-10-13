import { describe, expect, it } from "vitest";
import { withSuffix } from "./turkish";

describe("withSuffix", () => {
  it("follows vowel harmony for names", () => {
    expect(withSuffix("Kadıköy", "abl")).toBe("Kadıköy'den");
    expect(withSuffix("Kızılay", "abl")).toBe("Kızılay'dan");
    expect(withSuffix("Kızılay", "dat")).toBe("Kızılay'a");
    expect(withSuffix("Taksim", "dat")).toBe("Taksim'e");
  });
  it("hardens d to t after voiceless consonants", () => {
    expect(withSuffix("Beşiktaş", "abl")).toBe("Beşiktaş'tan");
    expect(withSuffix("Bursa", "loc")).toBe("Bursa'da");
    expect(withSuffix("Sirkeci", "loc")).toBe("Sirkeci'de");
  });
  it("adds the buffer y after vowels in dative", () => {
    expect(withSuffix("Ankara", "dat")).toBe("Ankara'ya");
    expect(withSuffix("Üsküdar", "dat")).toBe("Üsküdar'a");
    expect(withSuffix("Eminönü", "dat")).toBe("Eminönü'ye");
  });
  it("reads numbers aloud", () => {
    expect(withSuffix("05:30", "loc")).toBe("05:30'da"); // otuz
    expect(withSuffix("21:10", "loc")).toBe("21:10'da"); // on
    expect(withSuffix("06:45", "loc")).toBe("06:45'te"); // kırk beş -> beş
    expect(withSuffix("142", "abl")).toBe("142'den"); // iki
    expect(withSuffix("34", "abl")).toBe("34'ten"); // dört
    expect(withSuffix("500", "dat")).toBe("500'e"); // yüz
  });
  it("reads trailing letters of line codes by letter name", () => {
    expect(withSuffix("142A", "abl")).toBe("142A'dan");
    expect(withSuffix("142ES", "abl")).toBe("142ES'den"); // se, ends in a vowel
    expect(withSuffix("M2", "abl")).toBe("M2'den");
  });
});
