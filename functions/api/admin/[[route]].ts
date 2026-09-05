import {
  adminCorsHeaders,
  base64url,
  expectedAdminUsername,
  extractToken,
  mintAdminToken,
  resolveAdminSession,
} from "../../_lib/admin-auth";
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

function routeName(params: FunctionContext["params"]) {
  const raw = params.route;
  if (Array.isArray(raw)) return raw.join("/");
  return raw || "";
}

export const onRequest = async ({ request, env, params }: FunctionContext) => {
  const url = new URL(request.url);
  const headers = adminCorsHeaders(url.origin, "GET,POST,OPTIONS");
  if (request.method === "OPTIONS") return new Response(null, { headers });

  const route = routeName(params);

  if ((route === "session" || url.pathname.endsWith("/session")) && request.method === "GET") {
    const session = await resolveAdminSession(request, env);
    // Why the session was refused. "Sign in required" is the same screen for
    // three unrelated faults -- the server having no signing key, the cookie
    // never reaching us, and a token that no longer verifies -- and telling
    // them apart from the outside is otherwise guesswork. No secret value is
    // exposed here, only whether one is configured.
    const configured = Boolean(env.ADMIN_SESSION_SECRET && env.ADMIN_PASSWORD_HASH);
    const cookiePresent = Boolean(extractToken(request));
    const reason = session
      ? null
      : !configured
        ? "server-not-configured"
        : !cookiePresent
          ? "no-session-cookie"
          : "session-invalid-or-expired";
    return new Response(
      JSON.stringify({
        ok: Boolean(session),
        role: session ? "super-admin" : "guest",
        username: session ? session.username || expectedAdminUsername(env) : null,
        expiresAt: session?.exp ?? null,
        configured,
        cookiePresent,
        reason,
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
      const username = expectedAdminUsername(env);
      const userOk =
        (payload.username || "").trim().toLowerCase() === username.toLowerCase();
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
      const minted = await mintAdminToken(username, env.ADMIN_SESSION_SECRET);
      return new Response(
        JSON.stringify({
          ok: true,
          role: "super-admin",
          username,
          token: minted.token,
          expiresAt: minted.expiresAt,
        }),
        {
          headers: {
            ...headers,
            "content-type": "application/json",
            "set-cookie": `rvp_admin=${minted.cookieValue}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`,
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
