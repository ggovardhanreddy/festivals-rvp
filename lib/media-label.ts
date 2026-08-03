/**
 * Human-facing labels for CMS media titles.
 * Google Photos / export filenames often become UUID stems after titleCase.
 */

const UUID_TITLE =
  /^[0-9a-f]{8}(?:[-\s][0-9a-f]{4}){3}[-\s]?[0-9a-f]{12}\b/i;

export function isOpaqueMediaTitle(title: string | undefined | null): boolean {
  if (!title?.trim()) return true;
  return UUID_TITLE.test(title.trim());
}

export function mediaDisplayTitle(
  title: string | undefined | null,
  fallback = "Memory",
): string {
  if (!title?.trim() || isOpaqueMediaTitle(title)) return fallback;
  return title.trim();
}
