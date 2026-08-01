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

export function themeSourcesAbsolute(theme: MusicTheme) {
  return theme.sources.map((s) => ({
    ...s,
    src: withBase(s.src),
  }));
}
