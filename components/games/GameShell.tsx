"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withLocale } from "@/lib/i18n/config";
import type { PlayerProfile } from "@/lib/platform/player";

export function GameShell({
  titleKey,
  profile,
  score,
  onNewGame,
  children,
}: {
  titleKey: string;
  profile: PlayerProfile;
  score?: number;
  onNewGame?: () => void;
  children: ReactNode;
}) {
  const { t, lang } = useUiLang();
  return (
    <main className="page game-page">
      <div className="game-head">
        <div>
          <Link className="game-back" href={withLocale("/play/", lang)}>
            &larr; {t("nav.play")}
          </Link>
          <h1>{t(titleKey)}</h1>
        </div>
        <dl className="game-stats">
          <div><dt>{t("player.points")}</dt><dd>{profile.points}</dd></div>
          <div><dt>{t("player.level")}</dt><dd>{profile.level}</dd></div>
          {typeof score === "number" ? (
            <div><dt>{t("game.score")}</dt><dd>{score}</dd></div>
          ) : null}
        </dl>
      </div>
      {onNewGame ? (
        <button type="button" className="btn ghost game-new" onClick={onNewGame}>
          {t("game.newGame")}
        </button>
      ) : null}
      <div className="game-body">{children}</div>
      <p className="muted game-note">{t("player.progressLocal")}</p>
    </main>
  );
}
