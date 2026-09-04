/**
 * Slokas, devotional music, Telugu literature and Sri Sri.
 *
 * This is the file where the copyright research bites hardest, so the rules
 * are encoded rather than remembered:
 *
 *  - AUTHORS carries a `publicDomain` flag computed from the year of death.
 *    India's term is lifetime plus 60 years from the end of the year of death
 *    (Copyright Act 1957 s.22), with no renewal, so the year of death is the
 *    whole test. Anyone who died in 1965 or earlier is free in 2026.
 *  - Sri Sri died in 1983. His work is protected until 1 January 2044. This
 *    site carries his dates, his bibliography, his awards, original criticism
 *    and links — and no line of his poetry.
 *  - Devotional recordings carry their own copyright regardless of how old the
 *    composition is, so music is embedded from the platform's player and never
 *    downloaded.
 */
import type { Author, KnowledgeEntry } from "./types";
import {
  ANDHRA_BHARATI,
  ANNAMAYYA_ORG,
  ARCHIVE_ORG,
  SANSKRIT_DOCUMENTS,
  SVBC_YOUTUBE,
  TTD_EBOOKS,
  wikisourceTe,
} from "./sources";

export const SLOKAS: KnowledgeEntry = {
  slug: "slokas",
  title: "Slokas & Mantras",
  titleTe: "శ్లోకాలు & మంత్రాలు",
  summary: "The verses said at home — morning and evening, before food, before a journey, before an examination.",
  summaryTe: "ఇంట్లో చెప్పే శ్లోకాలు — ఉదయం, సాయంత్రం, భోజనానికి ముందు.",
  body: [
    "Most people's daily contact with the tradition is not a text but a handful of verses, learned by ear from a grandmother and said without thinking about it. A few lines to Ganesha before starting anything. The Hanuman Chalisa on a Tuesday. Something short before sleeping.",
    "The categories below follow how those verses are actually used rather than how a scholar would classify them. For each, the pages point to a source where the Sanskrit and a Telugu rendering can be read, and where a recitation can be heard — because a sloka learned from print and never heard aloud usually comes out wrong.",
    "One caution worth stating plainly: printed and recorded versions differ, and this site is not the authority on which is correct. Where a family has its own way of saying something, that is the version to keep.",
  ],
  divisions: [
    { slug: "ganesha", name: "గణేశ", nameRoman: "Ganesha", nameEnglish: "Ganesha", intro: "Said before beginning anything at all — a journey, a wedding, a school year, a building. The village's Vinayaka Chavithi is this deity's festival." },
    { slug: "shiva", name: "శివ", nameRoman: "Shiva", nameEnglish: "Shiva", intro: "The Rudram from the Yajur Veda, the Lingashtakam, and the Maha Mrityunjaya mantra. Chanted especially on Maha Shivaratri and on Mondays." },
    { slug: "vishnu", name: "విష్ణు", nameRoman: "Vishnu", nameEnglish: "Vishnu", intro: "The Vishnu Sahasranama — a thousand names, recited in full on Saturdays and at Tirumala. Also the Venkateswara Suprabhatam, heard across Andhra Pradesh at dawn." },
    { slug: "lakshmi", name: "లక్ష్మీ", nameRoman: "Lakshmi", nameEnglish: "Lakshmi", intro: "The Kanakadhara Stotram and the Lakshmi Ashtottaram. Central to Varalakshmi Vratam, which this village keeps." },
    { slug: "saraswati", name: "సరస్వతీ", nameRoman: "Saraswati", nameEnglish: "Saraswati", intro: "Said at the start of study and on Vasant Panchami, and by generations of students the night before an examination." },
    { slug: "devi", name: "దేవీ", nameRoman: "Devi", nameEnglish: "The Goddess", intro: "The Devi Mahatmya and the Lalita Sahasranama. The texts behind Navaratri, and behind the Mathamma and Devapatlamma jatharas held here." },
    { slug: "hanuman", name: "హనుమాన్", nameRoman: "Hanuman", nameEnglish: "Hanuman", intro: "The Hanuman Chalisa and the Sundara Kanda, both turned to in difficulty. Read on Tuesdays and Saturdays." },
    { slug: "surya", name: "సూర్య", nameRoman: "Surya", nameEnglish: "Surya", intro: "The Aditya Hridayam, spoken to Rama before battle in the Ramayana, and the Gayatri, said at sunrise." },
    { slug: "navagraha", name: "నవగ్రహ", nameRoman: "Navagraha", nameEnglish: "The nine planets", intro: "Verses addressed to the nine, said when a horoscope suggests a difficult period. Widely used and widely debated." },
    { slug: "guru", name: "గురు", nameRoman: "Guru", nameEnglish: "Guru", intro: "Verses honouring the teacher, said on Guru Purnima and at the start of learning anything." },
    { slug: "morning", name: "ప్రాతః స్మరణ", nameRoman: "Pratah smarana", nameEnglish: "Morning prayers", intro: "The verses said on waking, before the feet touch the ground — the Karagre Vasate Lakshmi, and the prayer to the earth before stepping on her." },
    { slug: "evening", name: "సాయం సంధ్య", nameRoman: "Sayam sandhya", nameEnglish: "Evening prayers", intro: "The lamp lit at dusk, and the verses said with it. In most Reddivaripalli houses this is the day's most reliably kept observance." },
    { slug: "daily", name: "నిత్య ప్రార్థనలు", nameRoman: "Nitya prarthanalu", nameEnglish: "Daily prayers", intro: "Before food, before travel, before sleep. Short, said often, and usually learned without ever being written down." },
    { slug: "stotrams", name: "స్తోత్రాలు", nameRoman: "Stotrams", nameEnglish: "Hymns of praise", intro: "Longer compositions in praise of a deity — the Sahasranamas, the Ashtakams, the Chalisas. Many by named poets, some ancient and anonymous." },
    { slug: "temple", name: "ఆలయ ప్రార్థనలు", nameRoman: "Alaya prarthanalu", nameEnglish: "Temple prayers", intro: "The verses said at the temple rather than at home: at the flagstaff, at the sanctum, and in circumambulation." },
  ],
  sources: [SANSKRIT_DOCUMENTS, TTD_EBOOKS, wikisourceTe("విష్ణు సహస్రనామ స్తోత్రము", "Vishnu Sahasranama on Telugu Wikisource"), SVBC_YOUTUBE],
  related: [{ href: "/dharma/music/", label: "Devotional music" }],
};

export const DEVOTIONAL_MUSIC: KnowledgeEntry = {
  slug: "music",
  title: "Devotional Music",
  titleTe: "భక్తి సంగీతం",
  summary: "Annamayya, Ramadasu, Thyagaraja and the bhajans sung in this village — with a plain note on what we may and may not host.",
  summaryTe: "అన్నమయ్య, రామదాసు, త్యాగరాజు — మరియు మన గ్రామంలో పాడే భజనలు.",
  body: [
    "Telugu devotional song is one of the great bodies of religious music anywhere, and three names carry most of it. Annamayya wrote some thirty-two thousand keerthanas at Tirumala in the fifteenth century; the copper plates were found in the temple and deciphered in the twentieth. Bhakta Ramadasu wrote from a prison at Golconda. Thyagaraja, in Tamil country but composing in Telugu, wrote the kritis that carry Carnatic music.",
    "All three are long dead and their words are free to publish. Their recordings are not. A recording carries its own copyright for sixty years from its publication — so M. S. Subbulakshmi's 1979 album of Annamayya keerthanas is protected until the end of 2039, even though Annamayya died in 1503. A twentieth-century musician's tune for an old lyric is likewise a new work with its own term.",
    "So this section embeds official channels and never downloads audio. And there is one clean way to change that: record the village's own singers performing these public-domain compositions, and release those recordings freely. Every layer would then be ours or free, and openly-licensed Telugu devotional audio is genuinely scarce.",
  ],
  divisions: [
    { slug: "annamayya", name: "అన్నమయ్య", nameRoman: "Annamacharya", nameEnglish: "Annamayya keerthanas", intro: "Tallapaka Annamacharya, 1408–1503, the first known composer of keerthanas in Telugu. His words are public domain; the printed editions and the recordings mostly are not." },
    { slug: "thyagaraja", name: "త్యాగరాజు", nameRoman: "Thyagaraja", nameEnglish: "Thyagaraja kritis", intro: "1767–1847. Composed in Telugu, and one of the trinity of Carnatic music. Public domain. The Pancharatna kritis are sung together every year at Thiruvaiyaru." },
    { slug: "ramadasu", name: "రామదాసు", nameRoman: "Bhadrachala Ramadasu", nameEnglish: "Ramadasu keerthanas", intro: "Kancherla Gopanna, c. 1620–1688, who built the Bhadrachalam temple and was imprisoned for using state funds to do it. He wrote to Rama from that prison. Public domain — and the natural repertoire for a Ramalayam village." },
    { slug: "bhajans", name: "భజనలు", nameRoman: "Bhajans", nameEnglish: "Bhajans", intro: "Congregational singing, usually simple and repetitive so that everyone present can join. The form most used in this village's own gatherings." },
    { slug: "keerthanas", name: "కీర్తనలు", nameRoman: "Keerthanas", nameEnglish: "Keerthanas", intro: "Composed devotional songs with a refrain and verses, the backbone of the South Indian devotional repertoire." },
    { slug: "harikatha", name: "హరికథ", nameRoman: "Harikatha", nameEnglish: "Harikatha", intro: "Story, song and commentary performed together by a single narrator — the form through which most villages received the Puranas before anyone had a radio." },
    { slug: "temple", name: "ఆలయ సంగీతం", nameRoman: "Alaya sangeetam", nameEnglish: "Temple music", intro: "The nadaswaram and the melam played at temple processions, and the Suprabhatam sung at dawn." },
    { slug: "festival", name: "పండుగ పాటలు", nameRoman: "Panduga patalu", nameEnglish: "Festival music", intro: "Songs tied to particular festivals — Sankranthi haridasu songs, Bathukamma songs, the jathara processions recorded in this site's gallery." },
  ],
  sources: [
    SVBC_YOUTUBE,
    ANNAMAYYA_ORG,
    { label: "Annamacharya keerthana texts", url: "https://annamacharya-lyrics.blogspot.com/", access: "link", language: "te", licence: "No licence stated — use as a finding aid, verify against a public-domain edition", note: "Useful index. The lyrics themselves are Annamayya's and free; this transcription is not licensed." },
    ARCHIVE_ORG,
  ],
  related: [{ href: "/gallery/", label: "The village's own bhajans and festival recordings" }],
};

/**
 * Telugu authors, with the fact that decides whether we may publish them.
 *
 * `publicDomain` is not a judgement call — it is the year of death plus sixty.
 * The three modern names at the end are here precisely because they are so
 * often assumed to be free, and are not.
 */
export const AUTHORS: Author[] = [
  {
    slug: "annamayya", name: "Tallapaka Annamacharya", nameTe: "తాళ్లపాక అన్నమాచార్యులు",
    lived: "1408–1503", died: 1503, publicDomain: true,
    known: "The first known composer of Telugu keerthanas, and the padakavita pitamaha — the grandfather of the song-poem.",
    works: ["Some 32,000 keerthanas, of which around 12,000 survive", "Sankirtana Lakshanam", "Venkatachala Mahatyam"],
    sources: [ANNAMAYYA_ORG, TTD_EBOOKS],
  },
  {
    slug: "potana", name: "Bammera Pothana", nameTe: "బమ్మెర పోతన",
    lived: "c. 1450–c. 1510", died: 1510, publicDomain: true,
    known: "Rendered the Bhagavata Purana into Telugu verse of such directness that villages memorised it. Refused to dedicate the work to a king.",
    works: ["Andhra Maha Bhagavatam", "Bhogini Dandakam", "Veerabhadra Vijayam"],
    sources: [wikisourceTe("పోతన తెలుగు భాగవతము", "Potana's Bhagavatam on Wikisource"), ANDHRA_BHARATI],
  },
  {
    slug: "kavitrayam", name: "Nannayya, Tikkana and Errana", nameTe: "కవిత్రయం",
    lived: "11th–14th century", died: 1400, publicDomain: true,
    known: "The three poets who rendered the Mahabharata into Telugu across three centuries, and in doing so made literary Telugu.",
    works: ["Andhra Mahabharatam, all eighteen parvas", "Nannayya's Andhra Shabda Chintamani"],
    sources: [ANDHRA_BHARATI],
  },
  {
    slug: "molla", name: "Atukuri Molla", nameTe: "ఆతుకూరి మొల్ల",
    lived: "16th century", died: 1530, publicDomain: true,
    known: "A potter's daughter who wrote a Ramayana in Telugu plain enough for ordinary people to follow — deliberately, and against the fashion of her time.",
    works: ["Molla Ramayanam"],
    sources: [{ ...ANDHRA_BHARATI, url: "https://andhrabharati.com/itihAsamulu/rAmAyaNamu/index.html" }],
  },
  {
    slug: "ramadasu", name: "Bhadrachala Ramadasu", nameTe: "భద్రాచల రామదాసు",
    lived: "c. 1620–c. 1688", died: 1688, publicDomain: true,
    known: "Kancherla Gopanna, who built the Bhadrachalam temple with state revenue and wrote his best-known songs in the prison he was put in for it.",
    works: ["Dasarathi Satakam", "Several hundred keerthanas to Rama"],
    sources: [ARCHIVE_ORG],
  },
  {
    slug: "vemana", name: "Vemana", nameTe: "వేమన",
    lived: "disputed, before 1800", died: 1730, publicDomain: true,
    known: "Wrote thousands of four-line verses in the plainest Telugu, attacking caste, ritualism and hypocrisy. Still quoted in argument.",
    works: ["Vemana Satakam"],
    sources: [ANDHRA_BHARATI, ARCHIVE_ORG],
  },
  {
    slug: "thyagaraja", name: "Thyagaraja", nameTe: "త్యాగరాజు",
    lived: "1767–1847", died: 1847, publicDomain: true,
    known: "Composed in Telugu and shaped Carnatic music. One of its trinity.",
    works: ["Pancharatna kritis", "Several hundred kritis", "Two musical dramas"],
    sources: [ARCHIVE_ORG],
  },
  {
    slug: "gurajada", name: "Gurajada Apparao", nameTe: "గురజాడ అప్పారావు",
    lived: "1862–1915", died: 1915, publicDomain: true,
    known: "Wrote Kanyasulkam against the sale of girls in marriage, in spoken Telugu rather than literary Telugu — a decision that changed the language of Telugu writing.",
    works: ["Kanyasulkam (1892, revised 1909)", "Mutyala Saralu", "Desamunu Preminchumanna"],
    sources: [wikisourceTe("కన్యాశుల్కము", "Kanyasulkam on Telugu Wikisource"), ARCHIVE_ORG],
  },
  {
    slug: "veeresalingam", name: "Kandukuri Veeresalingam", nameTe: "కందుకూరి వీరేశలింగం",
    lived: "1848–1919", died: 1919, publicDomain: true,
    known: "Social reformer and the first Telugu novelist. Campaigned for widow remarriage and girls' education, and wrote to make the case.",
    works: ["Rajasekhara Charitramu (1880)", "Satya Harischandra", "Prahlada"],
    sources: [ARCHIVE_ORG],
  },
  // ── Still in copyright. Listed so nobody assumes otherwise. ──────────
  {
    slug: "jashuva", name: "Gurram Jashuva", nameTe: "గుర్రం జాషువా",
    lived: "1895–1971", died: 1971, publicDomain: false, publicDomainFrom: "1 January 2032",
    known: "Wrote Gabbilam, in which an untouchable sends his message to Shiva by a bat because no brahmin will carry it. One of the major Telugu poets of the century.",
    works: ["Gabbilam (1941)", "Firdousi (1932)", "Christhu Charithra (1958)"],
    sources: [],
  },
  {
    slug: "viswanatha", name: "Viswanatha Satyanarayana", nameTe: "విశ్వనాథ సత్యనారాయణ",
    lived: "1895–1976", died: 1976, publicDomain: false, publicDomainFrom: "1 January 2037",
    known: "The first Telugu writer to win the Jnanpith, for Ramayana Kalpavruksham.",
    works: ["Veyipadagalu", "Ramayana Kalpavruksham", "Kinnersani Patalu"],
    sources: [],
  },
  {
    slug: "krishnasastri", name: "Devulapalli Krishnasastri", nameTe: "దేవులపల్లి కృష్ణశాస్త్రి",
    lived: "1897–1980", died: 1980, publicDomain: false, publicDomainFrom: "1 January 2041",
    known: "The leading voice of Telugu bhava kavitvam, and the lyricist of some 160 film songs.",
    works: ["Krishnapaksham", "Urvasi", "Pravasam"],
    sources: [],
  },
];

/**
 * Sri Sri gets his own entry rather than a row in AUTHORS, because what this
 * site may carry about him is unusually constrained and the constraint has to
 * be visible to whoever edits the page next.
 */
export const SRI_SRI: KnowledgeEntry = {
  slug: "sri-sri",
  title: "Sri Sri",
  titleTe: "శ్రీశ్రీ",
  summary: "Srirangam Srinivasa Rao, 1910–1983 — the poet who turned Telugu verse towards the people who had none of it.",
  summaryTe: "శ్రీరంగం శ్రీనివాసరావు, 1910–1983 — తెలుగు కవిత్వాన్ని సామాన్యుల వైపు తిప్పిన కవి.",
  body: [
    "Srirangam Srinivasa Rao was born in Visakhapatnam on 30 April 1910 and died in Madras on 15 June 1983. He took a degree in zoology at Madras Christian College in 1931, edited the weekly Vishakha, worked as news editor at Andhra Prabha and then at All India Radio in Delhi, and settled in Madras in 1947.",
    "Maha Prasthanam, published in 1950 and reprinted more than thirty times since, is the book he is remembered for. What it did was change what Telugu poetry was allowed to be about and what register it could use: the classical ornament went, and in its place came the mill, the street, the hungry, and a rhythm built for reading aloud to a crowd. Almost every Telugu poet after him writes in a language he made available.",
    "He also wrote for cinema, and won the National Film Award for Best Lyrics in 1974 for Telugu Veera Levara in Alluri Seetarama Raju.",
    "**Why there are no poems on this page.** Under the Indian Copyright Act 1957, a published literary work is protected for the author's lifetime plus sixty years from the end of the year of death. Sri Sri died in 1983, so his work is in copyright in India until 31 December 2043 and enters the public domain on 1 January 2044. India has no renewal system, so early publication makes no difference — Prabhava of 1928 is protected exactly as long as Maha Prasthanam. Copies circulating on archive sites and even on Wikisource do not change that, and copying from them would not give this site any defence.",
    "So this page carries his dates, his life, his bibliography and his awards — all plain facts, freely publishable — and links to places where his work can be heard and read lawfully. If the village wants his poems on this site before 2044, the route is to write to Visalaandhra Publishing House in Hyderabad, his publisher of record, and ask.",
  ],
  divisions: [
    { slug: "life", name: "జీవితం", nameRoman: "Jeevitam", nameEnglish: "Life", intro: "Born 30 April 1910, Visakhapatnam. Zoology at Madras Christian College, 1931. Editor of Vishakha from 1932; news editor at Andhra Prabha 1939–42; All India Radio, Delhi; Madras from 1947. Died 15 June 1983." },
    { slug: "works", name: "రచనలు", nameRoman: "Rachanalu", nameEnglish: "Bibliography", intro: "Prabhava (1928) · Vaaram Vaaram (1946) · Sampangi Thota (1947) · Maha Prasthanam (1950) · Amma (1952) · Maro Prapancham (1956) · Khadga Srushti (1966) · Sri Sri Sahityam, five volumes (1970)." },
    { slug: "awards", name: "పురస్కారాలు", nameRoman: "Puraskaralu", nameEnglish: "Awards", intro: "Sahitya Akademi Award · Soviet Land Nehru Award (1972) · National Film Award for Best Lyrics (1974, Telugu Veera Levara) · Raja-Lakshmi Award (1979) · Nandi Award for Best Lyricist (1983, Neti Bharatam)." },
    { slug: "copyright", name: "కాపీరైట్", nameRoman: "Copyright", nameEnglish: "Copyright position", intro: "In copyright in India until 31 December 2043; public domain from 1 January 2044. Publisher of record: Visalaandhra Publishing House, Hyderabad. Works first published after his death may run longer, to sixty years from their own publication." },
  ],
  sources: [
    { label: "Sri Sri reciting his own poetry (archival footage)", url: "https://www.youtube.com/watch?v=5dIScvquI9o", access: "embed", language: "te", licence: "Embedded from YouTube's player, never downloaded", note: "Uploaded by Tvnxt Telugu. Note that 'Sri Sri' is also the honorific of Sri Sri Ravi Shankar — check any channel's identity before trusting it." },
  ],
  related: [{ href: "/telugu-culture/literature/", label: "Telugu literature" }],
};
