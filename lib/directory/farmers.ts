/**
 * Farmer and agriculture services.
 *
 * Schemes, land records and market prices — the things a farmer in
 * Reddivaripalli has to reach a computer for. No crop advice lives in this
 * file: advice needs its own provenance and belongs in the typed content
 * layer, not in a link directory.
 */
import { entry, type DirectoryEntry } from "./types";

const V = "2026-08-28";
const NP = {
  source: "National Portal of India",
  sourceUrl: "https://www.india.gov.in/",
  lastVerified: V,
};

export const FARMERS: DirectoryEntry[] = [
  entry({
    id: "pmkisan",
    name: "PM-KISAN",
    nameTe: "పీఎం-కిసాన్",
    description:
      "Central income support for farming families — registration, e-KYC and beneficiary status.",
    descriptionTe: "రైతు కుటుంబాలకు కేంద్ర ఆదాయ మద్దతు — నమోదు, ఈ-కేవైసీ, స్థితి.",
    category: "farmers",
    audience: ["farmers"],
    level: "central",
    department: "Ministry of Agriculture & Farmers Welfare",
    officialUrl: "https://pmkisan.gov.in/",
    keywords: ["pm kisan", "pmkisan", "kisan", "farmer money", "పీఎం కిసాన్", "రైతు"],
    ...NP,
  }),
  entry({
    id: "pmfby",
    name: "PM Fasal Bima Yojana — crop insurance",
    nameTe: "పంట బీమా (పీఎంఎఫ్‌బీవై)",
    description: "Crop insurance enrolment, premium calculator and claim status.",
    descriptionTe: "పంట బీమా నమోదు, ప్రీమియం లెక్కింపు, క్లెయిమ్ స్థితి.",
    category: "farmers",
    audience: ["farmers"],
    level: "central",
    department: "Ministry of Agriculture & Farmers Welfare",
    officialUrl: "https://pmfby.gov.in/",
    keywords: ["crop insurance", "fasal bima", "pmfby", "పంట బీమా"],
    ...NP,
  }),
  entry({
    id: "enam",
    name: "e-NAM — national agriculture market",
    nameTe: "ఈ-నామ్ మార్కెట్",
    description: "Mandi prices and online trading across connected markets.",
    descriptionTe: "మార్కెట్ ధరలు మరియు ఆన్‌లైన్ వ్యాపారం.",
    category: "farmers",
    audience: ["farmers"],
    level: "central",
    department: "Ministry of Agriculture & Farmers Welfare",
    officialUrl: "https://enam.gov.in/",
    keywords: ["enam", "mandi", "crop price", "market price", "ధరలు", "మార్కెట్"],
    ...NP,
  }),
  entry({
    id: "soilhealth",
    name: "Soil Health Card",
    nameTe: "భూసార కార్డు",
    description: "Soil test results and nutrient recommendations for your plot.",
    descriptionTe: "మీ పొలం భూసార పరీక్ష ఫలితాలు మరియు పోషక సిఫార్సులు.",
    category: "farmers",
    audience: ["farmers"],
    level: "central",
    department: "Department of Agriculture & Farmers Welfare",
    officialUrl: "https://soilhealth.dac.gov.in/",
    keywords: ["soil", "soil health", "fertilizer", "భూసారం", "ఎరువులు"],
    ...NP,
  }),
  entry({
    id: "icar",
    name: "ICAR",
    nameTe: "ఐసీఏఆర్",
    description:
      "Indian Council of Agricultural Research — research institutes, KVKs and published crop guidance.",
    descriptionTe: "వ్యవసాయ పరిశోధన మండలి — పరిశోధన సంస్థలు, కేవీకేలు, పంట మార్గదర్శకాలు.",
    category: "farmers",
    audience: ["farmers"],
    level: "central",
    department: "Indian Council of Agricultural Research",
    officialUrl: "https://icar.gov.in/",
    keywords: ["icar", "kvk", "research", "crop guidance", "పరిశోధన"],
    ...NP,
  }),
  entry({
    id: "nabard",
    name: "NABARD",
    nameTe: "నాబార్డ్",
    description:
      "Rural and agricultural development bank — refinance, SHG and rural credit information.",
    category: "farmers",
    audience: ["farmers", "business"],
    level: "regulator",
    department: "National Bank for Agriculture and Rural Development",
    officialUrl: "https://www.nabard.org/",
    keywords: ["nabard", "rural credit", "shg", "loan", "రుణం"],
    source: "Reserve Bank of India — bank links",
    sourceUrl: "https://www.rbi.org.in/Scripts/banklinks.aspx",
    lastVerified: V,
  }),
];
