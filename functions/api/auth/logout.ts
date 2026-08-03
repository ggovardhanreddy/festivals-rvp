import { COOKIE, cors, json, type AuthEnv } from "./_shared";

export const onRequestOptions: PagesFunction<AuthEnv> = async ({ request }) =>
  new Response(null, { headers: cors(new URL(request.url).origin) });

export const onRequestPost: PagesFunction<AuthEnv> = async ({ request }) => {
  const headers = cors(new URL(request.url).origin);
  return json(
    { ok: true },
    200,
    {
      ...headers,
      "set-cookie": `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    },
  );
};
