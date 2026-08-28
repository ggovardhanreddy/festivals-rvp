/**
 * Andhra Pradesh state services.
 *
 * The Grama/Ward Sachivalayam is first because it is where almost everything
 * actually starts for someone living in Reddivaripalli: the online portals
 * below are the same services, reachable from home when they work.
 */
import { entry, type DirectoryEntry } from "./types";

const V = "2026-08-28";
const AP = {
  source: "Government of Andhra Pradesh",
  sourceUrl: "https://www.ap.gov.in/",
  lastVerified: V,
};

export const ANDHRA: DirectoryEntry[] = [
  entry({
    id: "ap-gov",
    name: "Government of Andhra Pradesh",
    nameTe: "ఆంధ్రప్రదేశ్ ప్రభుత్వం",
    description: "State portal — departments, schemes and district links.",
    descriptionTe: "రాష్ట్ర పోర్టల్ — శాఖలు, పథకాలు, జిల్లా లింకులు.",
    category: "aggregator",
    audience: ["everyone"],
    level: "state",
    department: "Government of Andhra Pradesh",
    officialUrl: "https://www.ap.gov.in/",
    keywords: ["ap", "andhra", "state", "ఆంధ్రప్రదేశ్"],
    ...AP,
  }),
  entry({
    id: "gsws",
    name: "Grama / Ward Sachivalayam",
    nameTe: "గ్రామ సచివాలయం",
    description:
      "The village secretariat. Most certificates, pensions and welfare applications start here.",
    descriptionTe:
      "గ్రామ సచివాలయం — చాలా ధ్రువపత్రాలు, పింఛన్లు, సంక్షేమ దరఖాస్తులు ఇక్కడే మొదలవుతాయి.",
    category: "certificates",
    audience: ["everyone", "seniors", "farmers"],
    level: "state",
    department: "Government of Andhra Pradesh",
    officialUrl: "https://gramawardsachivalayam.ap.gov.in/",
    keywords: ["sachivalayam", "village secretariat", "గ్రామ సచివాలయం", "సచివాలయం"],
    ...AP,
  }),
  entry({
    id: "meeseva",
    name: "AP MeeSeva",
    nameTe: "మీసేవ",
    description:
      "Caste, income, residence, integrated, birth and death certificates, land extracts and dozens more services across departments.",
    descriptionTe:
      "కుల, ఆదాయ, నివాస, ఇంటిగ్రేటెడ్, జనన, మరణ ధ్రువపత్రాలు, భూమి రికార్డులు మరియు అనేక సేవలు.",
    category: "certificates",
    audience: ["everyone"],
    level: "state",
    department: "Government of Andhra Pradesh",
    officialUrl: "https://onlineap.meeseva.gov.in/",
    keywords: [
      "meeseva", "mee seva", "caste certificate", "income certificate",
      "residence certificate", "integrated certificate", "birth certificate",
      "death certificate", "మీసేవ", "కుల ధ్రువపత్రం", "ఆదాయ ధ్రువపత్రం",
      "జనన ధ్రువపత్రం", "మరణ ధ్రువపత్రం",
    ],
    ...AP,
  }),
  entry({
    id: "kadapa",
    name: "YSR (Kadapa) District",
    nameTe: "వైఎస్సార్ (కడప) జిల్లా",
    description:
      "District administration for Sambepalle mandal — notices, officials and district schemes.",
    descriptionTe: "సంబేపల్లె మండలం ఉన్న జిల్లా పరిపాలన.",
    category: "aggregator",
    audience: ["everyone"],
    level: "state",
    department: "Government of Andhra Pradesh",
    officialUrl: "https://kadapa.ap.gov.in/",
    keywords: ["kadapa", "ysr", "district", "sambepalle", "కడప", "జిల్లా"],
    ...AP,
  }),
  entry({
    id: "meebhoomi",
    name: "Meebhoomi — land records",
    nameTe: "మీభూమి — భూమి రికార్డులు",
    description: "Adangal, ROR-1B, village map and land record extracts.",
    descriptionTe: "అడంగల్, ఆర్‌ఓఆర్-1బి, గ్రామ పటం మరియు భూమి రికార్డులు.",
    category: "land",
    audience: ["farmers", "everyone"],
    level: "state",
    department: "Revenue Department, Government of Andhra Pradesh",
    officialUrl: "https://meebhoomi.ap.gov.in/",
    keywords: [
      "adangal", "1b", "ror", "land records", "pattadar", "fmb", "village map",
      "అడంగల్", "1బి", "భూమి", "పట్టాదారు",
    ],
    ...AP,
  }),
  entry({
    id: "ap-agriculture",
    name: "AP Department of Agriculture",
    nameTe: "వ్యవసాయ శాఖ",
    description: "State schemes, advisories and contacts for farmers.",
    descriptionTe: "రైతుల కోసం రాష్ట్ర పథకాలు, సలహాలు, సంప్రదింపు వివరాలు.",
    category: "farmers",
    audience: ["farmers"],
    level: "state",
    department: "Government of Andhra Pradesh",
    officialUrl: "https://agriculture.ap.gov.in/",
    keywords: ["agriculture", "farming", "వ్యవసాయం", "రైతు"],
    ...AP,
  }),
  entry({
    id: "apagrisnet",
    name: "AP AgriSNet",
    nameTe: "ఏపీ అగ్రిస్‌నెట్",
    description: "Departmental notifications, input subsidy and advisory notices.",
    category: "farmers",
    audience: ["farmers"],
    level: "state",
    department: "Department of Agriculture, Government of Andhra Pradesh",
    officialUrl: "https://www.apagrisnet.gov.in/",
    keywords: ["agrisnet", "subsidy", "notification", "సబ్సిడీ"],
    ...AP,
  }),
  entry({
    id: "e-panta",
    name: "e-Panta / e-Crop — crop booking",
    nameTe: "ఈ-పంట",
    description: "Crop registration and e-crop booking for Andhra Pradesh farmers.",
    descriptionTe: "పంట నమోదు మరియు ఈ-పంట బుకింగ్.",
    category: "farmers",
    audience: ["farmers"],
    level: "state",
    department: "Department of Agriculture, Government of Andhra Pradesh",
    officialUrl: "https://karshak.ap.gov.in/ecrop/",
    keywords: ["e-panta", "ecrop", "crop booking", "karshak", "ఈ-పంట", "పంట నమోదు"],
    ...AP,
  }),
  entry({
    id: "jnanabhumi",
    name: "JnanaBhumi — AP scholarships",
    nameTe: "జ్ఞానభూమి — స్కాలర్‌షిప్‌లు",
    description: "State post-matric scholarships and fee reimbursement.",
    descriptionTe: "రాష్ట్ర స్కాలర్‌షిప్‌లు మరియు ఫీజు రీయింబర్స్‌మెంట్.",
    category: "students",
    audience: ["students"],
    level: "state",
    department: "Government of Andhra Pradesh",
    officialUrl: "https://jnanabhumi.ap.gov.in/",
    keywords: ["jnanabhumi", "scholarship", "fee reimbursement", "స్కాలర్‌షిప్", "జ్ఞానభూమి"],
    ...AP,
  }),
];
