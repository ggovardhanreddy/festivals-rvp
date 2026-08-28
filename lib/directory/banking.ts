/**
 * Banks, payments and financial services.
 *
 * Every bank URL below is taken from the Reserve Bank of India's own list of
 * bank websites at https://www.rbi.org.in/Scripts/banklinks.aspx, read on
 * 2026-08-28. That list is why the addresses are on the `.bank.in` domain:
 * RBI moved Indian banks onto it precisely so a customer can tell a real bank
 * from a look-alike. Using RBI's list rather than a search engine is the
 * whole point of this file.
 *
 * Reddivaripalli never asks for a banking credential and never proxies a bank
 * login. Each card sends the visitor to the bank's own domain and shows the
 * domain first.
 */
import { entry, type DirectoryEntry } from "./types";

const V = "2026-08-28";
const RBI = {
  source: "Reserve Bank of India — list of bank websites",
  sourceUrl: "https://www.rbi.org.in/Scripts/banklinks.aspx",
  lastVerified: V,
};
const NP = {
  source: "National Portal of India",
  sourceUrl: "https://www.india.gov.in/",
  lastVerified: V,
};

function bank(
  id: string,
  name: string,
  url: string,
  opts: { nameTe?: string; keywords?: string[]; kind: "public" | "private" },
): DirectoryEntry {
  return entry({
    id,
    name,
    nameTe: opts.nameTe,
    description:
      opts.kind === "public"
        ? "Public sector bank. Official website and net banking."
        : "Private sector bank. Official website and net banking.",
    descriptionTe:
      opts.kind === "public"
        ? "ప్రభుత్వ రంగ బ్యాంకు. అధికారిక వెబ్‌సైట్ మరియు నెట్ బ్యాంకింగ్."
        : "ప్రైవేట్ రంగ బ్యాంకు. అధికారిక వెబ్‌సైట్ మరియు నెట్ బ్యాంకింగ్.",
    category: "banking",
    audience: ["everyone"],
    level: "bank",
    department:
      opts.kind === "public" ? "Public sector bank (RBI listed)" : "Private sector bank (RBI listed)",
    officialUrl: url,
    keywords: [...(opts.keywords ?? []), "bank", "net banking", "బ్యాంకు", "నెట్ బ్యాంకింగ్"],
    ...RBI,
  });
}

export const PUBLIC_BANKS: DirectoryEntry[] = [
  bank("sbi", "State Bank of India", "https://sbi.bank.in/", { nameTe: "స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా", keywords: ["sbi", "state bank", "ఎస్‌బీఐ"], kind: "public" }),
  bank("bob", "Bank of Baroda", "https://bankofbaroda.bank.in/", { nameTe: "బ్యాంక్ ఆఫ్ బరోడా", keywords: ["bob", "baroda"], kind: "public" }),
  bank("pnb", "Punjab National Bank", "https://pnb.bank.in/", { nameTe: "పంజాబ్ నేషనల్ బ్యాంక్", keywords: ["pnb"], kind: "public" }),
  bank("canara", "Canara Bank", "https://www.canarabank.bank.in/", { nameTe: "కెనరా బ్యాంక్", keywords: ["canara"], kind: "public" }),
  bank("union", "Union Bank of India", "https://www.unionbankonline.bank.in/", { nameTe: "యూనియన్ బ్యాంక్", keywords: ["union bank"], kind: "public" }),
  bank("indian-bank", "Indian Bank", "https://indianbank.bank.in/", { nameTe: "ఇండియన్ బ్యాంక్", keywords: ["indian bank"], kind: "public" }),
  bank("boi", "Bank of India", "https://bankofindia.bank.in/", { keywords: ["boi"], kind: "public" }),
  bank("cbi", "Central Bank of India", "https://centralbank.bank.in", { keywords: ["central bank"], kind: "public" }),
  bank("iob", "Indian Overseas Bank", "https://www.iob.bank.in/", { keywords: ["iob", "overseas"], kind: "public" }),
  bank("uco", "UCO Bank", "https://www.uco.bank.in/", { keywords: ["uco"], kind: "public" }),
  bank("bom", "Bank of Maharashtra", "https://bankofmaharashtra.bank.in/", { keywords: ["maharashtra"], kind: "public" }),
  bank("psb", "Punjab & Sind Bank", "https://punjabandsind.bank.in/", { keywords: ["punjab sind"], kind: "public" }),
];

export const PRIVATE_BANKS: DirectoryEntry[] = [
  bank("hdfc", "HDFC Bank", "https://www.hdfc.bank.in/", { nameTe: "హెచ్‌డీఎఫ్‌సీ బ్యాంక్", keywords: ["hdfc"], kind: "private" }),
  bank("icici", "ICICI Bank", "https://www.icici.bank.in/", { nameTe: "ఐసీఐసీఐ బ్యాంక్", keywords: ["icici"], kind: "private" }),
  bank("axis", "Axis Bank", "https://www.axis.bank.in/", { nameTe: "యాక్సిస్ బ్యాంక్", keywords: ["axis"], kind: "private" }),
  bank("kotak", "Kotak Mahindra Bank", "https://www.kotak.bank.in/en/home.html", { keywords: ["kotak"], kind: "private" }),
  bank("indusind", "IndusInd Bank", "https://www.indusind.bank.in/", { keywords: ["indusind"], kind: "private" }),
  bank("idfc", "IDFC FIRST Bank", "https://www.idfcfirst.bank.in/", { keywords: ["idfc"], kind: "private" }),
  bank("yes", "YES Bank", "https://www.yes.bank.in/", { keywords: ["yes bank"], kind: "private" }),
  bank("federal", "Federal Bank", "https://www.federal.bank.in/", { keywords: ["federal"], kind: "private" }),
  bank("sib", "South Indian Bank", "https://www.southindianbank.bank.in/", { keywords: ["south indian bank"], kind: "private" }),
  bank("karnataka", "Karnataka Bank", "https://www.karnatakabank.bank.in/", { keywords: ["karnataka bank"], kind: "private" }),
  bank("kvb", "Karur Vysya Bank", "https://www.kvb.bank.in", { keywords: ["kvb", "karur"], kind: "private" }),
  bank("cub", "City Union Bank", "https://cityunionbank.bank.in/", { keywords: ["city union"], kind: "private" }),
  bank("idbi", "IDBI Bank", "https://www.idbi.bank.in/", { keywords: ["idbi"], kind: "private" }),
  bank("rbl", "RBL Bank", "https://www.rbl.bank.in/", { keywords: ["rbl"], kind: "private" }),
  bank("bandhan", "Bandhan Bank", "https://www.bandhan.bank.in/", { keywords: ["bandhan"], kind: "private" }),
  bank("dcb", "DCB Bank", "https://www.dcb.bank.in/", { keywords: ["dcb"], kind: "private" }),
  bank("csb", "CSB Bank", "https://www.csb.bank.in/", { keywords: ["csb"], kind: "private" }),
  bank("tmb", "Tamilnad Mercantile Bank", "https://www.tmb.bank.in/", { keywords: ["tmb"], kind: "private" }),
  bank("dhanlaxmi", "Dhanlaxmi Bank", "https://www.dhan.bank.in/", { keywords: ["dhanlaxmi"], kind: "private" }),
  bank("jk", "Jammu & Kashmir Bank", "https://jkb.bank.in", { keywords: ["j&k bank"], kind: "private" }),
  bank("nainital", "Nainital Bank", "https://www.nainitalbank.bank.in/english/home.aspx", { keywords: ["nainital"], kind: "private" }),
];

export const PAYMENTS_AND_FINANCE: DirectoryEntry[] = [
  entry({
    id: "rbi",
    name: "Reserve Bank of India",
    nameTe: "రిజర్వ్ బ్యాంక్ ఆఫ్ ఇండియా",
    description:
      "The banking regulator. Its list of bank websites is the safe way to check whether a bank site is genuine.",
    descriptionTe:
      "బ్యాంకింగ్ నియంత్రణ సంస్థ. ఒక బ్యాంకు వెబ్‌సైట్ నిజమైనదో కాదో ఇక్కడ చూడవచ్చు.",
    category: "banking",
    audience: ["everyone"],
    level: "regulator",
    department: "Reserve Bank of India",
    officialUrl: "https://www.rbi.org.in/Scripts/banklinks.aspx",
    keywords: ["rbi", "reserve bank", "bank list", "ఆర్‌బీఐ"],
    ...RBI,
  }),
  entry({
    id: "npci",
    name: "NPCI — UPI, RuPay, FASTag",
    nameTe: "ఎన్‌పీసీఐ — యూపీఐ, రూపే",
    description:
      "The body behind UPI, RuPay, FASTag, AePS and BBPS. Official information and dispute help.",
    descriptionTe: "యూపీఐ, రూపే, ఫాస్ట్‌ట్యాగ్ వెనుక ఉన్న సంస్థ.",
    category: "payments",
    audience: ["everyone"],
    level: "regulator",
    department: "National Payments Corporation of India",
    officialUrl: "https://www.npci.org.in/",
    keywords: ["upi", "rupay", "fastag", "aeps", "bbps", "npci", "యూపీఐ"],
    source: "Reserve Bank of India — bank links",
    sourceUrl: "https://www.rbi.org.in/Scripts/banklinks.aspx",
    lastVerified: V,
  }),
  entry({
    id: "bhim",
    name: "BHIM UPI",
    nameTe: "భీమ్ యూపీఐ",
    description: "The government's own UPI app and UPI help.",
    category: "payments",
    audience: ["everyone"],
    level: "regulator",
    department: "National Payments Corporation of India",
    officialUrl: "https://www.bhimupi.org.in/",
    keywords: ["bhim", "upi", "payment", "భీమ్"],
    source: "National Payments Corporation of India",
    sourceUrl: "https://www.npci.org.in/",
    lastVerified: V,
  }),
  entry({
    id: "jandhan",
    name: "PM Jan Dhan Yojana",
    nameTe: "జన్ ధన్ యోజన",
    description: "Zero-balance bank account scheme.",
    category: "banking",
    audience: ["everyone"],
    level: "central",
    department: "Department of Financial Services",
    officialUrl: "https://pmjdy.gov.in/",
    keywords: ["jan dhan", "zero balance", "account", "ఖాతా"],
    ...NP,
  }),
  entry({
    id: "nps",
    name: "NPS — National Pension System",
    nameTe: "జాతీయ పింఛను వ్యవస్థ",
    description: "Pension account information from the regulator.",
    category: "pension",
    audience: ["everyone", "seniors"],
    level: "regulator",
    department: "Pension Fund Regulatory and Development Authority",
    officialUrl: "https://www.pfrda.org.in/",
    keywords: ["nps", "pension", "pfrda", "పింఛను"],
    ...NP,
  }),
  entry({
    id: "irdai",
    name: "IRDAI — insurance regulator",
    nameTe: "బీమా నియంత్రణ సంస్థ",
    description:
      "Check whether an insurer or agent is registered, and how to complain about one.",
    category: "insurance",
    audience: ["everyone"],
    level: "regulator",
    department: "Insurance Regulatory and Development Authority of India",
    officialUrl: "https://irdai.gov.in/",
    keywords: ["insurance", "irdai", "policy", "బీమా"],
    ...NP,
  }),
];

export const ALL_BANKS = [...PUBLIC_BANKS, ...PRIVATE_BANKS];
export const BANKING = [...ALL_BANKS, ...PAYMENTS_AND_FINANCE];
