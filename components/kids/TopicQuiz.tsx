"use client";

import { useMemo, useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { QUESTIONS, type Question } from "@/lib/platform/quizbank";
import { awardPoints, loadProfile, saveProfile } from "@/lib/platform/player";

/**
 * A quiz over one topic of the shared question bank.
 *
 * The bank is general knowledge and school curriculum only — no claim about
 * the village appears in it, because a factual claim about a real place needs
 * a cited source and none of these have one.
 */
export function TopicQuiz({ topic }: { topic: Question["topic"] }) {
  const { t, lang } = useUiLang();
  const questions = useMemo(() => QUESTIONS.filter((q) => q.topic === topic), [topic]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];

  const choose = (choice: number) => {
    if (picked !== null || !question) return;
    setPicked(choice);
    const right = choice === question.correct;
    if (right) setCorrect((n) => n + 1);
    window.setTimeout(() => {
      setPicked(null);
      if (index + 1 >= questions.length) {
        const total = right ? correct + 1 : correct;
        saveProfile(awardPoints(loadProfile(), `kids-${topic}`, total * 2, total));
        setDone(true);
      } else {
        setIndex((n) => n + 1);
      }
    }, 800);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  };

  if (!questions.length) {
    return <p className="muted">{t("empty.generic")}</p>;
  }

  if (done) {
    return (
      <div className="mathpractice-done" role="status">
        <p className="mathpractice-score">
          {t("kids.math.score", undefined, { correct, total: questions.length })}
        </p>
        <button type="button" className="btn" onClick={restart}>
          {t("kids.math.again")}
        </button>
      </div>
    );
  }

  if (!question) return null;
  const prompt = (lang === "te" && question.prompt.te) || question.prompt.en;

  return (
    <div className="topicquiz">
      <p className="mathpractice-progress muted">
        {index + 1} / {questions.length}
      </p>
      <p className="topicquiz-prompt">{prompt}</p>
      <ul className="topicquiz-options">
        {question.options.map((option, i) => {
          const state =
            picked === null
              ? ""
              : i === question.correct
                ? " is-right"
                : i === picked
                  ? " is-wrong"
                  : "";
          return (
            <li key={option}>
              <button
                type="button"
                className={`topicquiz-option${state}`}
                onClick={() => choose(i)}
                disabled={picked !== null}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
