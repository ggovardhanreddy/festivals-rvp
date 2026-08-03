const CANONICAL_HOST = "www.reddivaripalli.com";
const PAGES_HOST = "festivals-rvp.pages.dev";

type MiddlewareContext = {
  request: Request;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: {
    MEMBER_SESSION_SECRET?: string;
    ADMIN_SESSION_SECRET?: string;
  };
};

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function hmacSign(value: string, secret: string) {
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

function decodePayload(value: string) {
  try {
    const pad = value + "=".repeat((4 - (value.length % 4)) % 4);
    const b64 = pad.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64)) as { exp?: number; memberId?: string };
  } catch {
    return null;
  }
}

async function hasMemberSession(
  request: Request,
  env: MiddlewareContext["env"],
) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_member=([^;]+)/);
  if (!match?.[1]) return false;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return false;
  const secret =
    env.MEMBER_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET ||
    "rvp-funfest-dev-secret";
  const expected = await hmacSign(value, secret);
  if (sig !== expected) return false;
  const payload = decodePayload(value);
  return Boolean(payload?.memberId && payload.exp && Date.now() <= payload.exp);
}

/** Edge-protect only stripped local media paths — HTML uses client login dialog. */
function isFunFestMediaPath(pathname: string) {
  return (
    pathname.includes("/fun-trips/") &&
    (pathname.startsWith("/videos/") ||
      pathname.startsWith("/images/") ||
      pathname.startsWith("/thumbs/") ||
      pathname.startsWith("/audio/"))
  );
}

export async function onRequest(context: MiddlewareContext) {
  const url = new URL(context.request.url);

  if (url.hostname === PAGES_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }

  if (
    isFunFestMediaPath(url.pathname) &&
    !(await hasMemberSession(context.request, context.env))
  ) {
    const next = `${url.pathname}${url.search}`;
    const login = new URL("/login/", url.origin);
    login.searchParams.set(
      "next",
      next.endsWith("/") || next.includes(".") ? next : `${next}/`,
    );
    return Response.redirect(login.toString(), 302);
  }

  return context.next();
}
