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
  /**
   * A picture for the example word, as an emoji.
   *
   * Emoji rather than illustrations on purpose: they render at any size, cost
   * no bytes, need no licence, and are already familiar to a child who has
   * seen a phone. An illustrated set can replace them later without touching
   * the component — but a letter with no picture shows none rather than a
   * broken image.
   */
  emoji?: string;
};

/** అచ్చులు — the 16 vowels. */
export const TELUGU_VOWELS: Letter[] = [
  { glyph: "అ", roman: "a", example: "అమ్మ", exampleGloss: "mother", emoji: "👩" },
  { glyph: "ఆ", roman: "aa", example: "ఆవు", exampleGloss: "cow", emoji: "🐄" },
  { glyph: "ఇ", roman: "i", example: "ఇల్లు", exampleGloss: "house", emoji: "🏠" },
  { glyph: "ఈ", roman: "ii", example: "ఈగ", exampleGloss: "fly", emoji: "🪰" },
  { glyph: "ఉ", roman: "u", example: "ఉడత", exampleGloss: "squirrel", emoji: "🐿️" },
  { glyph: "ఊ", roman: "uu", example: "ఊయల", exampleGloss: "cradle", emoji: "👶" },
  { glyph: "ఋ", roman: "ru" },
  { glyph: "ౠ", roman: "ruu" },
  { glyph: "ఎ", roman: "e", example: "ఎలుక", exampleGloss: "mouse", emoji: "🐁" },
  { glyph: "ఏ", roman: "ee", example: "ఏనుగు", exampleGloss: "elephant", emoji: "🐘" },
  { glyph: "ఐ", roman: "ai" },
  { glyph: "ఒ", roman: "o", example: "ఒంటె", exampleGloss: "camel", emoji: "🐫" },
  { glyph: "ఓ", roman: "oo" },
  { glyph: "ఔ", roman: "au" },
  { glyph: "అం", roman: "am" },
  { glyph: "అః", roman: "aha" },
];

/** హల్లులు — the 36 consonants, in the traditional order. */
export const TELUGU_CONSONANTS: Letter[] = [
  { glyph: "క", roman: "ka", example: "కమలం", exampleGloss: "lotus", emoji: "🪷" },
  { glyph: "ఖ", roman: "kha", example: "ఖడ్గం", exampleGloss: "sword", emoji: "🗡️" },
  { glyph: "గ", roman: "ga", example: "గడియారం", exampleGloss: "clock", emoji: "🕐" },
  { glyph: "ఘ", roman: "gha", example: "ఘంట", exampleGloss: "bell", emoji: "🔔" },
  { glyph: "ఙ", roman: "nga" },
  { glyph: "చ", roman: "cha", example: "చెట్టు", exampleGloss: "tree", emoji: "🌳" },
  { glyph: "ఛ", roman: "chha", example: "ఛత్రం", exampleGloss: "umbrella", emoji: "☂️" },
  { glyph: "జ", roman: "ja", example: "జింక", exampleGloss: "deer", emoji: "🦌" },
  { glyph: "ఝ", roman: "jha" },
  { glyph: "ఞ", roman: "nya" },
  { glyph: "ట", roman: "ta", example: "టమాటా", exampleGloss: "tomato", emoji: "🍅" },
  { glyph: "ఠ", roman: "tha" },
  { glyph: "డ", roman: "da", example: "డప్పు", exampleGloss: "drum", emoji: "🥁" },
  { glyph: "ఢ", roman: "dha" },
  { glyph: "ణ", roman: "na" },
  { glyph: "త", roman: "ta", example: "తామర", exampleGloss: "lotus", emoji: "🪷" },
  { glyph: "థ", roman: "tha" },
  { glyph: "ద", roman: "da", example: "దీపం", exampleGloss: "lamp", emoji: "🪔" },
  { glyph: "ధ", roman: "dha", example: "ధనుస్సు", exampleGloss: "bow", emoji: "🏹" },
  { glyph: "న", roman: "na", example: "నది", exampleGloss: "river", emoji: "🏞️" },
  { glyph: "ప", roman: "pa", example: "పండు", exampleGloss: "fruit", emoji: "🍎" },
  { glyph: "ఫ", roman: "pha" },
  { glyph: "బ", roman: "ba", example: "బడి", exampleGloss: "school", emoji: "🏫" },
  { glyph: "భ", roman: "bha" },
  { glyph: "మ", roman: "ma", example: "మామిడి", exampleGloss: "mango", emoji: "🥭" },
  { glyph: "య", roman: "ya" },
  { glyph: "ర", roman: "ra", example: "రవి", exampleGloss: "sun", emoji: "☀️" },
  { glyph: "ల", roman: "la" },
  { glyph: "వ", roman: "va", example: "వాన", exampleGloss: "rain", emoji: "🌧️" },
  { glyph: "శ", roman: "sha" },
  { glyph: "ష", roman: "sha" },
  { glyph: "స", roman: "sa", example: "సూర్యుడు", exampleGloss: "sun", emoji: "☀️" },
  { glyph: "హ", roman: "ha" },
  { glyph: "ళ", roman: "la" },
  { glyph: "క్ష", roman: "ksha" },
  { glyph: "ఱ", roman: "rra" },
];

export const ENGLISH_ALPHABET: Letter[] = [
  { glyph: "A", roman: "a", example: "Apple", exampleGloss: "యాపిల్", emoji: "🍎" },
  { glyph: "B", roman: "b", example: "Ball", exampleGloss: "బంతి", emoji: "⚽" },
  { glyph: "C", roman: "c", example: "Cat", exampleGloss: "పిల్లి", emoji: "🐱" },
  { glyph: "D", roman: "d", example: "Dog", exampleGloss: "కుక్క", emoji: "🐶" },
  { glyph: "E", roman: "e", example: "Elephant", exampleGloss: "ఏనుగు", emoji: "🐘" },
  { glyph: "F", roman: "f", example: "Fish", exampleGloss: "చేప", emoji: "🐟" },
  { glyph: "G", roman: "g", example: "Goat", exampleGloss: "మేక", emoji: "🐐" },
  { glyph: "H", roman: "h", example: "House", exampleGloss: "ఇల్లు", emoji: "🏠" },
  { glyph: "I", roman: "i", example: "Ink", exampleGloss: "సిరా", emoji: "🖋️" },
  { glyph: "J", roman: "j", example: "Jug", exampleGloss: "కూజా", emoji: "🫙" },
  { glyph: "K", roman: "k", example: "Kite", exampleGloss: "గాలిపటం", emoji: "🪁" },
  { glyph: "L", roman: "l", example: "Leaf", exampleGloss: "ఆకు", emoji: "🍃" },
  { glyph: "M", roman: "m", example: "Mango", exampleGloss: "మామిడి", emoji: "🥭" },
  { glyph: "N", roman: "n", example: "Nest", exampleGloss: "గూడు", emoji: "🪹" },
  { glyph: "O", roman: "o", example: "Orange", exampleGloss: "నారింజ", emoji: "🍊" },
  { glyph: "P", roman: "p", example: "Parrot", exampleGloss: "చిలుక", emoji: "🦜" },
  { glyph: "Q", roman: "q", example: "Queen", exampleGloss: "రాణి", emoji: "👑" },
  { glyph: "R", roman: "r", example: "Rain", exampleGloss: "వాన", emoji: "🌧️" },
  { glyph: "S", roman: "s", example: "Sun", exampleGloss: "సూర్యుడు", emoji: "☀️" },
  { glyph: "T", roman: "t", example: "Tree", exampleGloss: "చెట్టు", emoji: "🌳" },
  { glyph: "U", roman: "u", example: "Umbrella", exampleGloss: "గొడుగు", emoji: "☂️" },
  { glyph: "V", roman: "v", example: "Van", exampleGloss: "వ్యాన్", emoji: "🚐" },
  { glyph: "W", roman: "w", example: "Water", exampleGloss: "నీరు", emoji: "💧" },
  { glyph: "X", roman: "x", example: "Xylophone", exampleGloss: "జైలోఫోన్", emoji: "🎹" },
  { glyph: "Y", roman: "y", example: "Yellow", exampleGloss: "పసుపు", emoji: "💛" },
  { glyph: "Z", roman: "z", example: "Zebra", exampleGloss: "జీబ్రా", emoji: "🦓" },
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
