import { VILLAGE_COORDS } from "./site";

/** Approximate local sunrise/sunset hours for the village latitude. */
export function sunHours(
  date = new Date(),
  lat = VILLAGE_COORDS.lat,
): { sunrise: number; sunset: number } {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const day = Math.floor((now - start) / 86400000);
  const decl = 23.44 * Math.sin((2 * Math.PI * (day - 81)) / 365);
  const latRad = (lat * Math.PI) / 180;
  const declRad = (decl * Math.PI) / 180;
  const cosHa = -Math.tan(latRad) * Math.tan(declRad);
  const clamped = Math.min(1, Math.max(-1, cosHa));
  const hourAngle = (Math.acos(clamped) * 180) / Math.PI;
  const daylight = (2 * hourAngle) / 15;
  const noon = 12.25; // rough local solar noon offset for IST belt
  return { sunrise: noon - daylight / 2, sunset: noon + daylight / 2 };
}

export function isDaytimeAtVillage(date = new Date()): boolean {
  const { sunrise, sunset } = sunHours(date);
  const hour = date.getHours() + date.getMinutes() / 60;
  return hour >= sunrise && hour < sunset;
}
