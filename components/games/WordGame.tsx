"use client";

import { useCallback, useEffect, useState } from "react";
import { WORD_LIST } from "@/lib/platform/quizbank";
import { awardPoints, type PlayerProfile } from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { GameShell } from "./GameShell";

function scramble(word: string): string {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j]!, letters[i]!];
  }
  const out = letters.join("");
  return out === word ? scramble(word) : out;
}

const ROUNDS = 5;

export function WordGame({
  profile,
  update,
}: {
  profile: PlayerProfile;
  update: (p: PlayerProfile) => void;
}) {
  const { t } = useUiLang();
  const [round, setRound] = useState(0);
  const [word, setWord] = useState("");
  const [shown, setShown] = useState("");
  const [value, setValue] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const pick = useCallback(() => {
    const w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]!;
    setWord(w);
    setShown(scramble(w));
  }, []);

  const newGame = useCallback(() => {
    setRound(0); setScore(0); setValue(""); setFeedback(null); setDone(false); pick();
  }, [pick]);

  useEffect(() => { newGame(); }, [newGame]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (done) return;
    const correct = value.trim().toLowerCase() === word;
    setFeedback(correct ? "correct" : "wrong");
    const next = correct ? score + 1 : score;
    setScore(next);
    window.setTimeout(() => {
      setFeedback(null);
      setValue("");
      if (round + 1 >= ROUNDS) {
        setDone(true);
        update(awardPoints(profile, "word", next * 2, next));
      } else {
        setRound((r) => r + 1);
        pick();
      }
    }, 800);
  }

  return (
    <GameShell titleKey="game.word" profile={profile} score={score} onNewGame={newGame}>
      {done ? (
        <p className="game-done" role="status">
          {t("game.finished")} — {t("game.pointsEarned", undefined, { points: score * 2 })}
        </p>
      ) : (
        <form className="word-game" onSubmit={submit}>
          <p className="math-progress">{round + 1} / {ROUNDS}</p>
          <p className="word-scramble" aria-live="polite">{shown.toUpperCase()}</p>
          <label className="sr-only" htmlFor="word-answer">{t("game.check")}</label>
          <input
            id="word-answer"
            className="math-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            autoFocus
          />
          <button type="submit" className="btn">{t("game.check")}</button>
          {feedback ? (
            <p className="math-feedback" data-state={feedback} role="status">
              {feedback === "correct" ? t("game.correct") : `${t("game.wrong")} — ${word}`}
            </p>
          ) : null}
        </form>
      )}
    </GameShell>
  );
}
