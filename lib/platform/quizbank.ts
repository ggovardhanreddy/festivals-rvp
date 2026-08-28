/**
 * Question bank for the quiz game and the daily challenge.
 *
 * General knowledge and school-curriculum facts only. Nothing here asserts
 * anything about Reddivaripalli's history, temples, people or agriculture:
 * those are factual claims about real places and would need a cited source,
 * which is what lib/content/schema.ts provenance is for. Village questions
 * arrive when that content does.
 */
export type Question = {
  id: string;
  topic: "maths" | "science" | "gk" | "english";
  prompt: { en: string; te?: string };
  options: string[];
  correct: number;
};

export const QUESTIONS: Question[] = [
  { id: "sci-1", topic: "science", prompt: { en: "Which planet is closest to the Sun?", te: "సూర్యుడికి అత్యంత దగ్గరి గ్రహం ఏది?" }, options: ["Mercury", "Venus", "Earth", "Mars"], correct: 0 },
  { id: "sci-2", topic: "science", prompt: { en: "What gas do plants absorb from the air?", te: "మొక్కలు గాలి నుండి ఏ వాయువును తీసుకుంటాయి?" }, options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct: 1 },
  { id: "sci-3", topic: "science", prompt: { en: "How many bones are in the adult human body?" }, options: ["186", "206", "226", "246"], correct: 1 },
  { id: "sci-4", topic: "science", prompt: { en: "Water boils at what temperature at sea level?" }, options: ["90 °C", "95 °C", "100 °C", "110 °C"], correct: 2 },
  { id: "sci-5", topic: "science", prompt: { en: "Which part of a plant makes food?" }, options: ["Root", "Stem", "Leaf", "Flower"], correct: 2 },
  { id: "mat-1", topic: "maths", prompt: { en: "What is 7 × 8?" }, options: ["54", "56", "63", "48"], correct: 1 },
  { id: "mat-2", topic: "maths", prompt: { en: "How many sides does a hexagon have?" }, options: ["5", "6", "7", "8"], correct: 1 },
  { id: "mat-3", topic: "maths", prompt: { en: "What is 144 ÷ 12?" }, options: ["11", "12", "13", "14"], correct: 1 },
  { id: "mat-4", topic: "maths", prompt: { en: "What is 25% of 200?" }, options: ["25", "40", "50", "75"], correct: 2 },
  { id: "mat-5", topic: "maths", prompt: { en: "What is the next prime after 13?" }, options: ["15", "16", "17", "19"], correct: 2 },
  { id: "gk-1", topic: "gk", prompt: { en: "What is the capital of Andhra Pradesh?" }, options: ["Amaravati", "Hyderabad", "Vijayawada", "Tirupati"], correct: 0 },
  { id: "gk-2", topic: "gk", prompt: { en: "Which is the longest river in India?" }, options: ["Yamuna", "Godavari", "Ganga", "Krishna"], correct: 2 },
  { id: "gk-3", topic: "gk", prompt: { en: "Which river is the longest in South India?" }, options: ["Krishna", "Godavari", "Kaveri", "Tungabhadra"], correct: 1 },
  { id: "gk-4", topic: "gk", prompt: { en: "How many states does India have?" }, options: ["26", "27", "28", "29"], correct: 2 },
  { id: "gk-5", topic: "gk", prompt: { en: "What is the national bird of India?" }, options: ["Parrot", "Peacock", "Eagle", "Swan"], correct: 1 },
  { id: "eng-1", topic: "english", prompt: { en: "Which word is a verb?" }, options: ["Quickly", "Beautiful", "Run", "Happiness"], correct: 2 },
  { id: "eng-2", topic: "english", prompt: { en: "What is the plural of 'child'?" }, options: ["Childs", "Childes", "Children", "Childrens"], correct: 2 },
  { id: "eng-3", topic: "english", prompt: { en: "Choose the correct spelling." }, options: ["Recieve", "Receive", "Receve", "Recieve"], correct: 1 },
  { id: "eng-4", topic: "english", prompt: { en: "What is the opposite of 'ancient'?" }, options: ["Old", "Modern", "Historic", "Past"], correct: 1 },
  { id: "eng-5", topic: "english", prompt: { en: "Which is a complete sentence?" }, options: ["Running fast", "The tall tree", "She reads books", "In the morning"], correct: 2 },
];

/** Deterministic daily selection so everyone gets the same challenge. */
export function dailyQuestions(count = 10, date = new Date()): Question[] {
  const key = Number(date.toISOString().slice(0, 10).replace(/-/g, ""));
  const out: Question[] = [];
  const pool = QUESTIONS.slice();
  let s = key;
  while (out.length < Math.min(count, pool.length)) {
    s = (s * 1103515245 + 12345) % 2147483648;
    out.push(pool.splice(s % pool.length, 1)[0]!);
  }
  return out;
}

export const WORD_LIST = [
  "village", "harvest", "temple", "farmer", "school", "monsoon", "lantern",
  "garland", "festival", "granary", "bullock", "jasmine", "paddy", "banyan",
] as const;
