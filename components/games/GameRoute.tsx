"use client";

import { PlayerGate } from "./PlayerGate";
import { SudokuGame } from "./SudokuGame";
import { MemoryGame } from "./MemoryGame";
import { MathGame } from "./MathGame";
import { WordGame } from "./WordGame";
import { QuizGame } from "./QuizGame";

export function GameRoute({ slug }: { slug: string }) {
  return (
    <PlayerGate>
      {(profile, update) => {
        switch (slug) {
          case "sudoku": return <SudokuGame profile={profile} update={update} />;
          case "memory": return <MemoryGame profile={profile} update={update} />;
          case "maths":  return <MathGame profile={profile} update={update} />;
          case "word":   return <WordGame profile={profile} update={update} />;
          case "quiz":   return <QuizGame profile={profile} update={update} />;
          case "daily":  return <QuizGame profile={profile} update={update} daily />;
          default:       return null;
        }
      }}
    </PlayerGate>
  );
}
