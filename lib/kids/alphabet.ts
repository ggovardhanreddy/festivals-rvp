/**
 * Alphabet and number reference data for Kids World.
 *
 * Everything here is standard, checkable schoolbook material — the Telugu
 * aksharamala as it is taught (16 achchulu, 36 hallulu), the Latin alphabet,
 * and the Telugu numerals and number names. Nothing about the village, its
 * people or its history appears in this file, because none of that could be
 * sourced for a children's section without provenance.
 *
 * `example` is optional on purpose. A letter with no example word renders
 * without one rather than with an invented one.
 */

export type Letter = {
  /** The letter itself. */
  glyph: string;
  /** Roman transliteration, for a reader who does not yet read the script. */
  roman: string;
  /** A common word beginning with this letter. Optional — never invented. */
  example?: string;
  /** English gloss of `example`. */
  exampleGloss?: string;
};

/** అచ్చులు — the 16 vowels. */
export const TELUGU_VOWELS: Letter[] = [
  { glyph: "అ", roman: "a", example: "అమ్మ", exampleGloss: "mother" },
  { glyph: "ఆ", roman: "aa", example: "ఆవు", exampleGloss: "cow" },
  { glyph: "ఇ", roman: "i", example: "ఇల్లు", exampleGloss: "house" },
  { glyph: "ఈ", roman: "ii", example: "ఈగ", exampleGloss: "fly" },
  { glyph: "ఉ", roman: "u", example: "ఉడత", exampleGloss: "squirrel" },
  { glyph: "ఊ", roman: "uu", example: "ఊయల", exampleGloss: "cradle" },
  { glyph: "ఋ", roman: "ru" },
  { glyph: "ౠ", roman: "ruu" },
  { glyph: "ఎ", roman: "e", example: "ఎలుక", exampleGloss: "mouse" },
  { glyph: "ఏ", roman: "ee", example: "ఏనుగు", exampleGloss: "elephant" },
  { glyph: "ఐ", roman: "ai" },
  { glyph: "ఒ", roman: "o", example: "ఒంటె", exampleGloss: "camel" },
  { glyph: "ఓ", roman: "oo" },
  { glyph: "ఔ", roman: "au" },
  { glyph: "అం", roman: "am" },
  { glyph: "అః", roman: "aha" },
];

/** హల్లులు — the 36 consonants, in the traditional order. */
export const TELUGU_CONSONANTS: Letter[] = [
  { glyph: "క", roman: "ka", example: "కమలం", exampleGloss: "lotus" },
  { glyph: "ఖ", roman: "kha", example: "ఖడ్గం", exampleGloss: "sword" },
  { glyph: "గ", roman: "ga", example: "గడియారం", exampleGloss: "clock" },
  { glyph: "ఘ", roman: "gha", example: "ఘంట", exampleGloss: "bell" },
  { glyph: "ఙ", roman: "nga" },
  { glyph: "చ", roman: "cha", example: "చెట్టు", exampleGloss: "tree" },
  { glyph: "ఛ", roman: "chha", example: "ఛత్రం", exampleGloss: "umbrella" },
  { glyph: "జ", roman: "ja", example: "జింక", exampleGloss: "deer" },
  { glyph: "ఝ", roman: "jha" },
  { glyph: "ఞ", roman: "nya" },
  { glyph: "ట", roman: "ta", example: "టమాటా", exampleGloss: "tomato" },
  { glyph: "ఠ", roman: "tha" },
  { glyph: "డ", roman: "da", example: "డప్పు", exampleGloss: "drum" },
  { glyph: "ఢ", roman: "dha" },
  { glyph: "ణ", roman: "na" },
  { glyph: "త", roman: "ta", example: "తామర", exampleGloss: "lotus" },
  { glyph: "థ", roman: "tha" },
  { glyph: "ద", roman: "da", example: "దీపం", exampleGloss: "lamp" },
  { glyph: "ధ", roman: "dha", example: "ధనుస్సు", exampleGloss: "bow" },
  { glyph: "న", roman: "na", example: "నది", exampleGloss: "river" },
  { glyph: "ప", roman: "pa", example: "పండు", exampleGloss: "fruit" },
  { glyph: "ఫ", roman: "pha" },
  { glyph: "బ", roman: "ba", example: "బడి", exampleGloss: "school" },
  { glyph: "భ", roman: "bha" },
  { glyph: "మ", roman: "ma", example: "మామిడి", exampleGloss: "mango" },
  { glyph: "య", roman: "ya" },
  { glyph: "ర", roman: "ra", example: "రవి", exampleGloss: "sun" },
  { glyph: "ల", roman: "la" },
  { glyph: "వ", roman: "va", example: "వాన", exampleGloss: "rain" },
  { glyph: "శ", roman: "sha" },
  { glyph: "ష", roman: "sha" },
  { glyph: "స", roman: "sa", example: "సూర్యుడు", exampleGloss: "sun" },
  { glyph: "హ", roman: "ha" },
  { glyph: "ళ", roman: "la" },
  { glyph: "క్ష", roman: "ksha" },
  { glyph: "ఱ", roman: "rra" },
];

export const ENGLISH_ALPHABET: Letter[] = [
  { glyph: "A", roman: "a", example: "Apple", exampleGloss: "యాపిల్" },
  { glyph: "B", roman: "b", example: "Ball", exampleGloss: "బంతి" },
  { glyph: "C", roman: "c", example: "Cat", exampleGloss: "పిల్లి" },
  { glyph: "D", roman: "d", example: "Dog", exampleGloss: "కుక్క" },
  { glyph: "E", roman: "e", example: "Elephant", exampleGloss: "ఏనుగు" },
  { glyph: "F", roman: "f", example: "Fish", exampleGloss: "చేప" },
  { glyph: "G", roman: "g", example: "Goat", exampleGloss: "మేక" },
  { glyph: "H", roman: "h", example: "House", exampleGloss: "ఇల్లు" },
  { glyph: "I", roman: "i", example: "Ink", exampleGloss: "సిరా" },
  { glyph: "J", roman: "j", example: "Jug", exampleGloss: "కూజా" },
  { glyph: "K", roman: "k", example: "Kite", exampleGloss: "గాలిపటం" },
  { glyph: "L", roman: "l", example: "Leaf", exampleGloss: "ఆకు" },
  { glyph: "M", roman: "m", example: "Mango", exampleGloss: "మామిడి" },
  { glyph: "N", roman: "n", example: "Nest", exampleGloss: "గూడు" },
  { glyph: "O", roman: "o", example: "Orange", exampleGloss: "నారింజ" },
  { glyph: "P", roman: "p", example: "Parrot", exampleGloss: "చిలుక" },
  { glyph: "Q", roman: "q", example: "Queen", exampleGloss: "రాణి" },
  { glyph: "R", roman: "r", example: "Rain", exampleGloss: "వాన" },
  { glyph: "S", roman: "s", example: "Sun", exampleGloss: "సూర్యుడు" },
  { glyph: "T", roman: "t", example: "Tree", exampleGloss: "చెట్టు" },
  { glyph: "U", roman: "u", example: "Umbrella", exampleGloss: "గొడుగు" },
  { glyph: "V", roman: "v", example: "Van", exampleGloss: "వ్యాన్" },
  { glyph: "W", roman: "w", example: "Water", exampleGloss: "నీరు" },
  { glyph: "X", roman: "x", example: "Xylophone", exampleGloss: "జైలోఫోన్" },
  { glyph: "Y", roman: "y", example: "Yellow", exampleGloss: "పసుపు" },
  { glyph: "Z", roman: "z", example: "Zebra", exampleGloss: "జీబ్రా" },
];

export type NumberEntry = {
  value: number;
  /** Telugu digit glyph, e.g. ౧ for 1. */
  telugu: string;
  /** Telugu name, e.g. ఒకటి. */
  teluguWord: string;
  englishWord: string;
};

const TELUGU_DIGITS = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];

function teluguNumeral(n: number): string {
  return String(n)
    .split("")
    .map((d) => TELUGU_DIGITS[Number(d)])
    .join("");
}

const TELUGU_WORDS = [
  "సున్నా", "ఒకటి", "రెండు", "మూడు", "నాలుగు", "ఐదు", "ఆరు", "ఏడు",
  "ఎనిమిది", "తొమ్మిది", "పది", "పదకొండు", "పన్నెండు", "పదమూడు",
  "పద్నాలుగు", "పదిహేను", "పదహారు", "పదిహేడు", "పద్దెనిమిది",
  "పంతొమ్మిది", "ఇరవై",
];

const ENGLISH_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

export const NUMBERS: NumberEntry[] = Array.from({ length: 21 }, (_, n) => ({
  value: n,
  telugu: teluguNumeral(n),
  teluguWord: TELUGU_WORDS[n]!,
  englishWord: ENGLISH_WORDS[n]!,
}));
