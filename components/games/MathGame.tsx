"use client";

import { useCallback, useEffect, useState } from "react";
import { awardPoints, type PlayerProfile } from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { GameShell } from "./GameShell";

type Sum = { a: number; b: number; op: "+" | "-" | "×"; answer: number };

function makeSum(round: number): Sum {
  const max = Math.min(12, 4 + round);
  const a = 1 + Math.floor(Math.random() * max);
  const b = 1 + Math.floor(Math.random() * max);
  const ops: Sum["op"][] = round < 3 ? ["+"] : round < 6 ? ["+", "-"] : ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)]!;
  const [x, y] = op === "-" && b > a ? [b, a] : [a, b];
  const answer = op === "+" ? x + y : op === "-" ? x - y : x * y;
  return { a: x, b: y, op, answer };
}

const ROUNDS = 10;

export function MathGame({
  profile,
  update,
}: {
  profile: PlayerProfile;
  update: (p: PlayerProfile) => void;
}) {
  const { t } = useUiLang();
  const [round, setRound] = useState(0);
  const [sum, setSum] = useState<Sum | null>(null);
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const newGame = useCallback(() => {
    setRound(0); setSum(makeSum(0)); setValue(""); setScore(0);
    setFeedback(null); setDone(false);
  }, []);

  useEffect(() => { newGame(); }, [newGame]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sum || done) return;
    const correct = Number(value) === sum.answer;
    setFeedback(correct ? "correct" : "wrong");
    const nextScore = correct ? score + 1 : score;
    setScore(nextScore);

    window.setTimeout(() => {
      setFeedback(null);
      setValue("");
      if (round + 1 >= ROUNDS) {
        setDone(true);
        update(awardPoints(profile, "maths", nextScore, nextScore));
      } else {
        setRound((r) => r + 1);
        setSum(makeSum(round + 1));
      }
    }, 650);
  }

  if (!sum) return <div aria-busy="true" />;

  return (
    <GameShell titleKey="game.maths" profile={profile} score={score} onNewGame={newGame}>
      {done ? (
        <p className="game-done" role="status">
          {t("game.finished")} — {t("game.pointsEarned", undefined, { points: score })}
        </p>
      ) : (
        <form className="math-game" onSubmit={submit}>
          <p className="math-progress">{round + 1} / {ROUNDS}</p>
          <p className="math-sum" aria-live="polite">
            {sum.a} {sum.op} {sum.b} = ?
          </p>
          <label className="sr-only" htmlFor="math-answer">{t("game.check")}</label>
          <input
            id="math-answer"
            className="math-input"
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            required
            autoFocus
          />
          <button type="submit" className="btn">{t("game.check")}</button>
          {feedback ? (
            <p className="math-feedback" data-state={feedback} role="status">
              {feedback === "correct" ? t("game.correct") : `${t("game.wrong")} — ${sum.answer}`}
            </p>
          ) : null}
        </form>
      )}
    </GameShell>
  );
}
