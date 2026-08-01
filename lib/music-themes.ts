/**
 * Background music themes — add files under public/audio/ and register here.
 */
import { withBase } from "./base";

export type MusicThemeId =
  | "krishna-flute"
  | "village-theme"
  | "village-morning"
  | "festival-night"
  | "sankranthi"
  | "vinayaka"
  | "calm-ambient";

export type MusicTheme = {
  id: MusicThemeId;
  title: string;
  description: string;
  sources: { src: string; type: string }[];
  loopGapless: boolean;
};

function sourcesFor(slug: string) {
  return [
    { src: `/audio/${slug}.ogg`, type: "audio/ogg; codecs=opus" },
    { src: `/audio/${slug}.mp3`, type: "audio/mpeg" },
  ];
}

export const MUSIC_THEMES: MusicTheme[] = [
  {
    id: "krishna-flute",
    title: "Krishna Flute",
    description: "Peaceful Hindu flute ambience for the village journey.",
    sources: sourcesFor("krishna-flute"),
    loopGapless: true,
  },
  {
    id: "village-theme",
    title: "Village Twilight",
    description: "Soft pad and wind ambience.",
    sources: sourcesFor("village-theme"),
    loopGapless: true,
  },
  {
    id: "village-morning",
    title: "Village Morning",
    description: "Light dawn ambience.",
    sources: sourcesFor("village-morning"),
    loopGapless: true,
  },
  {
    id: "festival-night",
    title: "Festival Night",
    description: "Warm evening ambience.",
    sources: sourcesFor("festival-night"),
    loopGapless: true,
  },
  {
    id: "sankranthi",
    title: "Sankranthi Celebration",
    description: "Soft festive warmth.",
    sources: sourcesFor("sankranthi"),
    loopGapless: true,
  },
  {
    id: "vinayaka",
    title: "Vinayaka Chavithi",
    description: "Devotional calm ambience.",
    sources: sourcesFor("vinayaka"),
    loopGapless: true,
  },
  {
    id: "calm-ambient",
    title: "Calm Ambient",
    description: "Minimal quiet pad.",
    sources: sourcesFor("calm-ambient"),
    loopGapless: true,
  },
];

export const DEFAULT_MUSIC_THEME: MusicThemeId = "krishna-flute";

export function getMusicTheme(id: MusicThemeId | string): MusicTheme {
  return MUSIC_THEMES.find((t) => t.id === id) ?? MUSIC_THEMES[0]!;
}

/** Pick a theme from the current route (festival pages get their own bed). */
export function themeForPathname(pathname: string): MusicThemeId {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path.includes("vinayaka")) return "vinayaka";
  if (path.includes("sankranthi")) return "sankranthi";
  if (path.includes("rvp-birthdays") || path.includes("birthday")) {
    return "festival-night";
  }
  if (path.includes("fun-trips") || path.includes("trips")) {
    return "village-morning";
  }
  if (path.includes("about") || path.includes("timeline") || path.includes("search")) {
    return "calm-ambient";
  }
  return DEFAULT_MUSIC_THEME;
}

export function themeSourcesAbsolute(theme: MusicTheme) {
  return theme.sources.map((s) => ({
    ...s,
    src: withBase(s.src),
  }));
}
