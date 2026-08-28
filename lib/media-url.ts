/**
 * Resolve public media paths to Cloudflare R2 (or local /public) URLs.
 *
 * When NEXT_PUBLIC_R2_PUBLIC_URL is set, gallery/images/videos/thumbs/audio
 * are served from R2. Private Fun Fest / documents use signed /api/media URLs.
 */

import { isPrivateR2Key } from "./r2-storage";

/** Public R2 CDN — env preferred; baked-in fallback so member photos never 404 after strip-local. */
const R2_PUBLIC_FALLBACK =
  "https://pub-f2609804d6a040368903177488b01d2d.r2.dev";

const R2_PUBLIC = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_BASE ||
  R2_PUBLIC_FALLBACK
).replace(/\/$/, "");

/** Path prefixes migrated to R2. */
const R2_PREFIXES = [
  "/images/",
  "/videos/",
  "/thumbs/",
  "/audio/",
  "/docs/",
  "/brand/",
  "/festivals/",
  "/members/",
  // /logo/ stays on Pages so brand updates ship with each deploy
] as const;

export function r2Enabled(): boolean {
  return Boolean(R2_PUBLIC);
}

export function r2PublicBase(): string {
  return R2_PUBLIC;
}

/** Map a site-relative path like /images/2024/... to an R2 object key. */
export function pathToR2Key(path: string): string {
  const withoutQuery = path.split("?")[0] || path;
  const clean = withoutQuery.startsWith("/")
    ? withoutQuery.slice(1)
    : withoutQuery;

  // Fun Fest — keep private under funfest/
  if (clean.includes("/fun-trips/") || clean.startsWith("funfest/")) {
    if (clean.startsWith("funfest/")) return clean;
    if (clean.startsWith("videos/")) {
      return `funfest/${clean.slice("videos/".length)}`;
    }
    if (clean.startsWith("images/")) {
      return `funfest/images/${clean.slice("images/".length)}`;
    }
    if (clean.startsWith("thumbs/")) {
      return `funfest/thumbs/${clean.slice("thumbs/".length)}`;
    }
    return `funfest/${clean}`;
  }

  if (clean.startsWith("images/")) return `gallery/${clean.slice("images/".length)}`;
  if (clean.startsWith("thumbs/")) {
    return `gallery/thumbs/${clean.slice("thumbs/".length)}`;
  }
  if (clean.startsWith("videos/")) return `videos/${clean.slice("videos/".length)}`;
  if (clean.startsWith("audio/")) return `audio/${clean.slice("audio/".length)}`;
  if (clean.startsWith("docs/")) {
    return `documents/${clean.slice("docs/".length)}`;
  }
  if (clean.startsWith("brand/")) return `hero/${clean.slice("brand/".length)}`;
  if (clean.startsWith("festivals/")) {
    return `festivals/${clean.slice("festivals/".length)}`;
  }
  if (clean.startsWith("logo/")) return `logos/${clean.slice("logo/".length)}`;
  if (clean.startsWith("members/")) {
    return `members/${clean.slice("members/".length)}`;
  }
  return clean;
}

/** Reverse: R2 key → site-relative path used in albums.json today. */
export function r2KeyToSitePath(key: string): string {
  if (key.startsWith("funfest/thumbs/")) {
    return `/thumbs/${key.slice("funfest/thumbs/".length)}`;
  }
  if (key.startsWith("funfest/images/")) {
    return `/images/${key.slice("funfest/images/".length)}`;
  }
  if (key.startsWith("funfest/")) {
    return `/videos/${key.slice("funfest/".length)}`;
  }
  if (key.startsWith("gallery/thumbs/")) {
    return `/thumbs/${key.slice("gallery/thumbs/".length)}`;
  }
  if (key.startsWith("gallery/")) return `/images/${key.slice("gallery/".length)}`;
  if (key.startsWith("videos/")) return `/videos/${key.slice("videos/".length)}`;
  if (key.startsWith("audio/")) return `/audio/${key.slice("audio/".length)}`;
  if (key.startsWith("documents/")) {
    return `/docs/${key.slice("documents/".length)}`;
  }
  if (key.startsWith("hero/")) return `/brand/${key.slice("hero/".length)}`;
  if (key.startsWith("festivals/")) {
    return `/festivals/${key.slice("festivals/".length)}`;
  }
  if (key.startsWith("logos/")) return `/logo/${key.slice("logos/".length)}`;
  if (key.startsWith("members/")) {
    return `/members/${key.slice("members/".length)}`;
  }
  return `/${key}`;
}

/** Fun Fest / private media — go through the signed media API when configured. */
export function isPrivateMediaPath(path: string): boolean {
  if (!path) return false;
  if (/^https?:\/\//i.test(path)) {
    // Absolute public R2 URLs are never private
    return false;
  }
  return (
    path.includes("/fun-trips/") ||
    path.includes("/funfest/") ||
    path.startsWith("funfest/") ||
    path.startsWith("/docs/") ||
    path.includes("documents/") ||
    isPrivateR2Key(path)
  );
}

export function shouldUseR2(path: string): boolean {
  if (!R2_PUBLIC || !path) return false;
  if (/^https?:\/\//i.test(path)) return false;
  const bare = path.split("?")[0] || path;
  // Private Fun Fest / documents must never hit the public R2 domain
  if (isPrivateMediaPath(bare)) return false;
  return R2_PREFIXES.some((prefix) => bare.startsWith(prefix));
}

/**
 * Absolute or site-relative URL for a media asset.
 * Absolute http(s) URLs are returned unchanged.
 */
export function resolveMediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (shouldUseR2(path)) {
    const key = pathToR2Key(path);
    const query = path.includes("?")
      ? `?${path.split("?").slice(1).join("?")}`
      : "";
    return `${R2_PUBLIC}/${key}${query}`;
  }
  return path;
}
