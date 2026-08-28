"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  EMPTY_PROFILE, loadProfile, sanitizeNickname, saveProfile, type PlayerProfile,
} from "@/lib/platform/player";
import { useUiLang } from "@/components/i18n/LanguageProvider";

/**
 * Asks for a nickname once, then gets out of the way.
 *
 * Nickname only — no email, no phone, no age, no school. Nothing is sent to a
 * server; the profile lives in this browser's localStorage.
 */
export function PlayerGate({
  children,
}: {
  children: (profile: PlayerProfile, update: (p: PlayerProfile) => void) => ReactNode;
}) {
  const { t } = useUiLang();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => setProfile(loadProfile()), []);

  function update(next: PlayerProfile) {
    setProfile(next);
    saveProfile(next);
  }

  if (!profile) return <div className="player-gate" aria-busy="true" />;

  if (!profile.nickname) {
    return (
      <div className="player-gate">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const nickname = sanitizeNickname(draft);
            if (!nickname) return;
            update({ ...EMPTY_PROFILE, nickname });
          }}
        >
          <label htmlFor="player-nickname">{t("player.enterName")}</label>
          <input
            id="player-nickname"
            name="nickname"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={16}
            autoComplete="off"
            required
          />
          <p className="muted">{t("player.nameHint")}</p>
          <button type="submit" className="btn" disabled={!sanitizeNickname(draft)}>
            {t("player.start")}
          </button>
        </form>
      </div>
    );
  }

  return <>{children(profile, update)}</>;
}
