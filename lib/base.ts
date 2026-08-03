import { resolveMediaUrl, shouldUseR2 } from "./media-url";

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Prefix site-relative paths with basePath, and rewrite media paths to
 * Cloudflare R2 when NEXT_PUBLIC_R2_PUBLIC_URL is configured.
 */
export function withBase(path: string): string {
  if (!path) return basePath || "/";
  if (/^https?:\/\//i.test(path)) return path;

  // Serve gallery/media from R2 when enabled
  if (shouldUseR2(path)) {
    return resolveMediaUrl(path);
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
