/**
 * The category tree for collected learning resources.
 *
 * Deliberately a flat, explicit table rather than a nested object: the
 * collector categorises by matching against `match` patterns, the Learning
 * Center renders by walking `CATEGORY_TREE`, and both need stable keys that
 * survive a re-run. Adding a subcategory must never renumber an existing one,
 * because the key is half of a resource's permanent identity.
 *
 * Client-safe. No node imports.
 */

export const CATEGORY_KEYS = [
  "school",
  "intermediate",
  "entrance",
  "competitive",
  "digital",
  "english",
  "agriculture",
  "careers",
  "scholarships",
  "government",
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type Subcategory = {
  key: string;
  label: string;
  labelTe?: string;
  /** Lowercase substrings that suggest this subcategory. Order-independent. */
  match: string[];
};

export type Category = {
  key: CategoryKey;
  label: string;
  labelTe: string;
  blurb: string;
  icon: string;
  subcategories: Subcategory[];
  match: string[];
};

/**
 * Ordered as the Learning Center renders them: the sections a Reddivaripalli
 * family is most likely to need first. School education leads because most of
 * the village's students are in classes 1-10.
 */
export const CATEGORY_TREE: Category[] = [
  {
    key: "school",
    label: "School Education",
    labelTe: "పాఠశాల విద్య",
    blurb: "Textbooks, syllabus and question papers for classes 1 to 10.",
    icon: "school",
    match: ["class 1", "class 2", "class 3", "class 4", "class 5", "primary school", "elementary", "ssc", "secondary school", "high school", "textbook", "పాఠ్యపుస్తక"],
    subcategories: [
      { key: "primary", label: "Primary (1-5)", labelTe: "ప్రాథమిక (1-5)", match: ["primary", "class i", "class ii", "class iii", "class iv", "class v", "class 1", "class 2", "class 3", "class 4", "class 5", "ప్రాథమిక"] },
      { key: "class-6", label: "6th Class", labelTe: "6వ తరగతి", match: ["class 6", "class vi", "6th class", "6వ తరగతి"] },
      { key: "class-7", label: "7th Class", labelTe: "7వ తరగతి", match: ["class 7", "class vii", "7th class", "7వ తరగతి"] },
      { key: "class-8", label: "8th Class", labelTe: "8వ తరగతి", match: ["class 8", "class viii", "8th class", "8వ తరగతి"] },
      { key: "class-9", label: "9th Class", labelTe: "9వ తరగతి", match: ["class 9", "class ix", "9th class", "9వ తరగతి"] },
      { key: "class-10", label: "10th Class", labelTe: "10వ తరగతి", match: ["class 10", "class x", "10th class", "10వ తరగతి"] },
      { key: "ssc", label: "SSC", labelTe: "ఎస్ఎస్‌సి", match: ["ssc", "secondary school certificate", "board of secondary education"] },
    ],
  },
  {
    key: "intermediate",
    label: "Intermediate",
    labelTe: "ఇంటర్మీడియట్",
    blurb: "First and second year material for MPC, BiPC, CEC and MEC.",
    icon: "book",
    match: ["intermediate", "inter ", "junior college", "bieap", "board of intermediate", "ఇంటర్"],
    subcategories: [
      { key: "first-year", label: "1st Year", labelTe: "మొదటి సంవత్సరం", match: ["1st year", "first year", "junior inter", "మొదటి సంవత్సరం"] },
      { key: "second-year", label: "2nd Year", labelTe: "రెండవ సంవత్సరం", match: ["2nd year", "second year", "senior inter", "రెండవ సంవత్సరం"] },
      { key: "mpc", label: "MPC", match: ["mpc", "maths physics chemistry", "mathematics physics chemistry"] },
      { key: "bipc", label: "BiPC", match: ["bipc", "bi.p.c", "botany zoology physics chemistry"] },
      { key: "cec", label: "CEC", match: ["cec", "civics economics commerce"] },
      { key: "mec", label: "MEC", match: ["mec", "maths economics commerce"] },
    ],
  },
  {
    key: "entrance",
    label: "Entrance Exams",
    labelTe: "ప్రవేశ పరీక్షలు",
    blurb: "Engineering, medical and polytechnic entrance preparation.",
    icon: "target",
    match: ["entrance", "admission test", "common entrance", "cet", "eapcet", "eamcet", "polycet", "ecet", "neet", "jee"],
    subcategories: [
      { key: "engineering", label: "Engineering", labelTe: "ఇంజనీరింగ్", match: ["jee", "eapcet", "eamcet", "engineering entrance", "ecet", "b.tech admission"] },
      { key: "medical", label: "Medical", labelTe: "వైద్య", match: ["neet", "medical entrance", "mbbs", "aiapget", "nchm"] },
      { key: "polytechnic", label: "Polytechnic", labelTe: "పాలిటెక్నిక్", match: ["polycet", "polytechnic", "diploma entrance"] },
      { key: "other-entrance", label: "Other Entrance Exams", match: ["cuet", "icet", "lawcet", "edcet", "pgcet", "pecet", "nift", "aissee", "ncet"] },
    ],
  },
  {
    key: "competitive",
    label: "Competitive Exams",
    labelTe: "పోటీ పరీక్షలు",
    blurb: "Government job examinations and their notifications.",
    icon: "flag",
    match: ["recruitment", "competitive exam", "government job", "vacancy", "notification no", "appsc", "upsc", "staff selection"],
    subcategories: [
      { key: "appsc", label: "APPSC", match: ["appsc", "andhra pradesh public service"] },
      { key: "ssc-exam", label: "SSC", match: ["staff selection commission", "ssc cgl", "ssc chsl", "ssc gd", "ssc mts"] },
      { key: "banking", label: "Banking", labelTe: "బ్యాంకింగ్", match: ["ibps", "banking", "bank po", "bank clerk", "rbi", "sbi recruitment"] },
      { key: "railways", label: "Railways", labelTe: "రైల్వే", match: ["rrb", "railway recruitment", "ntpc", "railways"] },
      { key: "police", label: "Police", labelTe: "పోలీసు", match: ["police recruitment", "constable", "si recruitment", "sub inspector", "apslprb"] },
      { key: "defence", label: "Defence", labelTe: "రక్షణ", match: ["nda", "cds", "agniveer", "indian army", "indian navy", "indian air force", "capf"] },
      { key: "other-govt", label: "Other Government Exams", match: ["upsc", "public service commission", "government recruitment"] },
    ],
  },
  {
    key: "digital",
    label: "Computer & Digital Skills",
    labelTe: "కంప్యూటర్ & డిజిటల్ నైపుణ్యాలు",
    blurb: "Computer basics, digital literacy and online safety.",
    icon: "laptop",
    match: ["computer", "digital literacy", "digital skills", "coding", "programming", "ms office", "internet safety", "cyber", "typing"],
    subcategories: [
      { key: "basics", label: "Computer Basics", match: ["computer basics", "digital literacy", "pmgdisha", "ms office", "typing"] },
      { key: "internet-safety", label: "Online Safety", match: ["cyber safety", "online safety", "cyber crime", "phishing", "digital payment safety"] },
      { key: "coding", label: "Coding", match: ["coding", "programming", "python", "java", "software"] },
    ],
  },
  {
    key: "english",
    label: "English",
    labelTe: "ఇంగ్లీష్",
    blurb: "Spoken English, grammar and reading practice.",
    icon: "language",
    match: ["english grammar", "spoken english", "english language", "vocabulary", "reading practice"],
    subcategories: [
      { key: "grammar", label: "Grammar", match: ["grammar", "tenses", "parts of speech"] },
      { key: "spoken", label: "Spoken English", match: ["spoken english", "conversation", "speaking practice"] },
      { key: "reading", label: "Reading", match: ["reading", "comprehension", "story reading"] },
    ],
  },
  {
    key: "agriculture",
    label: "Agriculture",
    labelTe: "వ్యవసాయం",
    blurb: "Crop guidance, pest management and farmer advisories.",
    icon: "sprout",
    match: ["agriculture", "crop", "farmer", "horticulture", "irrigation", "pest", "soil", "kisan", "వ్యవసాయ", "పంట", "రైతు"],
    subcategories: [
      { key: "crops", label: "Crop Guidance", labelTe: "పంట మార్గదర్శకం", match: ["crop", "variety", "package of practices", "sowing", "పంట"] },
      { key: "pest", label: "Pest & Disease", labelTe: "చీడపీడలు", match: ["pest", "disease", "plant protection", "pesticide", "చీడ"] },
      { key: "soil-water", label: "Soil & Water", labelTe: "నేల & నీరు", match: ["soil", "irrigation", "water management", "నేల"] },
      { key: "schemes", label: "Farmer Schemes", labelTe: "రైతు పథకాలు", match: ["rythu", "pm kisan", "farmer scheme", "subsidy", "crop insurance"] },
    ],
  },
  {
    key: "careers",
    label: "Careers",
    labelTe: "ఉద్యోగ అవకాశాలు",
    blurb: "Job notices, career guidance and skill training.",
    icon: "briefcase",
    match: ["career", "employment", "job fair", "job mela", "apprentice", "skill development", "training programme", "internship"],
    subcategories: [
      { key: "jobs", label: "Job Notices", labelTe: "ఉద్యోగ ప్రకటనలు", match: ["vacancy", "job", "recruitment", "job mela", "employment notice"] },
      { key: "skills", label: "Skill Training", labelTe: "నైపుణ్య శిక్షణ", match: ["skill", "training", "apprentice", "certification course", "iti"] },
      { key: "guidance", label: "Career Guidance", labelTe: "మార్గదర్శకం", match: ["career guidance", "counselling", "after 10th", "after intermediate", "course options"] },
    ],
  },
  {
    key: "scholarships",
    label: "Scholarships",
    labelTe: "ఉపకార వేతనాలు",
    blurb: "Scholarship schemes, fee reimbursement and deadlines.",
    icon: "award",
    match: ["scholarship", "fee reimbursement", "stipend", "financial assistance", "ఉపకార", "jnanabhumi", "epass", "rtf", "mtf"],
    subcategories: [
      { key: "pre-matric", label: "Pre-Matric", match: ["pre matric", "pre-matric"] },
      { key: "post-matric", label: "Post-Matric", match: ["post matric", "post-matric", "rtf", "mtf", "fee reimbursement"] },
      { key: "merit", label: "Merit & Central", match: ["merit scholarship", "pm-usp", "central sector", "national scholarship"] },
    ],
  },
  {
    key: "government",
    label: "Government Resources",
    labelTe: "ప్రభుత్వ వనరులు",
    blurb: "Official notices, schemes and public documents.",
    icon: "building",
    match: ["government order", "g.o.", "circular", "memo", "scheme guidelines", "gazette", "public notice", "ప్రభుత్వ"],
    subcategories: [
      { key: "orders", label: "Orders & Circulars", match: ["government order", "g.o.ms", "circular", "memo", "proceedings"] },
      { key: "schemes", label: "Schemes", labelTe: "పథకాలు", match: ["scheme", "yojana", "welfare", "pension", "ration"] },
      { key: "reports", label: "Reports & Data", match: ["annual report", "statistics", "dataset", "survey", "census"] },
    ],
  },
];

export const CATEGORY_BY_KEY: Record<CategoryKey, Category> = Object.fromEntries(
  CATEGORY_TREE.map((c) => [c.key, c]),
) as Record<CategoryKey, Category>;

export function categoryLabel(key: string, locale: "en" | "te" = "en"): string {
  const cat = CATEGORY_TREE.find((c) => c.key === key);
  if (!cat) return key;
  return locale === "te" ? cat.labelTe : cat.label;
}

export function subcategoryLabel(
  category: string,
  sub: string,
  locale: "en" | "te" = "en",
): string {
  const found = CATEGORY_BY_KEY[category as CategoryKey]?.subcategories.find((s) => s.key === sub);
  if (!found) return sub;
  return (locale === "te" && found.labelTe) || found.label;
}

/** Class levels used for filtering. Kept separate from the category tree
 *  because a resource can be, say, Agriculture AND class-10 relevant. */
export const CLASS_LEVELS = [
  "primary", "class-6", "class-7", "class-8", "class-9", "class-10",
  "inter-1", "inter-2", "degree", "adult",
] as const;
export type ClassLevel = (typeof CLASS_LEVELS)[number];

export const SUBJECTS = [
  "telugu", "english", "hindi", "mathematics", "science", "physics", "chemistry",
  "biology", "social-studies", "history", "geography", "civics", "economics",
  "commerce", "computer", "agriculture", "general-knowledge", "reasoning",
  "current-affairs", "other",
] as const;
export type Subject = (typeof SUBJECTS)[number];

/** Subject detection patterns, longest/most specific first. */
export const SUBJECT_MATCH: Array<[Subject, string[]]> = [
  ["social-studies", ["social studies", "social science", "సాంఘిక"]],
  ["general-knowledge", ["general knowledge", "general awareness", "general studies"]],
  ["current-affairs", ["current affairs", "current events"]],
  ["computer", ["computer", "informatics", "programming", "coding"]],
  ["mathematics", ["mathematics", "maths", "math ", "గణితం", "arithmetic", "algebra", "geometry"]],
  ["physics", ["physics", "భౌతిక"]],
  ["chemistry", ["chemistry", "రసాయన"]],
  ["biology", ["biology", "botany", "zoology", "జీవ"]],
  ["science", ["science", "విజ్ఞాన", "physical science", "natural science"]],
  ["telugu", ["telugu", "తెలుగు"]],
  ["english", ["english", "ఇంగ్లీష్"]],
  ["hindi", ["hindi", "हिंदी", "హిందీ"]],
  ["history", ["history", "చరిత్ర"]],
  ["geography", ["geography", "భూగోళ"]],
  ["civics", ["civics", "political science", "polity"]],
  ["economics", ["economics", "ఆర్థిక"]],
  ["commerce", ["commerce", "accountancy", "వాణిజ్య"]],
  ["reasoning", ["reasoning", "aptitude", "mental ability"]],
  ["agriculture", ["agriculture", "horticulture", "వ్యవసాయ"]],
];
