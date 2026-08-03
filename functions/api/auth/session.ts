import { cors, json, parseSession, type AuthEnv } from "./_shared";

export const onRequestOptions: PagesFunction<AuthEnv> = async ({ request }) =>
  new Response(null, { headers: cors(new URL(request.url).origin) });

export const onRequestGet: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const headers = cors(new URL(request.url).origin);
  const session = await parseSession(request, env);
  if (!session) return json({ ok: false, session: null }, 200, headers);
  return json(
    {
      ok: true,
      session: {
        memberId: session.memberId,
        username: session.username,
        name: session.name,
      },
    },
    200,
    headers,
  );
};
