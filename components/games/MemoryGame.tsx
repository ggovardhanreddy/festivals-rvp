"use client";

import { useCallback, useEffect, useState } from "react";
import { awardPoints, type PlayerProfile } from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { GameShell } from "./GameShell";

const SYMBOLS = ["🌳", "🌾", "🛕", "🪔", "🐄", "☀️", "🌙", "🌻"];

type Card = { id: number; symbol: string; flipped: boolean; matched: boolean };

function deal(): Card[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  for (let i = pairs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!];
  }
  return pairs.map((symbol, id) => ({ id, symbol, flipped: false, matched: false }));
}

export function MemoryGame({
  profile,
  update,
}: {
  profile: PlayerProfile;
  update: (p: PlayerProfile) => void;
}) {
  const { t } = useUiLang();
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const newGame = useCallback(() => {
    setCards(deal());
    setOpen([]);
    setMoves(0);
    setDone(false);
  }, []);

  useEffect(() => { newGame(); }, [newGame]);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open as [number, number];
    const timer = window.setTimeout(() => {
      setCards((prev) => {
        const match = prev[a]!.symbol === prev[b]!.symbol;
        const next = prev.map((c, i) =>
          i === a || i === b
            ? { ...c, flipped: match, matched: match || c.matched }
            : c,
        );
        if (next.every((c) => c.matched)) {
          setDone(true);
          update(awardPoints(profile, "memory", 10, Math.max(0, 60 - moves)));
        }
        return next;
      });
      setOpen([]);
    }, 700);
    return () => window.clearTimeout(timer);
    // profile/update intentionally omitted: award must fire once per completion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function flip(i: number) {
    if (done || open.length === 2) return;
    const card = cards[i];
    if (!card || card.matched || card.flipped) return;
    setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setOpen((prev) => [...prev, i]);
    if (open.length === 1) setMoves((m) => m + 1);
  }

  return (
    <GameShell titleKey="game.memory" profile={profile} score={moves} onNewGame={newGame}>
      <ul className="memory-grid">
        {cards.map((card, i) => (
          <li key={card.id}>
            <button
              type="button"
              className="memory-card"
              data-face={card.flipped || card.matched ? "up" : "down"}
              onClick={() => flip(i)}
              aria-label={card.flipped || card.matched ? card.symbol : t("game.memory")}
              disabled={card.matched}
            >
              <span aria-hidden>{card.flipped || card.matched ? card.symbol : "?"}</span>
            </button>
          </li>
        ))}
      </ul>
      {done ? (
        <p className="game-done" role="status">
          {t("game.finished")} — {t("game.pointsEarned", undefined, { points: 10 })}
        </p>
      ) : null}
    </GameShell>
  );
}
