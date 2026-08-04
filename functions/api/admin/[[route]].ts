import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  clientIp,
  recordLoginFailure,
} from "../../_lib/rate-limit";

interface Env {
  ADMIN_PASSWORD_HASH: string;
  ADMIN_SESSION_SECRET: string;
  SUPER_ADMIN_USERNAME?: string;
  RATE_LIMIT?: KVNamespace;
}
interface FunctionContext {
  request: Request;
  env: Env;
  params: { route?: string | string[] };
}
const encoder = new TextEncoder();

/** Workers-safe base64url (avoid spread on TypedArray). */
function base64url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function sign(value: string, secret: string) {
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

/** Match member-auth iterations (100k). 210k exceeds Workers CPU and returns 1101. */
async function passwordMatches(password: string, encoded: string | undefined) {
  if (!password || !encoded) return false;
  const [scheme, salt, expected] = encoded.split(":");
  if (scheme !== "pbkdf2" || !salt || !expected) return false;
  try {
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
  } catch {
    return false;
  }
}

async function isAdmin(request: Request, env: Env) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_admin=([^;]+)/);
  if (!match?.[1] || !env.ADMIN_SESSION_SECRET) return false;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return false;
  const expected = await sign(value, env.ADMIN_SESSION_SECRET);
  if (sig !== expected) return false;
  try {
    const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
    const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64)) as { exp?: number; role?: string };
    return Boolean(payload.exp && Date.now() <= payload.exp);
  } catch {
    return false;
  }
}

function routeName(params: FunctionContext["params"]) {
  const raw = params.route;
  if (Array.isArray(raw)) return raw.join("/");
  return raw || "";
}

function expectedUsername(env: Env) {
  return (env.SUPER_ADMIN_USERNAME || "Govardhan").trim();
}

export const onRequest = async ({ request, env, params }: FunctionContext) => {
  const url = new URL(request.url);
  const headers = {
    "access-control-allow-origin": url.origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  };
  if (request.method === "OPTIONS") return new Response(null, { headers });

  const route = routeName(params);

  if ((route === "session" || url.pathname.endsWith("/session")) && request.method === "GET") {
    const ok = await isAdmin(request, env);
    return new Response(
      JSON.stringify({
        ok,
        role: ok ? "super-admin" : "guest",
        username: ok ? expectedUsername(env) : null,
      }),
      {
        headers: { ...headers, "content-type": "application/json" },
      },
    );
  }

  if ((route === "login" || url.pathname.endsWith("/login")) && request.method === "POST") {
    try {
      if (!env.ADMIN_PASSWORD_HASH || !env.ADMIN_SESSION_SECRET) {
        return new Response(
          JSON.stringify({ error: "Super Admin secrets are not configured" }),
          {
            status: 503,
            headers: { ...headers, "content-type": "application/json" },
          },
        );
      }
      const rateKey = `admin-login:${clientIp(request)}`;
      const limited = await checkLoginRateLimit(rateKey, env);
      if (!limited.ok) {
        return new Response(
          JSON.stringify({
            error: `Too many login attempts. Try again in ${limited.retryAfterSec}s.`,
          }),
          {
            status: 429,
            headers: {
              ...headers,
              "content-type": "application/json",
              "retry-after": String(limited.retryAfterSec),
            },
          },
        );
      }
      let payload: { password?: string; username?: string } = {};
      try {
        payload = (await request.json()) as {
          password?: string;
          username?: string;
        };
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { ...headers, "content-type": "application/json" },
        });
      }
      const userOk =
        (payload.username || "").trim().toLowerCase() ===
        expectedUsername(env).toLowerCase();
      const passOk = await passwordMatches(
        payload.password ?? "",
        env.ADMIN_PASSWORD_HASH,
      );
      if (!userOk || !passOk) {
        const fail = await recordLoginFailure(rateKey, env);
        return new Response(
          JSON.stringify({
            error: fail.locked
              ? `Too many login attempts. Try again in ${fail.retryAfterSec}s.`
              : "Invalid Super Admin credentials",
          }),
          {
            status: fail.locked ? 429 : 401,
            headers: {
              ...headers,
              "content-type": "application/json",
              ...(fail.retryAfterSec
                ? { "retry-after": String(fail.retryAfterSec) }
                : {}),
            },
          },
        );
      }
      await clearLoginRateLimit(rateKey, env);
      const value = base64url(
        encoder.encode(
          JSON.stringify({
            sub: expectedUsername(env),
            role: "super-admin",
            exp: Date.now() + 86400000,
          }),
        ),
      );
      const sig = await sign(value, env.ADMIN_SESSION_SECRET);
      return new Response(
        JSON.stringify({
          ok: true,
          role: "super-admin",
          username: expectedUsername(env),
        }),
        {
          headers: {
            ...headers,
            "content-type": "application/json",
            "set-cookie": `rvp_admin=${value}.${sig}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
          },
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...headers, "content-type": "application/json" },
      });
    }
  }

  if ((route === "logout" || url.pathname.endsWith("/logout")) && request.method === "POST") {
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...headers,
        "content-type": "application/json",
        "set-cookie":
          "rvp_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
      },
    });
  }

  return new Response(
    JSON.stringify({
      error:
        "Album CMS writes use the local Git workflow. Community data uses /api/community/*.",
    }),
    { status: 403, headers: { ...headers, "content-type": "application/json" } },
  );
};
