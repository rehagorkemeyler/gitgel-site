export type SuffixKind = "abl" | "dat" | "loc";

const FRONT = "eiöü";
const BACK = "aıou";
const VOWELS = FRONT + BACK;
const VOICELESS = "çfhkpsşt";

const ONES = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];

const LETTER_NAMES: Record<string, string> = {
  a: "a", b: "be", c: "ce", ç: "çe", d: "de", e: "e", f: "fe", g: "ge", ğ: "ğe", h: "he",
  ı: "ı", i: "i", j: "je", k: "ke", l: "le", m: "me", n: "ne", o: "o", ö: "ö", p: "pe",
  r: "re", s: "se", ş: "şe", t: "te", u: "u", ü: "ü", v: "ve", w: "ve", x: "iks", y: "ye",
  z: "ze", q: "kü",
};

function lowerTr(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLocaleLowerCase("tr");
}

// How the last number in a string is spoken (only its final word matters).
function lastSpokenNumberWord(digits: string): string {
  const n = Number(digits.slice(-4));
  if (n === 0) return "sıfır";
  if (n % 10 !== 0) return ONES[n % 10];
  if (n % 100 !== 0) return TENS[Math.floor(n / 10) % 10];
  if (n % 1000 !== 0) return "yüz";
  return "bin";
}

// The word whose sound decides the suffix: codes like "142A" or "05:30" are
// read aloud, ordinary names are used as written.
function soundWord(text: string): string {
  const trimmed = text.trim().replace(/[^\p{L}\p{N}]+$/u, "");
  const token = trimmed.split(/[\s]+/).pop() ?? "";
  const lastChar = lowerTr(token.slice(-1));
  if (/\d/.test(token)) {
    if (/\d$/.test(token)) return lastSpokenNumberWord(token.match(/\d+$/)![0]);
    return LETTER_NAMES[lastChar] ?? lastChar;
  }
  return lowerTr(token);
}

/** Appends a Turkish case suffix with vowel harmony, e.g. ("142A", "abl") -> "142A'dan". */
export function withSuffix(text: string, kind: SuffixKind): string {
  const sound = soundWord(text);
  const lastVowel = [...sound].reverse().find((c) => VOWELS.includes(c)) ?? "e";
  const back = BACK.includes(lastVowel);
  const lastChar = sound.slice(-1);
  const endsInVowel = VOWELS.includes(lastChar);
  const vowel = back ? "a" : "e";
  let suffix: string;
  if (kind === "dat") suffix = (endsInVowel ? "y" : "") + vowel;
  else {
    const d = VOICELESS.includes(lastChar) ? "t" : "d";
    suffix = kind === "loc" ? d + vowel : d + vowel + "n";
  }
  return `${text.trim()}'${suffix}`;
}
