"use client";

import { useCallback, useEffect, useState } from "react";
import { dailyQuestions, type Question } from "@/lib/platform/quizbank";
import { awardPoints, type PlayerProfile } from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { GameShell } from "./GameShell";

export function QuizGame({
  profile,
  update,
  daily = false,
}: {
  profile: PlayerProfile;
  update: (p: PlayerProfile) => void;
  daily?: boolean;
}) {
  const { t, lang } = useUiLang();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const newGame = useCallback(() => {
    setQuestions(dailyQuestions(10));
    setIndex(0); setPicked(null); setScore(0); setDone(false);
  }, []);

  useEffect(() => { newGame(); }, [newGame]);

  const q = questions[index];
  if (!q) return <div aria-busy="true" />;

  function choose(i: number) {
    if (picked !== null || done) return;
    setPicked(i);
    const correct = i === q!.correct;
    const next = correct ? score + 1 : score;
    setScore(next);
    window.setTimeout(() => {
      setPicked(null);
      if (index + 1 >= questions.length) {
        setDone(true);
        update(awardPoints(profile, daily ? "daily" : "quiz", next, next));
      } else {
        setIndex((v) => v + 1);
      }
    }, 900);
  }

  const prompt = (lang === "te" && q.prompt.te) || q.prompt.en;

  return (
    <GameShell titleKey="game.quiz" profile={profile} score={score} onNewGame={newGame}>
      {done ? (
        <p className="game-done" role="status">
          {t("game.finished")} — {score} / {questions.length} · {t("game.pointsEarned", undefined, { points: score })}
        </p>
      ) : (
        <div className="quiz-game">
          <p className="math-progress">{index + 1} / {questions.length}</p>
          <p className="quiz-prompt" lang={lang === "te" && q.prompt.te ? "te" : "en"}>{prompt}</p>
          <ul className="quiz-options">
            {q.options.map((opt, i) => (
              <li key={opt}>
                <button
                  type="button"
                  className="quiz-option"
                  data-state={
                    picked === null ? undefined : i === q.correct ? "correct" : picked === i ? "wrong" : undefined
                  }
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GameShell>
  );
}
