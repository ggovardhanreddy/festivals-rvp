"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { generateSudoku, isComplete, isValidPlacement, type Puzzle } from "@/lib/platform/sudoku";
import { awardPoints, type PlayerProfile } from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { GameShell } from "./GameShell";

export function SudokuGame({
  profile,
  update,
}: {
  profile: PlayerProfile;
  update: (p: PlayerProfile) => void;
}) {
  const { t } = useUiLang();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [grid, setGrid] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const newGame = useCallback(() => {
    const p = generateSudoku("easy");
    setPuzzle(p);
    setGrid(p.puzzle.slice());
    setSelected(null);
    setDone(false);
  }, []);

  useEffect(() => { newGame(); }, [newGame]);

  const conflicts = useMemo(() => {
    const bad = new Set<number>();
    grid.forEach((v, i) => {
      if (v !== 0 && !isValidPlacement(grid, i, v)) bad.add(i);
    });
    return bad;
  }, [grid]);

  function place(value: number) {
    if (selected === null || !puzzle || puzzle.givens[selected] || done) return;
    const next = grid.slice();
    next[selected] = value;
    setGrid(next);
    if (isComplete(next, puzzle.solution)) {
      setDone(true);
      update(awardPoints(profile, "sudoku", 20, 1));
    }
  }

  if (!puzzle) return <div aria-busy="true" />;

  return (
    <GameShell titleKey="game.sudoku" profile={profile} onNewGame={newGame}>
      <div className="sudoku" role="grid" aria-label={t("game.sudoku")}>
        {Array.from({ length: 9 }, (_, r) => (
          <div className="sudoku-row" role="row" key={r}>
            {Array.from({ length: 9 }, (_, c) => {
              const i = r * 9 + c;
              const given = puzzle.givens[i];
              const value = grid[i] ?? 0;
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  className="sudoku-cell"
                  data-given={given || undefined}
                  data-selected={selected === i || undefined}
                  data-conflict={conflicts.has(i) || undefined}
                  data-boxr={r % 3 === 2 || undefined}
                  data-boxc={c % 3 === 2 || undefined}
                  aria-label={`${t("a11y.selectDay", undefined, { day: `${r + 1},${c + 1}` })}`}
                  aria-readonly={given || undefined}
                  onClick={() => !given && !done && setSelected(i)}
                >
                  {value || ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sudoku-pad" role="group" aria-label={t("game.check")}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} type="button" className="btn ghost" onClick={() => place(n)} disabled={done}>
            {n}
          </button>
        ))}
        <button type="button" className="btn ghost" onClick={() => place(0)} disabled={done}>
          &times;
        </button>
      </div>

      {done ? (
        <p className="game-done" role="status">
          {t("game.finished")} — {t("game.pointsEarned", undefined, { points: 20 })}
        </p>
      ) : null}
    </GameShell>
  );
}
