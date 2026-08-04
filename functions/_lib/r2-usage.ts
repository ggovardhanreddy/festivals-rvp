/**
 * Track R2 usage so uploads can spill over to free Google Drive at ~90%.
 * Default soft limit = 9 GiB (~90% of Cloudflare R2's 10 GB free storage).
 */

export type UsageEnv = {
  MEDIA?: R2Bucket;
  RATE_LIMIT?: KVNamespace;
  R2_SOFT_LIMIT_BYTES?: string;
};

const USAGE_KEY = "r2-usage-bytes";
const DEFAULT_SOFT_LIMIT = 9 * 1024 * 1024 * 1024; // 9 GiB

export function r2SoftLimitBytes(env: UsageEnv) {
  const raw = Number(env.R2_SOFT_LIMIT_BYTES || "");
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SOFT_LIMIT;
}

export async function getTrackedR2Usage(
  env: UsageEnv,
): Promise<{ bytes: number; limit: number; ratio: number }> {
  const limit = r2SoftLimitBytes(env);
  let bytes = 0;
  if (env.RATE_LIMIT) {
    const raw = await env.RATE_LIMIT.get(USAGE_KEY);
    if (raw) bytes = Number(raw) || 0;
  }
  return { bytes, limit, ratio: limit > 0 ? bytes / limit : 0 };
}

export async function shouldUseGoogleDriveOverflow(
  env: UsageEnv,
  threshold = 0.9,
): Promise<{ overflow: boolean; bytes: number; limit: number; ratio: number }> {
  const usage = await getTrackedR2Usage(env);
  return {
    overflow: usage.ratio >= threshold,
    ...usage,
  };
}

export async function addTrackedR2Usage(env: UsageEnv, delta: number) {
  if (!env.RATE_LIMIT || !Number.isFinite(delta) || delta === 0) return;
  const current = Number((await env.RATE_LIMIT.get(USAGE_KEY)) || "0") || 0;
  const next = Math.max(0, current + delta);
  await env.RATE_LIMIT.put(USAGE_KEY, String(next));
}

/** Expensive full recount — call rarely (admin reindex / usage route). */
export async function recountR2Usage(env: UsageEnv): Promise<number> {
  if (!env.MEDIA) return 0;
  let bytes = 0;
  let cursor: string | undefined;
  do {
    const page = await env.MEDIA.list({ cursor, limit: 1000 });
    for (const obj of page.objects) {
      bytes += obj.size || 0;
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  if (env.RATE_LIMIT) {
    await env.RATE_LIMIT.put(USAGE_KEY, String(bytes));
  }
  return bytes;
}
