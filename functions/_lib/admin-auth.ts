/**
 * Shared Super Admin session verification.
 * Accepts HttpOnly cookie `rvp_admin` (web) or `Authorization: Bearer <token>` (native).
 * Token format matches the cookie value: `<base64url(payload)>.<hmac>`.
 */

const encoder = new TextEncoder();

export type AdminSession = {
  ok: true;
  username: string;
  role: "super-admin";
  exp: number;
};

export type AdminAuthEnv = {
  ADMIN_SESSION_SECRET?: string;
  SUPER_ADMIN_USERNAME?: string;
};

/** Workers-safe base64url (avoid spread on TypedArray). */
export function base64url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
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

export function expectedAdminUsername(env: AdminAuthEnv) {
  return (env.SUPER_ADMIN_USERNAME || "Govardhan").trim();
}

function decodePayload(value: string): {
  sub?: string;
  role?: string;
  exp?: number;
} | null {
  try {
    const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
    const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)) as { sub?: string; role?: string; exp?: number };
  } catch {
    return null;
  }
}

function extractToken(request: Request): string | null {
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i);
  if (bearer?.[1]) return bearer[1].trim();

  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_admin=([^;]+)/);
  return match?.[1]?.trim() || null;
}

export async function verifyAdminToken(
  token: string,
  secret: string,
): Promise<AdminSession | null> {
  const [value, sig] = token.split(".");
  if (!value || !sig) return null;
  const expected = await hmacSign(value, secret);
  if (sig !== expected) return null;
  const payload = decodePayload(value);
  if (!payload?.exp || Date.now() > payload.exp) return null;
  if (payload.role && payload.role !== "super-admin") return null;
  return {
    ok: true,
    username: (payload.sub || "super-admin").trim(),
    role: "super-admin",
    exp: payload.exp,
  };
}

export async function resolveAdminSession(
  request: Request,
  env: AdminAuthEnv,
): Promise<AdminSession | null> {
  if (!env.ADMIN_SESSION_SECRET) return null;
  const token = extractToken(request);
  if (!token) return null;
  return verifyAdminToken(token, env.ADMIN_SESSION_SECRET);
}

export async function isAdminRequest(
  request: Request,
  env: AdminAuthEnv,
): Promise<boolean> {
  return Boolean(await resolveAdminSession(request, env));
}

export async function mintAdminToken(
  username: string,
  secret: string,
  ttlMs = 86_400_000,
): Promise<{ token: string; expiresAt: number; cookieValue: string }> {
  const expiresAt = Date.now() + ttlMs;
  const value = base64url(
    encoder.encode(
      JSON.stringify({
        sub: username,
        role: "super-admin",
        exp: expiresAt,
      }),
    ),
  );
  const sig = await hmacSign(value, secret);
  const token = `${value}.${sig}`;
  return { token, expiresAt, cookieValue: token };
}

/** CORS headers that allow cookie + Bearer for admin APIs. */
export function adminCorsHeaders(
  origin: string,
  methods = "GET,POST,PUT,DELETE,OPTIONS",
) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-allow-methods": methods,
  };
}
