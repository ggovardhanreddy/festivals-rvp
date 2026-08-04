/**
 * Community data API — persists JSON collections in R2.
 *
 * GET    /api/community/:collection
 * POST   /api/community/:collection   (submit item / analytics hit)
 * PUT    /api/community/:collection   (admin replace collection / settings)
 * DELETE /api/community/:collection?id=
 */

interface Env {
  MEDIA?: R2Bucket;
  ADMIN_SESSION_SECRET?: string;
}

interface FunctionContext {
  request: Request;
  env: Env;
  params: { route?: string | string[] };
}

const COLLECTIONS = new Set([
  "directory",
  "members",
  "lost-found",
  "panchayat-docs",
  "heritage",
  "suggestions",
  "site-settings",
  "analytics",
  "audit",
]);

const APPROVAL_COLLECTIONS = new Set(["lost-found", "heritage"]);

const encoder = new TextEncoder();

const base64url = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

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

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store, no-cache, must-revalidate",
      ...headers,
    },
  });
}

function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  };
}

function routeParts(params: FunctionContext["params"]) {
  const raw = params.route;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split("/").filter(Boolean);
  return [];
}

async function requireAdmin(request: Request, env: Env) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)rvp_admin=([^;]+)/);
  if (!match?.[1] || !env.ADMIN_SESSION_SECRET) return false;
  const [value, sig] = match[1].split(".");
  if (!value || !sig) return false;
  const expected = await hmacSign(value, env.ADMIN_SESSION_SECRET);
  return sig === expected;
}

function r2Key(collection: string) {
  return `community/${collection}.json`;
}

async function readStore(env: Env, collection: string): Promise<unknown> {
  if (!env.MEDIA) return null;
  const obj = await env.MEDIA.get(r2Key(collection));
  if (!obj) return null;
  try {
    return await obj.json();
  } catch {
    return null;
  }
}

async function writeStore(env: Env, collection: string, data: unknown) {
  if (!env.MEDIA) throw new Error("R2 MEDIA binding is not configured");
  await env.MEDIA.put(r2Key(collection), JSON.stringify(data), {
    httpMetadata: { contentType: "application/json" },
  });
}

function asItems(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: Record<string, unknown>[] }).items;
  }
  return [];
}

export const onRequest = async ({ request, env, params }: FunctionContext) => {
  const url = new URL(request.url);
  const headers = cors(url.origin);
  if (request.method === "OPTIONS") return new Response(null, { headers });

  try {
    const parts = routeParts(params);
    const collection = parts[0] || "";
    if (!COLLECTIONS.has(collection)) {
      return json({ error: "Unknown collection" }, 404, headers);
    }

    const admin = await requireAdmin(request, env);
    const adminQuery = url.searchParams.get("admin") === "1";

    if (collection === "site-settings") {
      if (request.method === "GET") {
        const stored = (await readStore(env, collection)) as Record<string, unknown> | null;
        return json(
          {
            settings: stored || {
              watermarkEnabled: true,
              watermarkText: "Reddivaripalli Village",
              allowPublicMediaDownload: false,
            },
          },
          200,
          headers,
        );
      }
      if (request.method === "PUT") {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
        const body = (await request.json()) as { settings?: Record<string, unknown> };
        const settings = body.settings || {};
        await writeStore(env, collection, settings);
        return json({ ok: true, settings }, 200, headers);
      }
      return json({ error: "Method not allowed" }, 405, headers);
    }

    if (collection === "analytics") {
      if (request.method === "POST") {
        const body = (await request.json()) as { hit?: Record<string, unknown> };
        if (!body.hit || typeof body.hit.path !== "string") {
          return json({ error: "Invalid hit" }, 400, headers);
        }
        const existing = asItems(await readStore(env, collection));
        const next = [...existing, { ...body.hit, ts: body.hit.ts || Date.now() }].slice(-5000);
        try {
          await writeStore(env, collection, { hits: next });
        } catch {
          /* allow offline / missing R2 */
        }
        return json({ ok: true }, 200, headers);
      }
      if (request.method === "GET") {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
        const hits = asItems(await readStore(env, collection));
        return json({ hits }, 200, headers);
      }
      return json({ error: "Method not allowed" }, 405, headers);
    }

    if (collection === "audit") {
      if (request.method === "GET") {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
        const items = asItems(await readStore(env, collection));
        return json({ items, source: "r2" }, 200, headers);
      }
      if (request.method === "POST") {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
        const body = (await request.json()) as { item?: Record<string, unknown> };
        if (!body.item || typeof body.item !== "object") {
          return json({ error: "item required" }, 400, headers);
        }
        const existing = asItems(await readStore(env, collection));
        const item = {
          ...body.item,
          id: body.item.id || `audit-${Date.now().toString(36)}`,
          ts: body.item.ts || Date.now(),
        };
        const next = [...existing, item].slice(-1000);
        await writeStore(env, collection, { items: next });
        return json({ ok: true, items: next, item }, 200, headers);
      }
      if (request.method === "PUT") {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
        const body = (await request.json()) as { items?: Record<string, unknown>[] };
        if (!Array.isArray(body.items)) {
          return json({ error: "items array required" }, 400, headers);
        }
        const next = body.items.slice(-1000);
        await writeStore(env, collection, { items: next });
        return json({ ok: true, items: next }, 200, headers);
      }
      return json({ error: "Method not allowed" }, 405, headers);
    }

    if (request.method === "GET") {
      let items = asItems(await readStore(env, collection));
      if (!items.length) {
        return json({ items: [], source: "empty" }, 200, headers);
      }
      if (APPROVAL_COLLECTIONS.has(collection) && !(admin && adminQuery)) {
        items = items.filter((i) => i.status === "approved");
      }
      return json({ items, source: "r2" }, 200, headers);
    }

    if (request.method === "POST") {
      const body = (await request.json()) as { item?: Record<string, unknown> };
      if (!body.item || typeof body.item !== "object") {
        return json({ error: "item required" }, 400, headers);
      }
      const items = asItems(await readStore(env, collection));
      const item = { ...body.item };
      if (!item.id) {
        item.id = `${collection}-${Date.now().toString(36)}`;
      }
      if (APPROVAL_COLLECTIONS.has(collection) && !admin) {
        item.status = "pending";
      }
      if (
        collection === "directory" ||
        collection === "panchayat-docs" ||
        collection === "members"
      ) {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
      }
      const next = [...items.filter((i) => i.id !== item.id), item];
      await writeStore(env, collection, { items: next });
      return json({ ok: true, items: next, item }, 200, headers);
    }

    if (request.method === "PUT") {
      if (!admin) return json({ error: "Admin required" }, 401, headers);
      const body = (await request.json()) as { items?: Record<string, unknown>[] };
      if (!Array.isArray(body.items)) {
        return json({ error: "items array required" }, 400, headers);
      }
      await writeStore(env, collection, { items: body.items });
      return json({ ok: true, items: body.items }, 200, headers);
    }

    if (request.method === "DELETE") {
      if (!admin) return json({ error: "Admin required" }, 401, headers);
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id required" }, 400, headers);
      const items = asItems(await readStore(env, collection)).filter((i) => i.id !== id);
      await writeStore(env, collection, { items });
      return json({ ok: true, items }, 200, headers);
    }

    return json({ error: "Method not allowed" }, 405, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Community API failed";
    return json({ error: message }, 500, headers);
  }
};
