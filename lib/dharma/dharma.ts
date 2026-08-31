/**
 * Sanatana Dharma, the Vedas and the Upanishads.
 *
 * Every word of prose here is written for this site. None of it is a
 * translation of a text, and no verse is reproduced — the research behind
 * content/dharma/sources.md found that the only source both freely licensed
 * and genuinely Telugu is Wikisource, so verses are linked rather than copied.
 *
 * Written to be respectful, educational and non-political, as the brief asks.
 * Where traditions differ, the difference is named rather than resolved: a
 * village website has no business settling a question the schools of Vedanta
 * have discussed for a thousand years.
 */
import type { KnowledgeEntry } from "./types";
import {
  ANDHRA_BHARATI,
  GITA_SUPERSITE,
  SANSKRIT_DOCUMENTS,
  TTD_EBOOKS,
  wikisourceTe,
} from "./sources";

export const SANATANA_DHARMA: KnowledgeEntry = {
  slug: "about",
  title: "Sanatana Dharma",
  titleTe: "సనాతన ధర్మం",
  summary:
    "The living tradition of practice, enquiry and conduct that has been carried in families like ours for generations.",
  summaryTe:
    "తరతరాలుగా మన కుటుంబాలలో కొనసాగుతున్న ఆచరణ, విచారణ మరియు నడవడిక సంప్రదాయం.",
  body: [
    "Sanatana Dharma means the enduring way. It is the name the tradition gives itself, older than the word Hinduism, and it describes something wider than a set of beliefs: a way of living, a body of texts, a family of practices, and a long argument with itself about what is true.",
    "It has no single founder and no single book. The Vedas are its oldest layer, the Upanishads its philosophical turn, the epics and Puranas the form in which most people have actually received it — as story, told aloud, at home and in the temple courtyard. In Reddivaripalli that transmission has run through the Sri Ramalayam, through the jatharas, and through grandmothers reciting what their grandmothers recited.",
    "What is offered here is an introduction, not an authority. These pages explain what each text is and where it can be read; they do not tell a reader what to believe. Where the schools of Vedanta disagree — and they disagree substantially, about the relationship between the self and the absolute — this section says so rather than picking a side.",
  ],
  sources: [TTD_EBOOKS, ANDHRA_BHARATI],
  related: [
    { href: "/dharma/knowledge/", label: "Dharma & Spiritual Knowledge" },
    { href: "/spiritual-heritage/", label: "Reddivaripalli's own temple heritage" },
  ],
};

/**
 * §4's list of concepts, each given a short honest explanation.
 *
 * Deliberately brief. A paragraph that says one true thing clearly is more
 * use to a village reader than a page of Sanskrit terminology, and these are
 * ideas people already live with under their Telugu names.
 */
export const DHARMA_CONCEPTS: TextDivisionLike[] = [
  {
    slug: "dharma",
    name: "ధర్మం",
    nameRoman: "Dharma",
    nameEnglish: "Right conduct",
    intro:
      "What upholds — the duty that belongs to a person in their particular place, age and circumstance. Dharma is not one rule for everyone: a farmer's dharma, a mother's dharma and a student's dharma differ, and the tradition treats working out one's own as a lifelong task rather than a lookup.",
  },
  {
    slug: "karma",
    name: "కర్మ",
    nameRoman: "Karma",
    nameEnglish: "Action and its consequence",
    intro:
      "Action, and the traces action leaves. The idea is causal rather than punitive: what a person does shapes what they become. The Bhagavad Gita's contribution is the argument that action done without grasping at its fruit binds nobody — which is why it is read as a text about work, not withdrawal.",
  },
  {
    slug: "moksha",
    name: "మోక్షం",
    nameRoman: "Moksha",
    nameEnglish: "Release",
    intro:
      "Freedom from the round of birth and death, and the goal the philosophical texts are ultimately about. What it consists of is precisely where the schools of Vedanta part company — whether the freed self is identical with the absolute, distinct from it, or both — and that disagreement is genuine and old.",
  },
  {
    slug: "bhakti",
    name: "భక్తి",
    nameRoman: "Bhakti",
    nameEnglish: "Devotion",
    intro:
      "Love directed at the divine, and the path most of this village has actually walked. Bhakti is the tradition's great democratiser: Annamayya, Ramadasu and Potana wrote in Telugu for people who had no Sanskrit, and their songs carried more theology into more homes than any commentary.",
  },
  {
    slug: "jnana",
    name: "జ్ఞానం",
    nameRoman: "Jnana",
    nameEnglish: "Knowledge",
    intro:
      "Knowledge as direct realisation rather than information. The Upanishads are the jnana literature, and their method is enquiry — a student asks, a teacher answers, and the answer is often another question.",
  },
  {
    slug: "seva",
    name: "సేవ",
    nameRoman: "Seva",
    nameEnglish: "Service",
    intro:
      "Service offered without expectation of return. In practice this is the most visible form of the tradition in a village: the people who clean the temple before a jathara, cook for it, and carry the palanquin are doing seva, and nobody signs a register.",
  },
  {
    slug: "yoga",
    name: "యోగం",
    nameRoman: "Yoga",
    nameEnglish: "Discipline of union",
    intro:
      "Yoke, discipline, union. The word covers far more than posture: the Gita alone describes the yoga of action, of devotion and of knowledge, and Patanjali's eight limbs place physical practice as one step among eight, with conduct first.",
  },
  {
    slug: "dhyana",
    name: "ధ్యానం",
    nameRoman: "Dhyana",
    nameEnglish: "Meditation",
    intro:
      "Sustained attention. In the classical sequence it follows withdrawal of the senses and concentration, and precedes absorption. The Gita's sixth chapter is the standard text on it, and it is notably practical about posture, diet and moderation.",
  },
  {
    slug: "guru",
    name: "గురు పరంపర",
    nameRoman: "Guru parampara",
    nameEnglish: "The teaching lineage",
    intro:
      "The chain of teacher and student through which the tradition has actually travelled. The Upanishads are set as conversations for this reason: the texts assume that this knowledge is transmitted person to person, and that a book alone is not sufficient.",
  },
  {
    slug: "samskaras",
    name: "సంస్కారాలు",
    nameRoman: "Samskaras",
    nameEnglish: "Life-rites",
    intro:
      "The rites that mark a life's passages — naming, first feeding, beginning study, marriage, and the last rites. These are the parts of the tradition nearly every family in Reddivaripalli still keeps, whatever else has changed.",
  },
  {
    slug: "temple",
    name: "ఆలయ సంప్రదాయం",
    nameRoman: "Alaya sampradayam",
    nameEnglish: "Temple tradition",
    intro:
      "The daily and annual order of a temple: the times of worship, the festival calendar, the processions. Reddivaripalli's own is kept at the Sri Ramalayam, and its jatharas are recorded in this site's gallery going back years.",
  },
];

/** Local alias so this file does not need the full TextDivision shape. */
type TextDivisionLike = {
  slug: string;
  name: string;
  nameRoman: string;
  nameEnglish: string;
  intro: string;
};

export const VEDAS: KnowledgeEntry = {
  slug: "vedas",
  title: "Vedas",
  titleTe: "వేదాలు",
  summary: "The oldest layer of the tradition: four collections, carried by voice for millennia before they were written.",
  summaryTe: "సంప్రదాయంలోని అత్యంత ప్రాచీన భాగం — నాలుగు సంహితలు, వేల సంవత్సరాలు వాక్కు ద్వారానే కాపాడబడ్డాయి.",
  body: [
    "The four Vedas are the tradition's oldest texts. They were composed in an archaic form of Sanskrit and preserved by an extraordinary oral discipline — recited with fixed pitch, syllable count and pattern, cross-checked by reciting the same words in deliberately scrambled orders so that an error could not survive. That method kept the text stable for longer than most written traditions have existed.",
    "Each Veda has four strata: the Samhita of hymns, the Brahmanas explaining ritual, the Aranyakas of the forest, and the Upanishads, which turn from ritual to enquiry. When people speak of Vedanta — the end of the Veda — they mean that last layer.",
    "Chanting is not decoration here; it is the text. This is why audio matters more for the Vedas than for anything else in this section, and why the pages point to recordings by traditional reciters rather than to written transliterations alone.",
  ],
  divisions: [
    {
      slug: "rig",
      name: "ఋగ్వేదం",
      nameRoman: "Rig Veda",
      nameEnglish: "The Veda of verses",
      verses: 10552,
      intro:
        "The oldest of the four, and one of the oldest texts in any Indo-European language. 1,028 hymns in ten books, addressed to Agni, Indra, the Ashvins, Ushas and others. Its last book contains the Nasadiya hymn, which asks who could possibly know how creation happened, and answers that perhaps it does not know either — a striking note of doubt at the tradition's very beginning.",
      teachings: [
        "Hymns of praise and petition, arranged by the families who composed them",
        "The Gayatri mantra, still the most widely recited verse in the tradition",
        "The Nasadiya (creation) hymn and its open question",
      ],
    },
    {
      slug: "yajur",
      name: "యజుర్వేదం",
      nameRoman: "Yajur Veda",
      nameEnglish: "The Veda of sacrificial formulae",
      intro:
        "The liturgical Veda: the words a priest actually says while performing a rite, with the actions interleaved. It survives in two recensions — Shukla (white), where verse and commentary are kept apart, and Krishna (black), where they are mixed. Several of the principal Upanishads, including the Katha and the Taittiriya, belong to it.",
      teachings: [
        "The formulae of the sacrificial rites, in the order of performance",
        "Two recensions, Shukla and Krishna, still recited by different lineages",
        "The Rudram, chanted in Shiva temples to this day",
      ],
    },
    {
      slug: "sama",
      name: "సామవేదం",
      nameRoman: "Sama Veda",
      nameEnglish: "The Veda of melody",
      intro:
        "Almost entirely drawn from the Rig Veda, but set to melody — this is the Veda of song rather than of words, and Indian classical music traces its descent from it. What it adds is not text but tune, which makes it the one Veda that cannot be conveyed on a page at all.",
      teachings: [
        "The chanted, melodic form of Rig Vedic verses",
        "The root the classical music tradition claims for itself",
        "Home of the Chandogya and Kena Upanishads",
      ],
    },
    {
      slug: "atharva",
      name: "అథర్వవేదం",
      nameRoman: "Atharva Veda",
      nameEnglish: "The Veda of Atharvan",
      intro:
        "The most various of the four, and the most concerned with ordinary life: healing, household matters, protection, and long philosophical hymns alongside them. It was accepted into the canon later than the other three, and it is the closest the Vedas come to the texture of daily living.",
      teachings: [
        "Charms and remedies for illness and household trouble",
        "Speculative hymns on time, breath and the absolute",
        "Home of the Mundaka, Mandukya and Prashna Upanishads",
      ],
    },
  ],
  sources: [
    wikisourceTe("వేదములు", "Vedas on Telugu Wikisource", "Freely licensed and in Telugu script."),
    SANSKRIT_DOCUMENTS,
    TTD_EBOOKS,
  ],
  related: [{ href: "/dharma/upanishads/", label: "Upanishads" }],
};

export const UPANISHADS: KnowledgeEntry = {
  slug: "upanishads",
  title: "Upanishads",
  titleTe: "ఉపనిషత్తులు",
  summary: "The philosophical turn: conversations about the self, the absolute, and what it would mean to know either.",
  summaryTe: "ఆత్మ, పరబ్రహ్మం గురించి సంభాషణలు — వేదాంతానికి పునాది.",
  body: [
    "The Upanishads are where the tradition stops describing rites and starts asking questions. There are over two hundred texts by the name; eleven or so are called principal, because Shankara commented on them and every later school has had to argue with them.",
    "They are almost all dialogues. A student asks; a teacher answers, sometimes with another question, sometimes with a story, sometimes with silence. Yajnavalkya argues with Gargi. Nachiketa waits three nights at Death's door for an answer. A boy named Satyakama Jabala is sent away to tend cattle and comes back having learned from the animals and the fire.",
    "Their subject is the relation between atman, the self, and brahman, the absolute. Whether those are one thing, two things, or one thing seen two ways is the question that divides Advaita, Vishishtadvaita and Dvaita — and this site does not attempt to settle it. Reading the texts and noticing that serious people have disagreed about them for a millennium is itself part of the education.",
  ],
  divisions: [
    { slug: "isha", name: "ఈశావాస్యోపనిషత్", nameRoman: "Isha (Isavasya)", nameEnglish: "The Lord's pervading", verses: 18, intro: "The shortest of the principal Upanishads and among the most quoted. Eighteen verses on renouncing while acting, and on enjoying what is given without grasping at what is not. It belongs to the Shukla Yajur Veda.", teachings: ["Act, but hold nothing as your own", "Enjoyment and renunciation as one posture, not two"] },
    { slug: "kena", name: "కేనోపనిషత్", nameRoman: "Kena", nameEnglish: "By whom?", verses: 34, intro: "Opens by asking what moves the mind, the eye and the breath — by whose willing does any of it happen. Its answer is that the knower cannot be made an object of knowledge. From the Sama Veda.", teachings: ["The knower is never the known", "A story of the gods learning humility"] },
    { slug: "katha", name: "కఠోపనిషత్", nameRoman: "Katha", nameEnglish: "The Katha school", verses: 119, intro: "The boy Nachiketa is given to Death by his father in anger, waits three nights unfed, and is granted three wishes. His third is the question of what survives dying. Among the most literary of the Upanishads, and the source of the chariot image the Gita later takes up. From the Krishna Yajur Veda.", teachings: ["The sharp and the pleasant are different roads", "The self is not born and does not die", "The senses as horses, the mind as reins"] },
    { slug: "prashna", name: "ప్రశ్నోపనిషత్", nameRoman: "Prashna", nameEnglish: "The questions", verses: 67, intro: "Six students bring six questions to the sage Pippalada, who makes them wait a year in discipline before he answers. On the origin of creatures, the powers that sustain a body, breath, sleep, meditation on Om, and the person of sixteen parts. From the Atharva Veda.", teachings: ["Breath as the chief of the body's powers", "Om as an object of sustained meditation"] },
    { slug: "mundaka", name: "ముండకోపనిషత్", nameRoman: "Mundaka", nameEnglish: "The shaven ones", verses: 64, intro: "Distinguishes higher knowledge from lower, and warns that rites alone are 'unsafe boats'. Source of the phrase adopted as India's national motto. From the Atharva Veda.", teachings: ["Two knowledges: the higher and the lower", "Two birds on one tree — one eats, one watches"] },
    { slug: "mandukya", name: "మాండూక్యోపనిషత్", nameRoman: "Mandukya", nameEnglish: "The Mandukya", verses: 12, intro: "Twelve verses, and arguably the densest text in the tradition. It analyses waking, dream and deep sleep, and names a fourth state beyond all three, mapping them onto the syllables of Om. Gaudapada's commentary on it is the foundation of Advaita. From the Atharva Veda.", teachings: ["Four states of consciousness", "Om as the whole of it, syllable by syllable"] },
    { slug: "taittiriya", name: "తైత్తిరీయోపనిషత్", nameRoman: "Taittiriya", nameEnglish: "The Taittiriya school", intro: "Contains the famous graduation address — speak the truth, do your duty, treat your mother as a god — which is as close as the tradition comes to a plain code of conduct. Also the sequence of five sheaths from food to bliss. From the Krishna Yajur Veda.", teachings: ["The convocation charge to a departing student", "Five sheaths: food, breath, mind, understanding, bliss"] },
    { slug: "aitareya", name: "ఐతరేయోపనిషత్", nameRoman: "Aitareya", nameEnglish: "The Aitareya", intro: "On creation and on consciousness as the ground of what is. Contains the declaration prajnanam brahma — consciousness is the absolute — one of the four 'great sayings'. From the Rig Veda.", teachings: ["Consciousness as the absolute", "Three births of a person"] },
    { slug: "chandogya", name: "ఛాందోగ్యోపనిషత్", nameRoman: "Chandogya", nameEnglish: "The Chandogya", intro: "One of the two longest and oldest. Source of tat tvam asi — that thou art — repeated nine times as Uddalaka teaches his son Shvetaketu with salt in water, a banyan seed, and a blindfolded man led home. From the Sama Veda.", teachings: ["That thou art", "Teaching by ordinary example: salt, seed, fig", "The story of Satyakama Jabala"] },
    { slug: "brihadaranyaka", name: "బృహదారణ్యకోపనిషత్", nameRoman: "Brihadaranyaka", nameEnglish: "The great forest text", intro: "The longest and, by most reckonings, the oldest. Yajnavalkya's debates in Janaka's court, his exchange with Gargi, and his parting conversation with his wife Maitreyi, who asks whether wealth will make her immortal and is told plainly that it will not. From the Shukla Yajur Veda.", teachings: ["Aham brahmasmi — I am the absolute", "Gargi's questions, and where Yajnavalkya tells her to stop", "Neti neti — not this, not this"] },
    { slug: "shvetashvatara", name: "శ్వేతాశ్వతరోపనిషత్", nameRoman: "Shvetashvatara", nameEnglish: "The Shvetashvatara", verses: 113, intro: "The most theistic of the principal Upanishads, and the one where personal devotion appears most clearly — which makes it the bridge between the enquiry of the Upanishads and the bhakti of the later tradition. From the Krishna Yajur Veda.", teachings: ["The absolute addressed as a person, not only a principle", "Devotion and knowledge as compatible paths"] },
  ],
  sources: [
    wikisourceTe("ఉపనిషత్తులు", "Upanishads on Telugu Wikisource", "Freely licensed. Coverage varies by text."),
    SANSKRIT_DOCUMENTS,
    GITA_SUPERSITE,
    TTD_EBOOKS,
  ],
  related: [
    { href: "/dharma/vedas/", label: "Vedas" },
    { href: "/dharma/gita/", label: "Bhagavad Gita" },
  ],
};
