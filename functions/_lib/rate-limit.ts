/**
 * Login rate limit — prefers Cloudflare KV (RATE_LIMIT), falls back to
 * in-isolate Map when the binding is unavailable.
 */

type Bucket = { fails: number; lockedUntil: number };

const memory = new Map<string, Bucket>();

const DEFAULT_MAX_FAILS = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

export type RateLimitStore = {
  RATE_LIMIT?: KVNamespace;
};

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function kvKey(key: string) {
  return `login-rl:${key}`;
}

async function readBucket(
  env: RateLimitStore | undefined,
  key: string,
): Promise<Bucket | null> {
  if (env?.RATE_LIMIT) {
    try {
      const raw = await env.RATE_LIMIT.get(kvKey(key), "json");
      if (raw && typeof raw === "object") return raw as Bucket;
    } catch {
      /* fall through */
    }
  }
  return memory.get(key) || null;
}

async function writeBucket(
  env: RateLimitStore | undefined,
  key: string,
  bucket: Bucket,
  ttlSec: number,
) {
  memory.set(key, bucket);
  if (env?.RATE_LIMIT) {
    try {
      await env.RATE_LIMIT.put(kvKey(key), JSON.stringify(bucket), {
        expirationTtl: Math.max(60, ttlSec),
      });
    } catch {
      /* memory still applies in this isolate */
    }
  }
}

async function deleteBucket(env: RateLimitStore | undefined, key: string) {
  memory.delete(key);
  if (env?.RATE_LIMIT) {
    try {
      await env.RATE_LIMIT.delete(kvKey(key));
    } catch {
      /* ignore */
    }
  }
}

export async function checkLoginRateLimit(
  key: string,
  env?: RateLimitStore,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const now = Date.now();
  const entry = await readBucket(env, key);
  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000)),
    };
  }
  if (entry?.lockedUntil && now >= entry.lockedUntil) {
    await deleteBucket(env, key);
  }
  return { ok: true };
}

export async function recordLoginFailure(
  key: string,
  env?: RateLimitStore,
  opts?: { maxFails?: number; windowMs?: number },
): Promise<{ locked: boolean; retryAfterSec?: number }> {
  const maxFails = opts?.maxFails ?? DEFAULT_MAX_FAILS;
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = Date.now();
  const entry = (await readBucket(env, key)) || { fails: 0, lockedUntil: 0 };
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return {
      locked: true,
      retryAfterSec: Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000)),
    };
  }
  entry.fails += 1;
  if (entry.fails >= maxFails) {
    entry.lockedUntil = now + windowMs;
    entry.fails = 0;
    await writeBucket(env, key, entry, Math.ceil(windowMs / 1000));
    return { locked: true, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  await writeBucket(env, key, entry, Math.ceil(windowMs / 1000));
  return { locked: false };
}

export async function clearLoginRateLimit(
  key: string,
  env?: RateLimitStore,
) {
  await deleteBucket(env, key);
}
