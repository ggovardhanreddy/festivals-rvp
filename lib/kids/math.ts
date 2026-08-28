/**
 * Arithmetic practice generator.
 *
 * Problems are generated, not stored, so there is no answer key to get wrong
 * and nothing to fabricate: every question is arithmetic that verifies itself.
 * The generator is seedable so a "practice again" button can be reproducible
 * in tests.
 */
export type MathOp = "add" | "sub" | "mul" | "div";
export type MathLevel = 1 | 2 | 3;

export type MathProblem = {
  id: string;
  op: MathOp;
  a: number;
  b: number;
  answer: number;
  /** Four options, one correct, all distinct and non-negative. */
  options: number[];
};

const SYMBOL: Record<MathOp, string> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

export function opSymbol(op: MathOp): string {
  return SYMBOL[op];
}

/** Small deterministic PRNG so a seed reproduces a whole practice set. */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

const RANGE: Record<MathLevel, { max: number; mulMax: number }> = {
  1: { max: 10, mulMax: 5 },
  2: { max: 20, mulMax: 10 },
  3: { max: 50, mulMax: 12 },
};

function pick(next: () => number, max: number, min = 0): number {
  return min + Math.floor(next() * (max - min + 1));
}

function makeOptions(answer: number, next: () => number): number[] {
  const set = new Set<number>([answer]);
  let guard = 0;
  while (set.size < 4 && guard < 60) {
    guard += 1;
    const delta = pick(next, 6, 1) * (next() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate >= 0) set.add(candidate);
  }
  // Deterministic shuffle.
  const out = [...set];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function makeProblem(
  op: MathOp,
  level: MathLevel,
  next: () => number,
  index = 0,
): MathProblem {
  const { max, mulMax } = RANGE[level];
  let a: number;
  let b: number;
  let answer: number;

  switch (op) {
    case "add":
      a = pick(next, max, 1);
      b = pick(next, max, 1);
      answer = a + b;
      break;
    case "sub":
      a = pick(next, max, 2);
      b = pick(next, a, 1); // never negative
      answer = a - b;
      break;
    case "mul":
      a = pick(next, mulMax, 1);
      b = pick(next, mulMax, 1);
      answer = a * b;
      break;
    case "div":
    default:
      b = pick(next, mulMax, 1);
      answer = pick(next, mulMax, 1);
      a = b * answer; // always exact, never a remainder
      break;
  }

  return { id: `${op}-${level}-${index}`, op, a, b, answer, options: makeOptions(answer, next) };
}

export function makeProblemSet(
  op: MathOp,
  level: MathLevel,
  count = 10,
  seed = Date.now(),
): MathProblem[] {
  const next = rng(seed);
  return Array.from({ length: count }, (_, i) => makeProblem(op, level, next, i));
}
