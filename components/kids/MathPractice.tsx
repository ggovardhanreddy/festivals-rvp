"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import {
  makeProblemSet,
  opSymbol,
  type MathLevel,
  type MathOp,
} from "@/lib/kids/math";
import { awardPoints, loadProfile, saveProfile } from "@/lib/platform/player";

const OPS: MathOp[] = ["add", "sub", "mul", "div"];
const LEVELS: MathLevel[] = [1, 2, 3];
const SET_SIZE = 10;

/**
 * Arithmetic practice.
 *
 * No timer, no losing streak and no wrong-answer penalty: a wrong choice
 * shows the right answer and moves on. Progress is the only reward, and it
 * lives in localStorage on this device.
 */
export function MathPractice() {
  const { t } = useUiLang();
  const [op, setOp] = useState<MathOp>("add");
  const [level, setLevel] = useState<MathLevel>(1);
  const [seed, setSeed] = useState(1);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  useEffect(() => setSeed(Date.now()), []);

  const problems = useMemo(
    () => makeProblemSet(op, level, SET_SIZE, seed),
    [op, level, seed],
  );
  const problem = problems[index];
  const finished = index >= problems.length;

  const restart = useCallback(() => {
    setSeed(Date.now());
    setIndex(0);
    setPicked(null);
    setCorrect(0);
  }, []);

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
  }, [op, level]);

  const choose = (value: number) => {
    if (picked !== null || !problem) return;
    setPicked(value);
    if (value === problem.answer) setCorrect((n) => n + 1);
    window.setTimeout(() => {
      setPicked(null);
      setIndex((n) => n + 1);
    }, 700);
  };

  useEffect(() => {
    if (!finished || correct <= 0) return;
    saveProfile(awardPoints(loadProfile(), "kids-math", correct, correct));
  }, [finished, correct]);

  return (
    <div className="mathpractice">
      <div className="mathpractice-controls">
        <div className="mathpractice-chips" role="group" aria-label={t("kids.math.operation")}>
          {OPS.map((o) => (
            <button
              key={o}
              type="button"
              className={`filter-chip${op === o ? " is-active" : ""}`}
              aria-pressed={op === o}
              onClick={() => setOp(o)}
            >
              <span aria-hidden>{opSymbol(o)}</span>
              <span className="sr-only">{t(`kids.math.${o}`)}</span>
            </button>
          ))}
        </div>
        <div className="mathpractice-chips" role="group" aria-label={t("kids.math.level")}>
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`filter-chip${level === l ? " is-active" : ""}`}
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
            >
              {t("kids.math.levelN", undefined, { n: l })}
            </button>
          ))}
        </div>
      </div>

      {finished ? (
        <div className="mathpractice-done" role="status">
          <p className="mathpractice-score">
            {t("kids.math.score", undefined, { correct, total: problems.length })}
          </p>
          <button type="button" className="btn" onClick={restart}>
            {t("kids.math.again")}
          </button>
        </div>
      ) : problem ? (
        <div className="mathpractice-card">
          <p className="mathpractice-progress muted">
            {index + 1} / {problems.length}
          </p>
          <p className="mathpractice-question">
            <span>{problem.a}</span>
            <span aria-hidden>{opSymbol(problem.op)}</span>
            <span className="sr-only">{t(`kids.math.${problem.op}`)}</span>
            <span>{problem.b}</span>
            <span aria-hidden>=</span>
            <span className="mathpractice-blank">?</span>
          </p>
          <ul className="mathpractice-options">
            {problem.options.map((value) => {
              const state =
                picked === null
                  ? ""
                  : value === problem.answer
                    ? " is-right"
                    : value === picked
                      ? " is-wrong"
                      : "";
              return (
                <li key={value}>
                  <button
                    type="button"
                    className={`mathpractice-option${state}`}
                    onClick={() => choose(value)}
                    disabled={picked !== null}
                  >
                    {value}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
