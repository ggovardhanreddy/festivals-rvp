type Env = { NOTIFY_TOKENS?: KVNamespace };

function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) =>
  new Response(null, { headers: cors(new URL(request.url).origin) });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = cors(new URL(request.url).origin);
  const body = (await request.json().catch(() => null)) as
    | { token?: string; platform?: "android" | "ios" | "web" }
    | null;
  if (!body?.token) {
    return new Response(JSON.stringify({ ok: false, error: "token required" }), {
      status: 400,
      headers: { ...headers, "content-type": "application/json" },
    });
  }
  if (env.NOTIFY_TOKENS) {
    const key = `token:${body.platform || "unknown"}:${body.token}`;
    await env.NOTIFY_TOKENS.put(key, JSON.stringify({ token: body.token, platform: body.platform || "unknown", at: Date.now() }));
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...headers, "content-type": "application/json" },
  });
};
