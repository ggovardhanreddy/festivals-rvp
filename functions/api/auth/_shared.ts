import { MEMBER_AUTH, type MemberAuthRecord } from "../../_data/member-auth-data";

export interface AuthEnv {
  MEMBER_SESSION_SECRET?: string;
  ADMIN_SESSION_SECRET?: string;
  RATE_LIMIT?: KVNamespace;
  /** R2 bucket binding. Holds the authoritative credential store at AUTH_R2_KEY. */
  MEDIA?: R2Bucket;
}

/** Authoritative credential store, kept out of git. See docs/SECURITY_INCIDENT.md. */
export const AUTH_R2_KEY = "auth/members.json";

export const COOKIE = "rvp_member";
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const encoder = new TextEncoder();

export function base64url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function encodePayload(obj: unknown) {
  return base64url(encoder.encode(JSON.stringify(obj)));
}

export function decodePayload<T>(value: string): T | null {
  try {
    const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
    const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)) as T;
  } catch {
    return null;
  }
}

export async function hmacSign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))),
  );
}

export async function passwordMatches(password: string, encoded: string) {
  const [scheme, salt, expected] = encoded.split(":");
  if (scheme !== "pbkdf2" || !salt || !expected) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations: 100_000,
    },
    key,
    256,
  );
  return base64url(new Uint8Array(bits)) === expected;
}

export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

export function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  };
}

/**
 * Session signing key. Returns null when unconfigured so callers fail CLOSED.
 * There is deliberately no fallback literal: a hardcoded default would be a
 * published signing key (see docs/SECURITY_INCIDENT.md, finding S-2).
 */
export function sessionSecret(env: AuthEnv): string | null {
  return env.MEMBER_SESSION_SECRET || env.ADMIN_SESSION_SECRET || null;
}

/**
 * Credential source, in priority order:
 *   1. R2 `auth/members.json` — authoritative, not in git
 *   2. `functions/_data/member-auth-data.ts` — legacy git fallback
 *
 * The fallback exists only so a missing or malformed R2 object cannot lock
 * every member out. Once R2 is populated and verified, the git module and its
 * JSON should be deleted and this fallback removed with them.
 */
export async function authMembers(env: AuthEnv): Promise<MemberAuthRecord[]> {
  if (env.MEDIA) {
    try {
      const obj = await env.MEDIA.get(AUTH_R2_KEY);
      if (obj) {
        const data = (await obj.json()) as { members?: MemberAuthRecord[] };
        if (Array.isArray(data?.members) && data.members.length) {
          return data.members;
        }
      }
    } catch {
      /* fall through to the git fallback */
    }
  }
  return MEMBER_AUTH.members as MemberAuthRecord[];
}

export async function parseSession(request: Request, env: AuthEnv) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_member=([^;]+)/);
  if (!match?.[1]) return null;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return null;
  const secret = sessionSecret(env);
  if (!secret) return null;
  const expected = await hmacSign(value, secret);
  if (sig !== expected) return null;
  const payload = decodePayload<{
    memberId?: string;
    username?: string;
    name?: string;
    exp?: number;
  }>(value);
  if (!payload?.exp || Date.now() > payload.exp) return null;
  if (!payload.memberId || !payload.username) return null;
  return payload;
}
