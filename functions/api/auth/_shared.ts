import { MEMBER_AUTH, type MemberAuthRecord } from "../../_data/member-auth-data";

export interface AuthEnv {
  MEMBER_SESSION_SECRET?: string;
  ADMIN_SESSION_SECRET?: string;
}

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

export function sessionSecret(env: AuthEnv) {
  return (
    env.MEMBER_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET ||
    "rvp-funfest-dev-secret"
  );
}

export function authMembers(): MemberAuthRecord[] {
  return MEMBER_AUTH.members as MemberAuthRecord[];
}

export async function parseSession(request: Request, env: AuthEnv) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_member=([^;]+)/);
  if (!match?.[1]) return null;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return null;
  const expected = await hmacSign(value, sessionSecret(env));
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
