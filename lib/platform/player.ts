"use client";

/**
 * Anonymous player profile.
 *
 * Nickname only, stored in localStorage on this device. No account, no server,
 * nothing that could identify a child. Never collects email, phone, age,
 * school or location, and never leaves the browser.
 */
export type PlayerProfile = {
  nickname: string;
  points: number;
  level: number;
  badges: string[];
  streak: number;
  lastPlayed: string | null;
  scores: Record<string, number>;
};

const KEY = "rvp-player";
const MAX_NICKNAME = 16;

export const EMPTY_PROFILE: PlayerProfile = {
  nickname: "",
  points: 0,
  level: 1,
  badges: [],
  streak: 0,
  lastPlayed: null,
  scores: {},
};

/** Strip anything that could carry personal data out of a nickname. */
export function sanitizeNickname(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NICKNAME);
}

export function levelFor(points: number): number {
  return Math.max(1, Math.floor(points / 100) + 1);
}

export function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    return {
      ...EMPTY_PROFILE,
      ...parsed,
      nickname: sanitizeNickname(parsed.nickname ?? ""),
      badges: Array.isArray(parsed.badges) ? parsed.badges : [],
      scores: parsed.scores && typeof parsed.scores === "object" ? parsed.scores : {},
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* private mode — play still works, progress just is not kept */
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Award points for a finished game and update streak, level and best score. */
export function awardPoints(
  profile: PlayerProfile,
  gameId: string,
  points: number,
  score?: number,
): PlayerProfile {
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak =
    profile.lastPlayed === today
      ? profile.streak
      : profile.lastPlayed === yesterday
        ? profile.streak + 1
        : 1;

  const total = profile.points + Math.max(0, points);
  const next: PlayerProfile = {
    ...profile,
    points: total,
    level: levelFor(total),
    streak,
    lastPlayed: today,
    scores: {
      ...profile.scores,
      [gameId]: Math.max(profile.scores[gameId] ?? 0, score ?? 0),
    },
  };
  return { ...next, badges: earnedBadges(next) };
}

export const BADGES: { id: string; labelKey: string; test: (p: PlayerProfile) => boolean }[] = [
  { id: "first-game",     labelKey: "badge.firstGame",     test: (p) => Object.keys(p.scores).length >= 1 },
  { id: "all-games",      labelKey: "badge.allGames",      test: (p) => Object.keys(p.scores).length >= 5 },
  { id: "hundred-points", labelKey: "badge.hundredPoints", test: (p) => p.points >= 100 },
  { id: "level-five",     labelKey: "badge.levelFive",     test: (p) => p.level >= 5 },
  { id: "week-streak",    labelKey: "badge.weekStreak",    test: (p) => p.streak >= 7 },
];

export function earnedBadges(profile: PlayerProfile): string[] {
  return BADGES.filter((b) => b.test(profile)).map((b) => b.id);
}

export function resetProfile(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
