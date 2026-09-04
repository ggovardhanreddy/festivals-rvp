/**
 * The Bhagavad Gita, the epics and the Puranas.
 *
 * Chapter names, division names and verse counts are stable scholarly facts
 * and are stated. The prose is written for this site. No verse is reproduced:
 * the Sanskrit is ancient and free, but every Telugu translation worth reading
 * belongs to somebody, so the verses are linked at sources whose terms permit
 * reading them there.
 *
 * Verse counts follow the standard printed recension; a few chapters differ by
 * one verse between editions, which is noted where it matters rather than
 * silently picked.
 */
import type { KnowledgeEntry } from "./types";
import {
  ANDHRA_BHARATI,
  ARCHIVE_ORG,
  GITA_SUPERSITE,
  SANSKRIT_DOCUMENTS,
  TTD_EBOOKS,
  wikisourceTe,
} from "./sources";

export const GITA: KnowledgeEntry = {
  slug: "gita",
  title: "Bhagavad Gita",
  titleTe: "భగవద్గీత",
  summary: "Seven hundred verses spoken between two armies, on what a person should do when every choice looks wrong.",
  summaryTe: "రెండు సైన్యాల మధ్య చెప్పబడిన ఏడు వందల శ్లోకాలు — కర్తవ్యం గురించి.",
  body: [
    "The Gita sits inside the Mahabharata, in the Bhishma Parva, and it begins at the worst possible moment: the armies are drawn up, the conches have sounded, and Arjuna — who has trained his whole life for this — puts down his bow. He can see cousins, teachers and elders on the other side, and he says he would rather be killed than kill them.",
    "What follows is not comfort. Krishna's answer works through duty, action, knowledge and devotion in turn, and it refuses the option Arjuna wants, which is to walk away. The argument that has made the text last is the one about action: that work done as an offering, without clutching at its result, does not bind the person who does it. That is a claim about how to live in the world rather than how to leave it, which is why farmers, soldiers, clerks and monks have all found it addressed to them.",
    "Eighteen chapters, seven hundred verses. Each chapter carries a name ending in 'yoga', and the eighteen names read almost as a syllabus. The pages here give each chapter's name, its length, what it is about, and where its verses can be read.",
  ],
  divisions: [
    { slug: "1", name: "అర్జున విషాద యోగం", nameRoman: "Arjuna Vishada Yoga", nameEnglish: "Arjuna's despair", verses: 47, intro: "The armies face each other and Arjuna's resolve collapses. The whole text exists because of this chapter's refusal.", teachings: ["Grief as a legitimate starting point for enquiry"] },
    { slug: "2", name: "సాంఖ్య యోగం", nameRoman: "Sankhya Yoga", nameEnglish: "The way of discrimination", verses: 72, intro: "The longest chapter and the one most often read alone. Introduces the imperishable self, and the idea of acting without attachment to outcome.", teachings: ["The self is not slain when the body is", "Do the work; release the result", "Equanimity in gain and loss"] },
    { slug: "3", name: "కర్మ యోగం", nameRoman: "Karma Yoga", nameEnglish: "The way of action", verses: 43, intro: "Answers the obvious objection: if knowledge is higher, why act at all? Because nobody can actually abstain, and because the world is held together by work done well.", teachings: ["Inaction is not available to anyone", "Work as offering rather than as transaction"] },
    { slug: "4", name: "జ్ఞాన కర్మ సన్యాస యోగం", nameRoman: "Jnana Karma Sanyasa Yoga", nameEnglish: "Knowledge and renunciation of action", verses: 42, intro: "On the lineage through which this teaching has travelled, and on knowledge as what burns away the binding quality of action.", teachings: ["The teaching's own transmission", "Knowledge as the fire in which action is consumed"] },
    { slug: "5", name: "కర్మ సన్యాస యోగం", nameRoman: "Karma Sanyasa Yoga", nameEnglish: "Renunciation of action", verses: 29, intro: "Compares renouncing action with acting without attachment, and finds the second both harder and better.", teachings: ["Renunciation of the fruit, not of the work"] },
    { slug: "6", name: "ధ్యాన యోగం", nameRoman: "Dhyana Yoga", nameEnglish: "The way of meditation", verses: 47, intro: "The practical chapter on meditation: where to sit, how much to eat and sleep, and what to do with a mind that will not settle. Notably moderate — it rejects extremes of both indulgence and austerity.", teachings: ["Moderation in food, sleep and effort", "The mind as both the obstacle and the instrument"] },
    { slug: "7", name: "జ్ఞాన విజ్ఞాన యోగం", nameRoman: "Jnana Vijnana Yoga", nameEnglish: "Knowledge and realisation", verses: 30, intro: "On the divine as the ground of everything, and on the four kinds of people who turn toward it — including, without disdain, those who come because they want something.", teachings: ["Knowing about, and knowing directly", "Four sorts of seekers, all admitted"] },
    { slug: "8", name: "అక్షర బ్రహ్మ యోగం", nameRoman: "Akshara Brahma Yoga", nameEnglish: "The imperishable absolute", verses: 28, intro: "On what happens at death, and on holding a single syllable in mind at the last moment.", teachings: ["The condition of the mind at death matters", "Remembrance as practice"] },
    { slug: "9", name: "రాజ విద్యా రాజ గుహ్య యోగం", nameRoman: "Raja Vidya Raja Guhya Yoga", nameEnglish: "The royal knowledge and secret", verses: 34, intro: "Among the most quoted chapters in the bhakti tradition: that a leaf, a flower, a fruit or water offered with love is accepted, and that no one is barred by birth.", teachings: ["A leaf or water offered with love is enough", "The path is open to anyone who turns to it"] },
    { slug: "10", name: "విభూతి యోగం", nameRoman: "Vibhuti Yoga", nameEnglish: "Divine manifestations", verses: 42, intro: "A long list — among rivers, the Ganga; among mountains, Meru; among the senses, the mind — naming the best of each class as a form of the divine.", teachings: ["The finest of every kind as a pointer"] },
    { slug: "11", name: "విశ్వరూప దర్శన యోగం", nameRoman: "Vishwarupa Darshana Yoga", nameEnglish: "The vision of the universal form", verses: 55, intro: "Arjuna asks to see, and then cannot bear what he sees. The most frightening chapter in the text, and the one that most resists being made comfortable.", teachings: ["Seeing is not the same as understanding", "Terror as an honest response to the infinite"] },
    { slug: "12", name: "భక్తి యోగం", nameRoman: "Bhakti Yoga", nameEnglish: "The way of devotion", verses: 20, intro: "Short, warm, and practical: a ladder of practices for people at different distances, ending in a description of the person one would actually want to be.", teachings: ["A ladder, so nobody is excluded for being a beginner", "The marks of one who is dear: patient, without malice, unshaken"] },
    { slug: "13", name: "క్షేత్ర క్షేత్రజ్ఞ విభాగ యోగం", nameRoman: "Kshetra Kshetrajna Vibhaga Yoga", nameEnglish: "The field and its knower", verses: 34, intro: "Distinguishes the field — body, mind, circumstance — from the one who knows it. Some editions count 35 verses here.", teachings: ["The knower is not the field it knows"] },
    { slug: "14", name: "గుణత్రయ విభాగ యోగం", nameRoman: "Gunatraya Vibhaga Yoga", nameEnglish: "The three qualities", verses: 27, intro: "On sattva, rajas and tamas — clarity, restlessness and inertia — as the three strands running through everything a person does.", teachings: ["Three qualities, present in everyone in changing proportion"] },
    { slug: "15", name: "పురుషోత్తమ యోగం", nameRoman: "Purushottama Yoga", nameEnglish: "The supreme person", verses: 20, intro: "Opens with the image of an inverted tree, roots above and branches below, and the instruction to cut it with the axe of non-attachment.", teachings: ["The world as a tree to be understood, then released"] },
    { slug: "16", name: "దైవాసుర సంపద్ విభాగ యోగం", nameRoman: "Daivasura Sampad Vibhaga Yoga", nameEnglish: "The divine and the demonic", verses: 24, intro: "Two lists of dispositions — fearlessness, truthfulness and restraint against arrogance, cruelty and self-deception — presented as tendencies rather than as classes of people.", teachings: ["Two sets of tendencies, both available to anyone"] },
    { slug: "17", name: "శ్రద్ధాత్రయ విభాగ యోగం", nameRoman: "Shraddhatraya Vibhaga Yoga", nameEnglish: "The three kinds of faith", verses: 28, intro: "How the three qualities show up in what people eat, how they worship, what they give and how they speak.", teachings: ["Practice reveals disposition", "Austerity of body, speech and mind"] },
    { slug: "18", name: "మోక్ష సన్యాస యోగం", nameRoman: "Moksha Sanyasa Yoga", nameEnglish: "Release through renunciation", verses: 78, intro: "The summary chapter, and the second longest. Ends with Arjuna's doubt gone and his bow taken up — the text closes by returning him to the work he wanted to escape.", teachings: ["Doing one's own imperfectly beats doing another's well", "The conclusion is action, not withdrawal"] },
  ],
  sources: [
    wikisourceTe("భగవద్గీత", "Bhagavad Gita on Telugu Wikisource", "Freely licensed, and the only source here we could host a copy from."),
    GITA_SUPERSITE,
    SANSKRIT_DOCUMENTS,
    TTD_EBOOKS,
  ],
  related: [
    { href: "/dharma/mahabharatam/", label: "Mahabharatam — the epic the Gita sits inside" },
    { href: "/dharma/upanishads/", label: "Upanishads" },
  ],
};

export const RAMAYANAM: KnowledgeEntry = {
  slug: "ramayanam",
  title: "Ramayanam",
  titleTe: "రామాయణం",
  summary: "Valmiki's epic of exile, loss and return — and the text this village's own temple is dedicated to.",
  summaryTe: "వాల్మీకి రామాయణం — వనవాసం, ఎడబాటు, తిరిగి రావడం.",
  body: [
    "The Ramayana is the story of a prince exiled on the eve of his coronation, of his wife taken, and of what it costs to get her back. Valmiki's Sanskrit is the source, but in Telugu the epic has been told many times over — by Molla, a potter's daughter, in verse plain enough that people memorised it; in the Ranganatha Ramayanam; and in the Sundara Kanda that families still read aloud in difficulty.",
    "This village's temple is a Ramalayam. That makes the Ramayana not a distant classic here but the text behind the deity in the sanctum, the festivals in the calendar, and the names of a good many people in the members directory.",
    "Seven kandas. The seventh, the Uttara Kanda, is regarded by many scholars as a later addition and is treated differently by different traditions — it is listed here with that noted, because pretending the question does not exist would be the less respectful choice.",
  ],
  divisions: [
    { slug: "bala", name: "బాలకాండ", nameRoman: "Bala Kanda", nameEnglish: "The book of childhood", intro: "Rama's birth, his education, the breaking of Shiva's bow, and his marriage to Sita. Also the frame story of how Valmiki came to compose the poem at all.", teachings: ["The origin of the epic's own telling", "Vishvamitra as teacher"] },
    { slug: "ayodhya", name: "అయోధ్యాకాండ", nameRoman: "Ayodhya Kanda", nameEnglish: "The book of Ayodhya", intro: "A promise made long ago is called in, and on the night before his coronation Rama is sent to the forest for fourteen years. Sita and Lakshmana go with him. Bharata refuses the throne.", teachings: ["A word given is binding, whatever it costs", "Bharata's refusal as its own kind of duty"] },
    { slug: "aranya", name: "అరణ్యకాండ", nameRoman: "Aranya Kanda", nameEnglish: "The book of the forest", intro: "Years in the forest among sages, and then the abduction of Sita by Ravana — the turn on which everything after depends. Jatayu dies trying to stop it.", teachings: ["Jatayu's hopeless resistance", "The cost of a single deception"] },
    { slug: "kishkindha", name: "కిష్కింధకాండ", nameRoman: "Kishkindha Kanda", nameEnglish: "The book of Kishkindha", intro: "Rama's alliance with Sugriva and the vanaras, and the beginning of the search. Hanuman enters the story here.", teachings: ["Friendship offered and honoured", "The search organised rather than despaired of"] },
    { slug: "sundara", name: "సుందరకాండ", nameRoman: "Sundara Kanda", nameEnglish: "The beautiful book", intro: "Hanuman's leap to Lanka, his finding of Sita, and his return with proof. The kanda most often read on its own, and the one families turn to when something is wrong.", teachings: ["Devotion as capability, not only feeling", "Sita's refusal to be carried away by anyone but Rama"] },
    { slug: "yuddha", name: "యుద్ధకాండ", nameRoman: "Yuddha Kanda", nameEnglish: "The book of war", intro: "The bridge, the siege, the deaths of Kumbhakarna and Indrajit, and Ravana's fall. The longest kanda, and the one that gives Vijayadashami its meaning.", teachings: ["Ravana as formidable, not merely wicked", "The war won and the grief not undone by it"] },
    { slug: "uttara", name: "ఉత్తరకాండ", nameRoman: "Uttara Kanda", nameEnglish: "The last book", intro: "The events after the return: Sita's second exile, the birth of Lava and Kusha, and the end. Widely held by scholars to be a later addition, and read very differently across traditions — some do not read it at all.", teachings: ["A later layer, and treated as such by many"] },
  ],
  sources: [
    wikisourceTe("రామాయణము", "Ramayanam on Telugu Wikisource"),
    { ...ANDHRA_BHARATI, url: "https://andhrabharati.com/itihAsamulu/rAmAyaNamu/index.html", note: "Molla's Ramayanam and other Telugu retellings, in full verse. Read there; not licensed for copying." },
    TTD_EBOOKS,
    ARCHIVE_ORG,
  ],
  related: [
    { href: "/about/", label: "Sri Ramalayam, Reddivaripalli" },
    { href: "/events/", label: "Sri Rama Navami and the village festival calendar" },
  ],
};

export const MAHABHARATAM: KnowledgeEntry = {
  slug: "mahabharatam",
  title: "Mahabharatam",
  titleTe: "మహాభారతం",
  summary: "The longest poem in the world, about a family that could not divide a kingdom, and everything that follows from that.",
  summaryTe: "ప్రపంచంలో అతి పెద్ద కావ్యం — ఒక కుటుంబం, ఒక రాజ్యం, ఒక యుద్ధం.",
  body: [
    "The Mahabharata is about eight times the length of the Iliad and Odyssey combined, and it contains almost everything: a succession dispute, a dice game, an exile, a war that kills nearly everyone, and long stretches of law, philosophy and story that have very little to do with the plot. The Bhagavad Gita is one of those digressions.",
    "In Telugu it is the Andhra Mahabharatam, begun by Nannayya in the eleventh century, continued by Tikkana and completed by Errana — the Kavitrayam, the three poets, whose work is the foundation of literary Telugu. Their text is public domain and can be read in full at Andhra Bharati.",
    "What makes it unlike the Ramayana is that almost nobody in it is simply good. Yudhishthira gambles away his family. Krishna advises deceptions. Karna, on the wrong side, is the most sympathetic figure in the poem. The epic seems to know this about itself: it says more than once that dharma is subtle, and it does not then make it simple.",
  ],
  divisions: [
    { slug: "adi", name: "ఆదిపర్వం", nameRoman: "Adi Parva", nameEnglish: "The book of the beginning", intro: "Origins: the ancestors, the births of the Kauravas and Pandavas, their schooling, and Draupadi's marriage." },
    { slug: "sabha", name: "సభాపర్వం", nameRoman: "Sabha Parva", nameEnglish: "The book of the assembly hall", intro: "The dice game, and the humiliation in the hall that the rest of the epic never recovers from." },
    { slug: "aranya", name: "అరణ్యపర్వం", nameRoman: "Aranya Parva", nameEnglish: "The book of the forest", intro: "Twelve years in exile, and the stories told during them — including Nala and Damayanti, and Savitri." },
    { slug: "udyoga", name: "ఉద్యోగపర్వం", nameRoman: "Udyoga Parva", nameEnglish: "The book of effort", intro: "The last attempts at peace, all of them failing, and both sides gathering allies." },
    { slug: "bhishma", name: "భీష్మపర్వం", nameRoman: "Bhishma Parva", nameEnglish: "The book of Bhishma", intro: "The war begins, and the Bhagavad Gita is spoken before the first arrow. Bhishma falls." },
    { slug: "karna", name: "కర్ణపర్వం", nameRoman: "Karna Parva", nameEnglish: "The book of Karna", intro: "Karna's command and death — the passage most readers find hardest, because he has been wronged from birth." },
    { slug: "shanti", name: "శాంతిపర్వం", nameRoman: "Shanti Parva", nameEnglish: "The book of peace", intro: "The longest book. Bhishma, dying, instructs Yudhishthira on duty, governance and release. Almost no plot and a great deal of the epic's actual thought." },
    { slug: "svargarohana", name: "స్వర్గారోహణపర్వం", nameRoman: "Svargarohana Parva", nameEnglish: "The ascent", intro: "The last journey, and Yudhishthira's refusal to enter heaven without the dog that followed him." },
  ],
  sources: [
    { ...ANDHRA_BHARATI, label: "Andhra Mahabharatam (Kavitrayam) at Andhra Bharati", note: "All eighteen parvas in Telugu verse by Nannayya, Tikkana and Errana. Public-domain poets; the digital edition is not licensed for copying." },
    wikisourceTe("మహాభారతము", "Mahabharatam on Telugu Wikisource"),
    TTD_EBOOKS,
  ],
  related: [{ href: "/dharma/gita/", label: "Bhagavad Gita" }],
};

export const PURANAS: KnowledgeEntry = {
  slug: "puranas",
  title: "Puranas",
  titleTe: "పురాణాలు",
  summary: "The form in which most people have actually received the tradition: story, genealogy, pilgrimage and praise.",
  summaryTe: "కథల రూపంలో సంప్రదాయం — వంశావళి, తీర్థయాత్ర, స్తుతి.",
  body: [
    "There are eighteen Mahapuranas and many more minor ones. They are late by the tradition's standards and enormous, and they are where the gods most people actually worship take the shapes they now have. If the Upanishads are the tradition thinking, the Puranas are the tradition telling.",
    "For Telugu readers one of them matters more than the rest. Potana's Andhra Maha Bhagavatam, a fifteenth-century Telugu rendering of the Bhagavata Purana, is among the most loved texts in the language — the Gajendra Moksham and Prahlada Charitra passages are known by heart in households that own no books at all. Potana died in the fifteenth century, so his work is unambiguously public domain.",
    "Below are the Puranas most often read in this region. Where a full text cannot be hosted here, the link goes to a source whose terms allow reading it there.",
  ],
  divisions: [
    { slug: "bhagavata", name: "భాగవత పురాణం", nameRoman: "Bhagavata Purana", nameEnglish: "The Bhagavatam", intro: "The most widely read of all, and in Telugu the most beloved: Potana's twelve-skandha rendering. Krishna's life is its tenth book; Prahlada, Gajendra and Kuchela are in it.", teachings: ["Devotion as the highest path", "Krishna's childhood as theology told as story"] },
    { slug: "vishnu", name: "విష్ణు పురాణం", nameRoman: "Vishnu Purana", nameEnglish: "The Vishnu Purana", intro: "Compact and orderly by Puranic standards. Cosmology, genealogies, and the avataras. A Telugu rendering exists as the Andhra Sri Vishnu Puranam." },
    { slug: "shiva", name: "శివ పురాణం", nameRoman: "Shiva Purana", nameEnglish: "The Shiva Purana", intro: "Shiva's forms, the jyotirlingas, and the practices of his worship. Behind much of what happens in a village Shiva temple on Maha Shivaratri." },
    { slug: "devi-bhagavatam", name: "దేవీ భాగవతం", nameRoman: "Devi Bhagavatam", nameEnglish: "The Devi Bhagavatam", intro: "The Goddess as the supreme reality rather than a consort. The text behind Navaratri, and behind the jatharas held for Mathamma and Devapatlamma in this village." },
    { slug: "skanda", name: "స్కంద పురాణం", nameRoman: "Skanda Purana", nameEnglish: "The Skanda Purana", intro: "The largest of the eighteen. Chiefly concerned with Kartikeya, and with the sacred geography of pilgrimage places." },
    { slug: "markandeya", name: "మార్కండేయ పురాణం", nameRoman: "Markandeya Purana", nameEnglish: "The Markandeya Purana", intro: "Contains the Devi Mahatmya, the Durga Saptashati, chanted during Navaratri across Andhra Pradesh." },
    { slug: "garuda", name: "గరుడ పురాణం", nameRoman: "Garuda Purana", nameEnglish: "The Garuda Purana", intro: "Best known for its sections on death and the rites that follow it, which is why it is read at a particular moment in a family's life and rarely otherwise." },
    { slug: "padma", name: "పద్మ పురాణం", nameRoman: "Padma Purana", nameEnglish: "The Padma Purana", intro: "Creation, sacred places, and a long account of the Ramayana's story told again from a devotional angle." },
    { slug: "agni", name: "అగ్ని పురాణం", nameRoman: "Agni Purana", nameEnglish: "The Agni Purana", intro: "The most encyclopaedic: ritual, architecture, grammar, medicine, statecraft and poetics alongside the myth." },
  ],
  sources: [
    wikisourceTe("పోతన తెలుగు భాగవతము", "Potana's Telugu Bhagavatam on Wikisource", "Freely licensed, and by a fifteenth-century poet — clear on both counts."),
    wikisourceTe("ఆంధ్ర శ్రీవిష్ణుపురాణము", "Andhra Sri Vishnu Puranam on Wikisource"),
    ANDHRA_BHARATI,
    TTD_EBOOKS,
  ],
  related: [{ href: "/telugu-culture/literature/", label: "Telugu literature" }],
};

export const SCRIPTURES: KnowledgeEntry[] = [GITA, RAMAYANAM, MAHABHARATAM, PURANAS];
