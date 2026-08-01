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
  position: [8, 18, 20],
  target: [0, 0.2, -1],
};

/** Cinematic landing fly-through — strong forward push into the village. */
export const LANDING_FLY_PATH: { t: number; pose: CameraPose }[] = [
  { t: 0, pose: { position: [0, 38, 58], target: [0, 0.2, -2] } },
  { t: 0.22, pose: { position: [1, 22, 36], target: [0, 0.5, 8] } },
  { t: 0.45, pose: { position: [4, 12, 20], target: [-0.4, 0.6, 3] } },
  { t: 0.68, pose: { position: [2.2, 7.5, 10], target: [-1.2, 0.75, 0] } },
  { t: 0.86, pose: { position: [0.6, 4.8, 5.2], target: [-1.2, 0.85, -0.4] } },
  // Deep finish — close over Ramalayam / village heart
  { t: 1, pose: { position: [-0.4, 3.2, 2.4], target: [-1.2, 0.7, -0.6] } },
];

export function sampleLandingFlyPose(progress: number): CameraPose {
  const p = Math.min(1, Math.max(0, progress));
  const path = LANDING_FLY_PATH;
  let i = 0;
  while (i < path.length - 1 && path[i + 1]!.t < p) i += 1;
  const a = path[i]!;
  const b = path[Math.min(i + 1, path.length - 1)]!;
  const span = Math.max(0.0001, b.t - a.t);
  const u = (p - a.t) / span;
  const ease = u * u * (3 - 2 * u);
  const lerp = (x: number, y: number) => x + (y - x) * ease;
  return {
    position: [
      lerp(a.pose.position[0], b.pose.position[0]),
      lerp(a.pose.position[1], b.pose.position[1]),
      lerp(a.pose.position[2], b.pose.position[2]),
    ],
    target: [
      lerp(a.pose.target[0], b.pose.target[0]),
      lerp(a.pose.target[1], b.pose.target[1]),
      lerp(a.pose.target[2], b.pose.target[2]),
    ],
  };
}

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
    label: "Ramalayam",
    blurb: "రామాలయం — lamp light and prayer at the heart of Kondreddigaripalli.",
    href: "/vinayaka-chavithi/",
    position: [-1.2, 0.9, -0.2],
    camera: { position: [2, 8, 10], target: [-1.2, 0.6, -0.2] },
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
