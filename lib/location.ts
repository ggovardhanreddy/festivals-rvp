import { VILLAGE_COORDS, VILLAGE_ALSO_KNOWN_AS, VILLAGE_NAME } from "./site";

export const LOCATION_PREF_KEY = "rvp-location-pref";
export const LOCATION_CACHE_KEY = "rvp-location-cache";

/** Preference remembered after the soft dialog / browser prompt. */
export type LocationPreference = "unknown" | "granted" | "denied" | "dismissed";

/** Privacy-minimized cached fix (coords rounded; no street-level precision). */
export type CachedLocation = {
  /** Rounded latitude (~1.1 km precision) */
  lat: number;
  /** Rounded longitude (~1.1 km precision) */
  lng: number;
  /** Great-circle distance to the village in km */
  distanceKm: number;
  /** Coarse relation label — never a street address */
  relation: "at-village" | "nearby" | "same-region" | "far";
  updatedAt: number;
};

export type LocationStatus =
  | "idle"
  | "prompting"
  | "requesting"
  | "ready"
  | "unsupported"
  | "error"
  | "timeout";

const NEARBY_KM = 25;
const REGION_KM = 150;
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Round to 2 decimal places (~1.1 km) — enough for city-scale, not precise tracking. */
export function roundCoord(n: number): number {
  return Math.round(n * 100) / 100;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function relationFromDistance(
  km: number,
): CachedLocation["relation"] {
  if (km <= 3) return "at-village";
  if (km <= NEARBY_KM) return "nearby";
  if (km <= REGION_KM) return "same-region";
  return "far";
}

export function buildCachedLocation(lat: number, lng: number): CachedLocation {
  const rLat = roundCoord(lat);
  const rLng = roundCoord(lng);
  const distanceKm =
    Math.round(
      haversineKm(rLat, rLng, VILLAGE_COORDS.lat, VILLAGE_COORDS.lng) * 10,
    ) / 10;
  return {
    lat: rLat,
    lng: rLng,
    distanceKm,
    relation: relationFromDistance(distanceKm),
    updatedAt: Date.now(),
  };
}

export function readPreference(): LocationPreference {
  if (typeof window === "undefined") return "unknown";
  try {
    const v = localStorage.getItem(LOCATION_PREF_KEY);
    if (v === "granted" || v === "denied" || v === "dismissed") return v;
  } catch {
    /* ignore */
  }
  return "unknown";
}

export function writePreference(pref: LocationPreference) {
  try {
    localStorage.setItem(LOCATION_PREF_KEY, pref);
    window.dispatchEvent(new CustomEvent("rvp:location-change"));
  } catch {
    /* ignore */
  }
}

export function readCache(): CachedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocation;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.updatedAt > CACHE_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(cache: CachedLocation) {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
    window.dispatchEvent(new CustomEvent("rvp:location-change"));
  } catch {
    /* ignore */
  }
}

export function clearLocationData() {
  try {
    localStorage.removeItem(LOCATION_CACHE_KEY);
    localStorage.setItem(LOCATION_PREF_KEY, "denied");
    window.dispatchEvent(new CustomEvent("rvp:location-change"));
  } catch {
    /* ignore */
  }
}

export function isGeolocationSupported(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

export function requestBrowserPosition(
  options?: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: 30 * 60 * 1000,
      ...options,
    });
  });
}

export function relationLabel(cache: CachedLocation): string {
  switch (cache.relation) {
    case "at-village":
      return `You're near ${VILLAGE_ALSO_KNOWN_AS}`;
    case "nearby":
      return `About ${cache.distanceKm} km from ${VILLAGE_ALSO_KNOWN_AS}`;
    case "same-region":
      return `Roughly ${Math.round(cache.distanceKm)} km from ${VILLAGE_NAME}`;
    default:
      return `Visiting from about ${Math.round(cache.distanceKm)} km away`;
  }
}
