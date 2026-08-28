/** Sudoku generator and solver. Pure functions, unit-tested. */
export type Grid = number[]; // 81 cells, 0 = empty

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function isValidPlacement(grid: Grid, index: number, value: number): boolean {
  const row = Math.floor(index / 9);
  const col = index % 9;
  for (let i = 0; i < 9; i += 1) {
    if (i !== col && grid[row * 9 + i] === value) return false;
    if (i !== row && grid[i * 9 + col] === value) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r += 1) {
    for (let c = bc; c < bc + 3; c += 1) {
      const i = r * 9 + c;
      if (i !== index && grid[i] === value) return false;
    }
  }
  return true;
}

function solve(grid: Grid, rnd: () => number): boolean {
  const idx = grid.indexOf(0);
  if (idx === -1) return true;
  for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rnd)) {
    if (isValidPlacement(grid, idx, v)) {
      grid[idx] = v;
      if (solve(grid, rnd)) return true;
      grid[idx] = 0;
    }
  }
  return false;
}

function countSolutions(grid: Grid, limit = 2): number {
  const idx = grid.indexOf(0);
  if (idx === -1) return 1;
  let found = 0;
  for (let v = 1; v <= 9; v += 1) {
    if (isValidPlacement(grid, idx, v)) {
      grid[idx] = v;
      found += countSolutions(grid, limit - found);
      grid[idx] = 0;
      if (found >= limit) break;
    }
  }
  return found;
}

/** Deterministic PRNG so a daily puzzle is the same for everyone. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export type Puzzle = { puzzle: Grid; solution: Grid; givens: boolean[] };

export function generateSudoku(
  difficulty: "easy" | "medium" | "hard" = "easy",
  seed = Date.now(),
): Puzzle {
  const rnd = seededRandom(seed);
  const solution: Grid = new Array(81).fill(0);
  solve(solution, rnd);

  const remove = difficulty === "easy" ? 36 : difficulty === "medium" ? 46 : 52;
  const puzzle = solution.slice();
  const order = shuffle([...Array(81).keys()], rnd);
  let removed = 0;
  for (const i of order) {
    if (removed >= remove) break;
    const backup = puzzle[i]!;
    puzzle[i] = 0;
    // Keep the puzzle uniquely solvable, or put the digit back.
    if (countSolutions(puzzle.slice()) !== 1) puzzle[i] = backup;
    else removed += 1;
  }
  return { puzzle, solution, givens: puzzle.map((v) => v !== 0) };
}

export function isComplete(grid: Grid, solution: Grid): boolean {
  return grid.every((v, i) => v === solution[i]);
}
