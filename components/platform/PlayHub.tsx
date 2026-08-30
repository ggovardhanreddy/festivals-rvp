"use client";

import Link from "next/link";
import { GAMES } from "@/lib/platform/games";
import { loadProfile, resetProfile, BADGES, type PlayerProfile } from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "./SectionIcon";
import { useEffect, useState } from "react";

export function PlayHub() {
  const { t, lang } = useUiLang();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  useEffect(() => setProfile(loadProfile()), []);

  return (
    <main className="page play-hub">
      <div className="section">
        <p className="eyebrow">{t("home.playAndLearn")}</p>
        <h1>{t("nav.play")}</h1>
        <p className="lede">{t("player.nameHint")}</p>
      </div>

      {profile?.nickname ? (
        <section className="section player-card" aria-label={t("player.points")}>
          <p className="player-name">{profile.nickname}</p>
          <dl className="player-stats">
            <div><dt>{t("player.points")}</dt><dd>{profile.points}</dd></div>
            <div><dt>{t("player.level")}</dt><dd>{profile.level}</dd></div>
            <div><dt>{t("player.streak")}</dt><dd>{profile.streak}</dd></div>
            <div><dt>{t("player.badges")}</dt><dd>{profile.badges.length}</dd></div>
          </dl>
          {profile.badges.length ? (
            <ul className="player-badges">
              {BADGES.filter((b) => profile.badges.includes(b.id)).map((b) => (
                <li key={b.id}>{t(b.labelKey)}</li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            className="btn ghost"
            onClick={() => { resetProfile(); setProfile(loadProfile()); }}
          >
            {t("player.reset")}
          </button>
        </section>
      ) : null}

      <section className="section">
        <Link className="daily-card" href={navHref("/play/daily/", lang)}>
          <span className="daily-card-icon" aria-hidden>
            <SectionIcon name="question" size={26} />
          </span>
          <span className="daily-card-text">
            <span className="eyebrow">{t("game.daily")}</span>
            <strong>{t("game.daily.desc")}</strong>
          </span>
          <span className="daily-card-cta">{t("game.play")}</span>
        </Link>
      </section>

      <section className="section">
        <h2 className="play-grid-title">{t("nav.play")}</h2>
        <ul className="game-grid">
          {GAMES.map((g) => (
            <li key={g.id}>
              <Link className="game-card" href={navHref(`/play/${g.slug}/`, lang)}>
                <span className="game-card-icon" aria-hidden>
                  <SectionIcon name={g.icon} size={28} />
                </span>
                <span className="game-card-title">{t(g.labelKey)}</span>
                <span className="game-card-desc">{t(g.descriptionKey)}</span>
                <span className="game-card-meta">
                  <span className="game-card-diff">{t(`game.difficulty.${g.difficulty}`)}</span>
                  <span className="game-card-points">+{g.points}</span>
                </span>
                <span className="game-card-cta">{t("game.play")}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="muted section">{t("player.progressLocal")}</p>
    </main>
  );
}
