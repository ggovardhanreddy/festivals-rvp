/**
 * The category tree for collected resources.
 *
 * Rewritten for the 2026 redesign: these are the Sanatana Dharma and Telugu
 * Culture sections, not school subjects. §17 is explicit that the collector
 * must NOT monitor agriculture, education, coaching, jobs, careers, kids
 * learning, competitive exams or generic study sites, so those categories do
 * not exist here — a resource cannot be filed under a section that is not in
 * this table, which is the cheapest possible enforcement.
 *
 * Categorisation is keyword scoring, per §20: no AI, no API calls, no paid
 * service. Filename, URL, metadata and a keyword table are enough for a
 * corpus this formulaic, and the matches are recorded on each resource so a
 * decision can be audited rather than guessed at.
 *
 * Client-safe. No node imports.
 */

export const CATEGORY_KEYS = [
  "dharma",
  "vedas",
  "upanishads",
  "gita",
  "epics",
  "puranas",
  "slokas",
  "music",
  "literature",
  "sri-sri",
  "culture",
  "heritage",
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
    key: "dharma",
    label: "Sanatana Dharma",
    labelTe: "సనాతన ధర్మం",
    blurb: "Dharma, karma, moksha, bhakti, jnana, seva, yoga and the samskaras.",
    icon: "dharma",
    match: ["sanatana", "dharma", "karma", "moksha", "bhakti", "jnana", "seva", "yoga", "meditation", "dhyana", "guru", "samskara", "vedanta", "advaita", "ధర్మ", "భక్తి", "యోగ"],
    subcategories: [
      { key: "concepts", label: "Core ideas", labelTe: "ముఖ్య భావనలు", match: ["dharma", "karma", "moksha", "atman", "brahman"] },
      { key: "practice", label: "Practice", labelTe: "ఆచరణ", match: ["yoga", "meditation", "dhyana", "pranayama", "sadhana", "japa"] },
      { key: "vedanta", label: "Vedanta", labelTe: "వేదాంతం", match: ["vedanta", "advaita", "dvaita", "vishishtadvaita", "shankara", "ramanuja", "madhva"] },
      { key: "samskaras", label: "Rites & samskaras", labelTe: "సంస్కారాలు", match: ["samskara", "upanayana", "vivaha", "ritual", "sandhyavandanam"] },
    ],
  },
  {
    key: "vedas",
    label: "Vedas",
    labelTe: "వేదాలు",
    blurb: "Rig, Yajur, Sama and Atharva — text, chanting and recordings.",
    icon: "vedas",
    match: ["veda", "rigveda", "rig veda", "yajur", "sama veda", "samaveda", "atharva", "samhita", "brahmana", "aranyaka", "vedic", "chanting", "ghanapatha", "వేద"],
    subcategories: [
      { key: "rig", label: "Rig Veda", labelTe: "ఋగ్వేదం", match: ["rigveda", "rig veda", "ఋగ్వేద"] },
      { key: "yajur", label: "Yajur Veda", labelTe: "యజుర్వేదం", match: ["yajur", "rudram", "యజుర్వేద"] },
      { key: "sama", label: "Sama Veda", labelTe: "సామవేదం", match: ["sama veda", "samaveda", "సామవేద"] },
      { key: "atharva", label: "Atharva Veda", labelTe: "అథర్వవేదం", match: ["atharva", "అథర్వ"] },
      { key: "chanting", label: "Chanting & audio", labelTe: "వేద పఠనం", match: ["chanting", "recitation", "patha", "ghana", "audio"] },
    ],
  },
  {
    key: "upanishads",
    label: "Upanishads",
    labelTe: "ఉపనిషత్తులు",
    blurb: "The principal Upanishads, with introductions and sources.",
    icon: "upanishads",
    match: ["upanishad", "isha", "isavasya", "kena", "katha", "prashna", "mundaka", "mandukya", "taittiriya", "aitareya", "chandogya", "brihadaranyaka", "shvetashvatara", "ఉపనిషత్"],
    subcategories: [
      { key: "principal", label: "Principal Upanishads", labelTe: "ముఖ్య ఉపనిషత్తులు", match: ["isha", "kena", "katha", "prashna", "mundaka", "mandukya", "taittiriya", "aitareya", "chandogya", "brihadaranyaka", "shvetashvatara"] },
      { key: "commentary", label: "Commentary", labelTe: "భాష్యం", match: ["bhashya", "commentary", "shankara", "gaudapada"] },
    ],
  },
  {
    key: "gita",
    label: "Bhagavad Gita",
    labelTe: "భగవద్గీత",
    blurb: "All eighteen chapters, with verses linked at their sources.",
    icon: "gita",
    match: ["bhagavad gita", "bhagavadgita", "gita", "geeta", "sloka", "krishna arjuna", "భగవద్గీత", "గీత"],
    subcategories: [
      { key: "chapters", label: "Chapters", labelTe: "అధ్యాయాలు", match: ["chapter", "adhyaya", "అధ్యాయ"] },
      { key: "commentary", label: "Commentary", labelTe: "భాష్యం", match: ["bhashya", "commentary", "tatparya"] },
      { key: "audio", label: "Audio & chanting", labelTe: "పఠనం", match: ["chanting", "parayanam", "recitation", "audio"] },
    ],
  },
  {
    key: "epics",
    label: "Itihasas / Epics",
    labelTe: "ఇతిహాసాలు",
    blurb: "Ramayanam and Mahabharatam, by kanda and by parva.",
    icon: "epics",
    match: ["ramayana", "ramayanam", "mahabharata", "mahabharatam", "itihasa", "valmiki", "kanda", "parva", "sundara kanda", "రామాయణ", "మహాభారత"],
    subcategories: [
      { key: "ramayanam", label: "Ramayanam", labelTe: "రామాయణం", match: ["ramayana", "ramayanam", "valmiki", "sundara kanda", "bala kanda", "molla", "రామాయణ"] },
      { key: "mahabharatam", label: "Mahabharatam", labelTe: "మహాభారతం", match: ["mahabharata", "mahabharatam", "nannaya", "tikkana", "errana", "kavitrayam", "మహాభారత"] },
      { key: "characters", label: "Characters & stories", labelTe: "పాత్రలు & కథలు", match: ["character", "story", "katha", "upakhyana"] },
    ],
  },
  {
    key: "puranas",
    label: "Puranas",
    labelTe: "పురాణాలు",
    blurb: "Bhagavata, Vishnu, Shiva, Devi Bhagavatam and the rest.",
    icon: "puranas",
    match: ["purana", "puranam", "bhagavata", "bhagavatam", "vishnu purana", "shiva purana", "devi bhagavatam", "skanda", "markandeya", "garuda", "padma purana", "agni purana", "పురాణ", "భాగవత"],
    subcategories: [
      { key: "bhagavata", label: "Bhagavata Purana", labelTe: "భాగవత పురాణం", match: ["bhagavata", "bhagavatam", "potana", "prahlada", "gajendra", "kuchela", "భాగవత"] },
      { key: "vaishnava", label: "Vaishnava Puranas", labelTe: "వైష్ణవ పురాణాలు", match: ["vishnu purana", "padma purana", "garuda"] },
      { key: "shaiva", label: "Shaiva Puranas", labelTe: "శైవ పురాణాలు", match: ["shiva purana", "skanda", "linga purana"] },
      { key: "devi", label: "Devi Puranas", labelTe: "దేవీ పురాణాలు", match: ["devi bhagavatam", "markandeya", "devi mahatmya", "saptashati", "durga"] },
    ],
  },
  {
    key: "slokas",
    label: "Slokas & Mantras",
    labelTe: "శ్లోకాలు & మంత్రాలు",
    blurb: "The verses said at home, morning and evening.",
    icon: "slokas",
    match: ["sloka", "slokam", "stotra", "stotram", "mantra", "sahasranama", "ashtottara", "chalisa", "ashtakam", "suprabhatam", "gayatri", "శ్లోక", "స్తోత్ర", "మంత్ర"],
    subcategories: [
      { key: "ganesha", label: "Ganesha", labelTe: "గణేశ", match: ["ganesha", "ganapati", "vinayaka", "గణేశ", "గణపతి"] },
      { key: "shiva", label: "Shiva", labelTe: "శివ", match: ["shiva", "rudram", "lingashtakam", "mrityunjaya", "శివ"] },
      { key: "vishnu", label: "Vishnu", labelTe: "విష్ణు", match: ["vishnu", "venkateswara", "sahasranama", "suprabhatam", "విష్ణు", "వేంకటేశ్వర"] },
      { key: "lakshmi", label: "Lakshmi", labelTe: "లక్ష్మీ", match: ["lakshmi", "kanakadhara", "లక్ష్మి"] },
      { key: "saraswati", label: "Saraswati", labelTe: "సరస్వతీ", match: ["saraswati", "సరస్వతి"] },
      { key: "devi", label: "Devi", labelTe: "దేవీ", match: ["devi", "lalita", "durga", "amma", "దేవి"] },
      { key: "hanuman", label: "Hanuman", labelTe: "హనుమాన్", match: ["hanuman", "chalisa", "anjaneya", "హనుమ"] },
      { key: "surya", label: "Surya & Navagraha", labelTe: "సూర్య & నవగ్రహ", match: ["surya", "aditya", "navagraha", "gayatri", "సూర్య", "నవగ్రహ"] },
      { key: "daily", label: "Daily prayers", labelTe: "నిత్య ప్రార్థనలు", match: ["daily", "nitya", "morning", "evening", "sandhya", "pratah"] },
    ],
  },
  {
    key: "music",
    label: "Devotional Music",
    labelTe: "భక్తి సంగీతం",
    blurb: "Annamayya, Thyagaraja, Ramadasu, bhajans and harikatha.",
    icon: "music",
    match: ["annamayya", "annamacharya", "keerthana", "kirtana", "sankirtana", "thyagaraja", "tyagaraja", "ramadasu", "bhajan", "harikatha", "devotional song", "kriti", "అన్నమయ్య", "కీర్తన", "భజన"],
    subcategories: [
      { key: "annamayya", label: "Annamayya", labelTe: "అన్నమయ్య", match: ["annamayya", "annamacharya", "tallapaka", "sankirtana", "అన్నమయ్య"] },
      { key: "thyagaraja", label: "Thyagaraja", labelTe: "త్యాగరాజు", match: ["thyagaraja", "tyagaraja", "pancharatna", "kriti", "త్యాగరాజ"] },
      { key: "ramadasu", label: "Ramadasu", labelTe: "రామదాసు", match: ["ramadasu", "gopanna", "bhadrachala", "dasarathi", "రామదాసు"] },
      { key: "bhajans", label: "Bhajans & keerthanas", labelTe: "భజనలు", match: ["bhajan", "keerthana", "kirtana", "భజన"] },
      { key: "harikatha", label: "Harikatha", labelTe: "హరికథ", match: ["harikatha", "burrakatha", "హరికథ"] },
      { key: "temple", label: "Temple & festival music", labelTe: "ఆలయ సంగీతం", match: ["nadaswaram", "temple music", "melam", "procession"] },
    ],
  },
  {
    key: "literature",
    label: "Telugu Literature",
    labelTe: "తెలుగు సాహిత్యం",
    blurb: "A thousand years of Telugu writing, classical to modern.",
    icon: "literature",
    match: ["telugu literature", "telugu poetry", "kavya", "kavitvam", "padyam", "satakam", "prabandha", "telugu story", "telugu katha", "nannaya", "tikkana", "potana", "vemana", "gurajada", "veeresalingam", "సాహిత్య", "కవిత", "కథ"],
    subcategories: [
      { key: "classical", label: "Classical", labelTe: "ప్రాచీన", match: ["kavya", "prabandha", "nannaya", "tikkana", "errana", "potana", "molla", "satakam"] },
      { key: "poetry", label: "Poetry", labelTe: "కవిత్వం", match: ["poetry", "kavitvam", "padyam", "vachana kavita", "కవిత"] },
      { key: "stories", label: "Stories & novels", labelTe: "కథలు & నవలలు", match: ["katha", "story", "novel", "nataka", "కథ"] },
      { key: "folk", label: "Folk literature", labelTe: "జానపద సాహిత్యం", match: ["folk", "janapada", "proverb", "samethalu", "జానపద", "సామెత"] },
    ],
  },
  {
    key: "sri-sri",
    label: "Sri Sri",
    labelTe: "శ్రీశ్రీ",
    blurb: "Srirangam Srinivasa Rao — life, works and authorised sources only.",
    icon: "sri-sri",
    match: ["sri sri", "srisri", "srirangam srinivasa", "maha prasthanam", "mahaprasthanam", "khadga srushti", "శ్రీశ్రీ", "మహాప్రస్థానం"],
    subcategories: [
      { key: "biography", label: "Life & bibliography", labelTe: "జీవితం & రచనలు", match: ["biography", "life", "bibliography", "award"] },
      { key: "discussion", label: "Criticism & discussion", labelTe: "విమర్శ", match: ["criticism", "review", "discussion", "essay", "vimarsha"] },
    ],
  },
  {
    key: "culture",
    label: "Telugu Culture",
    labelTe: "తెలుగు సంస్కృతి",
    blurb: "Festivals, folk traditions, arts, proverbs and customs.",
    icon: "culture",
    match: ["telugu culture", "sankranthi", "ugadi", "bathukamma", "bonalu", "folk art", "kalamkari", "kuchipudi", "proverb", "custom", "tradition", "సంస్కృతి", "పండుగ", "సంప్రదాయ"],
    subcategories: [
      { key: "festivals", label: "Festivals", labelTe: "పండుగలు", match: ["sankranthi", "ugadi", "dasara", "deepavali", "vinayaka", "bathukamma", "పండుగ"] },
      { key: "folk", label: "Folk traditions", labelTe: "జానపద సంప్రదాయాలు", match: ["folk", "janapada", "harikatha", "burrakatha", "oggu", "జానపద"] },
      { key: "arts", label: "Traditional arts", labelTe: "సాంప్రదాయ కళలు", match: ["kuchipudi", "kalamkari", "etikoppaka", "nirmal", "craft", "కళ"] },
      { key: "customs", label: "Customs & sayings", labelTe: "ఆచారాలు & సామెతలు", match: ["custom", "proverb", "samethalu", "acharam", "ఆచార", "సామెత"] },
    ],
  },
  {
    key: "heritage",
    label: "Reddivaripalli Heritage",
    labelTe: "రెడ్డివారిపల్లె వారసత్వం",
    blurb: "Sri Ramalayam, the jatharas, and this village's own record.",
    icon: "heritage",
    match: ["reddivaripalli", "kondreddigaripalli", "ramalayam", "jathara", "mathamma", "devapatlamma", "village temple", "రెడ్డివారిపల్లె", "రామాలయం", "జాతర"],
    subcategories: [
      { key: "temple", label: "Temple heritage", labelTe: "ఆలయ వారసత్వం", match: ["ramalayam", "temple", "ఆలయ"] },
      { key: "traditions", label: "Local traditions", labelTe: "స్థానిక సంప్రదాయాలు", match: ["jathara", "local", "bhajan", "జాతర"] },
      { key: "oral-history", label: "Oral history", labelTe: "మౌఖిక చరిత్ర", match: ["oral history", "elders", "memory", "జ్ఞాపక"] },
    ],
  },
  {
    key: "government",
    label: "Government Resources",
    labelTe: "ప్రభుత్వ వనరులు",
    blurb: "Official citizen services and government departments.",
    icon: "government",
    match: ["government order", "g.o.", "circular", "meeseva", "aadhaar", "pan card", "passport", "election", "revenue", "registration", "citizen service", "ప్రభుత్వ"],
    subcategories: [
      { key: "ap", label: "Andhra Pradesh Government", labelTe: "ఆంధ్రప్రదేశ్ ప్రభుత్వం", match: ["andhra pradesh", "ap gov", "meeseva", "meebhoomi", "gsws"] },
      { key: "central", label: "Central Government", labelTe: "కేంద్ర ప్రభుత్వం", match: ["india.gov", "umang", "digilocker", "uidai", "central government"] },
      { key: "services", label: "Citizen services", labelTe: "పౌర సేవలు", match: ["aadhaar", "pan", "passport", "voter", "election", "revenue", "registration", "certificate"] },
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
