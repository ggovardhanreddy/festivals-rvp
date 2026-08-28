/**
 * Game catalogue. Metadata only; each game implements its own logic.
 *
 * No account, no purchase, no timer pressure, no streak-loss mechanics — the
 * points exist to mark progress, not to compel return visits.
 */
export type GameDef = {
  id: string;
  slug: string;
  labelKey: string;
  descriptionKey: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  icon: string;
  ready: boolean;
};

export const GAMES: GameDef[] = [
  { id: "sudoku",  slug: "sudoku",  labelKey: "game.sudoku",  descriptionKey: "game.sudoku.desc",  difficulty: "medium", points: 20, icon: "grid",   ready: true },
  { id: "memory",  slug: "memory",  labelKey: "game.memory",  descriptionKey: "game.memory.desc",  difficulty: "easy",   points: 10, icon: "cards",  ready: true },
  { id: "maths",   slug: "maths",   labelKey: "game.maths",   descriptionKey: "game.maths.desc",   difficulty: "easy",   points: 10, icon: "plus",   ready: true },
  { id: "word",    slug: "word",    labelKey: "game.word",    descriptionKey: "game.word.desc",    difficulty: "easy",   points: 10, icon: "letter", ready: true },
  { id: "quiz",    slug: "quiz",    labelKey: "game.quiz",    descriptionKey: "game.quiz.desc",    difficulty: "medium", points: 15, icon: "question", ready: true },
];

export function gameBySlug(slug: string): GameDef | undefined {
  return GAMES.find((g) => g.slug === slug);
}
