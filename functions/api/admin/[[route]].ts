interface Env { ADMIN_PASSWORD_HASH: string; ADMIN_SESSION_SECRET: string }
interface FunctionContext { request: Request; env: Env }
const encoder = new TextEncoder();
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}
async function passwordMatches(password: string, encoded: string) {
  const [scheme, salt, expected] = encoded.split(":");
  if (scheme !== "pbkdf2" || !salt || !expected) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 210000 }, key, 256);
  return base64url(new Uint8Array(bits)) === expected;
}
export const onRequest = async ({ request, env }: FunctionContext) => {
  const url = new URL(request.url);
  const headers = { "access-control-allow-origin": url.origin, "access-control-allow-credentials": "true" };
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (url.pathname.endsWith("/login") && request.method === "POST") {
    const payload = (await request.json()) as { password?: string };
    if (!(await passwordMatches(payload.password ?? "", env.ADMIN_PASSWORD_HASH))) return new Response("Unauthorized", { status: 401, headers });
    const value = base64url(encoder.encode(JSON.stringify({ sub: "Govardhan Reddy", exp: Date.now() + 86400000 })));
    return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, "content-type": "application/json", "set-cookie": `rvp_admin=${value}.${await sign(value, env.ADMIN_SESSION_SECRET)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400` } });
  }
  return new Response(JSON.stringify({ error: "Production archive writes require a local Git workflow." }), { status: 403, headers: { ...headers, "content-type": "application/json" } });
};
