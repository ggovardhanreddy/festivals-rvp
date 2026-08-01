export type VillageHotspotId =
  "entrance" | "temple" | "school" | "ground" | "lake" | "road" | "festival";

export type LightingMode = "morning" | "afternoon" | "evening" | "night" | "festival";

export type WeatherMode = "sunny" | "cloudy" | "fog" | "night";

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
};

export const INTRO_CAMERA: CameraPose = {
  position: [0, 28, 42],
  target: [0, 0, 0],
};

export const OVERVIEW_CAMERA: CameraPose = {
  position: [14, 16, 22],
  target: [0, 0.5, 0],
};

export const VILLAGE_HOTSPOTS: {
  id: VillageHotspotId;
  label: string;
  blurb: string;
  href: string;
  position: [number, number, number];
  camera: CameraPose;
}[] = [
  {
    id: "entrance",
    label: "Village Entrance",
    blurb: "Gates open. Dust settles. Home begins.",
    href: "/fun-trips/",
    position: [-10, 0.4, 10],
    camera: { position: [-12, 6, 14], target: [-10, 1, 8] },
  },
  {
    id: "temple",
    label: "Temple",
    blurb: "Bell tones and lamp light at the heart of belonging.",
    href: "/vinayaka-chavithi/",
    position: [-6, 0.4, -4],
    camera: { position: [-8, 5, 2], target: [-6, 2, -4] },
  },
  {
    id: "school",
    label: "School",
    blurb: "Chalk dust and the first lessons of home.",
    href: "/rvp-birthdays/",
    position: [4, 0.4, -2],
    camera: { position: [8, 5, 4], target: [4, 1.5, -2] },
  },
  {
    id: "ground",
    label: "Ground",
    blurb: "Evenings of play under a wide village sky.",
    href: "/fun-trips/",
    position: [0, 0.2, 4],
    camera: { position: [4, 7, 10], target: [0, 0.5, 4] },
  },
  {
    id: "lake",
    label: "Lake",
    blurb: "Still water holding the morning sky.",
    href: "/timeline/",
    position: [10, 0.05, -6],
    camera: { position: [12, 5, 0], target: [10, 0.2, -6] },
  },
  {
    id: "road",
    label: "Main Road",
    blurb: "The ribbon tying farms, homes, and festivals.",
    href: "/timeline/",
    position: [0, 0.15, 8],
    camera: { position: [6, 6, 14], target: [0, 0.3, 6] },
  },
  {
    id: "festival",
    label: "Festival Area",
    blurb: "Rangoli, sweets, and Sankranthi light.",
    href: "/sankranthi/",
    position: [5, 0.3, 6],
    camera: { position: [8, 6, 12], target: [5, 1, 6] },
  },
];

export function detectLowPowerDevice() {
  if (typeof window === "undefined") return true;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  return reduced || mobile || cores <= 4 || memory <= 4;
}

export function lightingForHour(hour = new Date().getHours()): LightingMode {
  if (hour >= 5 && hour < 10) return "morning";
  if (hour >= 10 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 19) return "evening";
  return "night";
}
