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
  const body = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };
  const username = body.username ?? "";
  const password = body.password ?? "";
  const record = authMembers().find((m) => m.username === username);
  if (!record || !(await passwordMatches(password, record.passwordHash))) {
    return json(
      {
        ok: false,
        error: "Invalid username or password. Both are case-sensitive.",
      },
      401,
      headers,
    );
  }

  const payload = {
    memberId: record.memberId,
    username: record.username,
    name: record.name,
    exp: Date.now() + MAX_AGE_MS,
  };
  const value = encodePayload(payload);
  const sig = await hmacSign(value, sessionSecret(env));
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
