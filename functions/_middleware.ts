const CANONICAL_HOST = "www.reddivaripalli.com";
const PAGES_HOST = "festivals-rvp.pages.dev";

type MiddlewareContext = {
  request: Request;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: {
    MEMBER_SESSION_SECRET?: string;
    ADMIN_SESSION_SECRET?: string;
    R2_PUBLIC_BASE?: string;
    MEDIA?: {
      get: (key: string) => Promise<{
        body: ReadableStream | null;
        httpMetadata?: { contentType?: string };
      } | null>;
    };
  };
};

const R2_PUBLIC_FALLBACK =
  "https://pub-f2609804d6a040368903177488b01d2d.r2.dev";

/** Member portraits live on R2; Pages strip-local removes them from `out/`. */
function isMemberPhotoPath(pathname: string) {
  return /^\/members\/.+\.(webp|avif|jpe?g|png)$/i.test(pathname);
}

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

/** Google Search Console HTML file — serve 200 before Pages strips `.html` (308). */
const GOOGLE_HTML_VERIFY = "/googled76649c26b0af13c";
const GOOGLE_HTML_VERIFY_BODY =
  "google-site-verification: googled76649c26b0af13c.html\n";

function isGoogleHtmlVerification(pathname: string) {
  return (
    pathname === `${GOOGLE_HTML_VERIFY}.html` ||
    pathname === GOOGLE_HTML_VERIFY ||
    pathname === `${GOOGLE_HTML_VERIFY}/`
  );
}

export async function onRequest(context: MiddlewareContext) {
  const url = new URL(context.request.url);

  if (isGoogleHtmlVerification(url.pathname)) {
    return new Response(GOOGLE_HTML_VERIFY_BODY, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
        "x-robots-tag": "noindex",
      },
    });
  }

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

  // Proxy member portraits from R2 as same-origin 200 (no redirect).
  // Old PWAs still request /members/*.webp; redirects break under the SW.
  if (isMemberPhotoPath(url.pathname)) {
    const key = url.pathname.replace(/^\//, ""); // members/foo.webp
    const headers = new Headers({
      "cache-control":
        "public, max-age=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": url.origin,
      "x-member-photo": "r2-proxy",
    });

    try {
      if (context.env.MEDIA) {
        const obj = await context.env.MEDIA.get(key);
        if (obj?.body) {
          headers.set(
            "content-type",
            obj.httpMetadata?.contentType || "image/webp",
          );
          return new Response(obj.body, { status: 200, headers });
        }
      }

      const base = (
        context.env.R2_PUBLIC_BASE || R2_PUBLIC_FALLBACK
      ).replace(/\/$/, "");
      const remote = await fetch(`${base}/${key}`);
      if (!remote.ok) {
        return new Response("Member photo not found", { status: 404, headers });
      }
      headers.set("content-type", remote.headers.get("content-type") || "image/webp");
      return new Response(remote.body, { status: 200, headers });
    } catch {
      return new Response("Member photo unavailable", { status: 502, headers });
    }
  }

  return context.next();
}
