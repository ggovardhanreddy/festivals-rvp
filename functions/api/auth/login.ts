import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  clientIp,
  recordLoginFailure,
} from "../../_lib/rate-limit";
import {
  authMembers,
  COOKIE,
  cors,
  encodePayload,
  hmacSign,
  json,
  MAX_AGE_MS,
  passwordMatches,
  sessionSecret,
  type AuthEnv,
} from "./_shared";

export const onRequestOptions: PagesFunction<AuthEnv> = async ({ request }) =>
  new Response(null, { headers: cors(new URL(request.url).origin) });

export const onRequestPost: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const headers = cors(new URL(request.url).origin);
  const secret = sessionSecret(env);
  if (!secret) {
    // No signing key configured: refuse rather than sign with a known default.
    return json(
      { ok: false, error: "Sign-in is temporarily unavailable." },
      503,
      headers,
    );
  }
  const rateKey = `member-login:${clientIp(request)}`;
  const limited = await checkLoginRateLimit(rateKey, env);
  if (!limited.ok) {
    return json(
      {
        ok: false,
        error: `Too many login attempts. Try again in ${limited.retryAfterSec}s.`,
      },
      429,
      { ...headers, "retry-after": String(limited.retryAfterSec) },
    );
  }
  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  const username = (body.username ?? "").trim();
  const password = (body.password ?? "").trim();
  const record = (await authMembers(env)).find((m) => m.username === username);
  if (!record || !(await passwordMatches(password, record.passwordHash))) {
    const fail = await recordLoginFailure(rateKey, env);
    return json(
      {
        ok: false,
        error: fail.locked
          ? `Too many login attempts. Try again in ${fail.retryAfterSec}s.`
          : "Invalid username or password. Both are case-sensitive.",
      },
      fail.locked ? 429 : 401,
      fail.retryAfterSec
        ? { ...headers, "retry-after": String(fail.retryAfterSec) }
        : headers,
    );
  }
  await clearLoginRateLimit(rateKey, env);

  const payload = {
    memberId: record.memberId,
    username: record.username,
    name: record.name,
    exp: Date.now() + MAX_AGE_MS,
  };
  const value = encodePayload(payload);
  const sig = await hmacSign(value, secret);
  return json(
    {
      ok: true,
      session: {
        memberId: record.memberId,
        username: record.username,
        name: record.name,
      },
    },
    200,
    {
      ...headers,
      "set-cookie": `${COOKIE}=${value}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(MAX_AGE_MS / 1000)}`,
    },
  );
};
