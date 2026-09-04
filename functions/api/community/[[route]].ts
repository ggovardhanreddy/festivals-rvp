/**
 * Community data API — persists JSON collections in R2.
 *
 * GET    /api/community/:collection
 * POST   /api/community/:collection   (submit item / analytics hit)
 * PUT    /api/community/:collection   (admin replace collection / settings)
 * DELETE /api/community/:collection?id=
 */

import {
  adminCorsHeaders,
  resolveAdminSession,
  type AdminSession,
} from "../../_lib/admin-auth";
import { appendAdminAudit } from "../../_lib/audit";
import { COMMUNITY_SEEDS } from "../../_data/community-seeds";

interface Env {
  MEDIA?: R2Bucket;
  ADMIN_SESSION_SECRET?: string;
  SUPER_ADMIN_USERNAME?: string;
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
  "events",
  "announcements",
  "families",
  "family-people",
  "media-protection",
]);

const APPROVAL_COLLECTIONS = new Set(["lost-found", "heritage"]);

/** Collections that require Super Admin for POST/PUT/DELETE. */
const ADMIN_WRITE_COLLECTIONS = new Set([
  "directory",
  "panchayat-docs",
  "members",
  "events",
  "announcements",
  "families",
  "family-people",
  "media-protection",
]);

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

function routeParts(params: FunctionContext["params"]) {
  const raw = params.route;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return raw.split("/").filter(Boolean);
  return [];
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

/** When R2 key is missing, serve Git seed and self-heal into R2 (not when intentionally empty). */
async function readItemsWithSeed(
  env: Env,
  collection: string,
): Promise<{ items: Record<string, unknown>[]; source: string }> {
  const raw = await readStore(env, collection);
  if (raw !== null) {
    return { items: asItems(raw), source: "r2" };
  }

  const seed = COMMUNITY_SEEDS[collection];
  if (!seed?.length) return { items: [], source: "empty" };

  try {
    await writeStore(env, collection, { items: seed });
    return { items: seed, source: "seed" };
  } catch {
    // R2 unavailable — still return seed so iOS/Android/web stay in sync
    return { items: seed, source: "seed" };
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

function isLegacyFamilyCatalog(items: Record<string, unknown>[]): boolean {
  return items.some((item) => {
    if ("category" in item) return true;
    const blob = `${item.id ?? ""} ${item.slug ?? ""} ${item.name ?? ""}`;
    return /koda|g family|k family|m family|d family|reddy families|other families|gundluru-koda|gundluru-subba|GUNDLURU_KODA|GUNDLURU_SUBBA/i.test(
      blob,
    );
  });
}

async function refreshStaleFamilyCatalog(
  env: Env,
  items: Record<string, unknown>[],
): Promise<{ items: Record<string, unknown>[]; rewritten: boolean }> {
  const seed = COMMUNITY_SEEDS.families;
  if (!seed?.length || !isLegacyFamilyCatalog(items)) {
    return { items, rewritten: false };
  }
  try {
    await writeStore(env, "families", { items: seed });
  } catch {
    /* still serve the current seed even if R2 write fails */
  }
  return { items: seed, rewritten: true };
}

async function audit(
  env: Env,
  session: AdminSession | null,
  action: string,
  collection: string,
  target?: string,
) {
  if (!session) return;
  await appendAdminAudit(env, {
    actor: session.username,
    action,
    collection,
    target,
  });
}

export const onRequest = async ({ request, env, params }: FunctionContext) => {
  const url = new URL(request.url);
  const headers = adminCorsHeaders(url.origin);
  if (request.method === "OPTIONS") return new Response(null, { headers });

  try {
    const parts = routeParts(params);
    const collection = parts[0] || "";
    if (!COLLECTIONS.has(collection)) {
      return json({ error: "Unknown collection" }, 404, headers);
    }

    const session = await resolveAdminSession(request, env);
    const admin = Boolean(session);
    const adminQuery = url.searchParams.get("admin") === "1";

    if (collection === "site-settings") {
      if (request.method === "GET") {
        const stored = (await readStore(env, collection)) as Record<string, unknown> | null;
        return json(
          {
            settings: stored || {
              watermarkEnabled: true,
              watermarkText: "Reddivaripalli.com",
              watermarkPosition: "bottom-right",
              watermarkOpacity: 0.35,
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
        await audit(env, session, "settings.update", collection);
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
        await audit(env, session, "audit.replace", collection);
        return json({ ok: true, items: next }, 200, headers);
      }
      return json({ error: "Method not allowed" }, 405, headers);
    }

    if (request.method === "GET") {
      const { items: seeded, source } = await readItemsWithSeed(env, collection);
      let items = seeded;
      let from = source;
      if (collection === "families") {
        const refreshed = await refreshStaleFamilyCatalog(env, items);
        items = refreshed.items;
        if (refreshed.rewritten) from = "seed";
      }
      if (!items.length) {
        return json({ items: [], source: "empty" }, 200, headers);
      }
      if (APPROVAL_COLLECTIONS.has(collection) && !(admin && adminQuery)) {
        items = items.filter((i) => i.status === "approved");
      }
      return json({ items, source: from }, 200, headers);
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
      if (ADMIN_WRITE_COLLECTIONS.has(collection)) {
        if (!admin) return json({ error: "Admin required" }, 401, headers);
      }
      const next = [...items.filter((i) => i.id !== item.id), item];
      await writeStore(env, collection, { items: next });
      if (admin) {
        await audit(env, session, `${collection}.upsert`, collection, String(item.id));
      }
      return json({ ok: true, items: next, item }, 200, headers);
    }

    if (request.method === "PUT") {
      if (!admin) return json({ error: "Admin required" }, 401, headers);
      const body = (await request.json()) as { items?: Record<string, unknown>[] };
      if (!Array.isArray(body.items)) {
        return json({ error: "items array required" }, 400, headers);
      }
      await writeStore(env, collection, { items: body.items });
      await audit(
        env,
        session,
        `${collection}.replace`,
        collection,
        `${body.items.length} items`,
      );
      return json({ ok: true, items: body.items }, 200, headers);
    }

    if (request.method === "DELETE") {
      if (!admin) return json({ error: "Admin required" }, 401, headers);
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "id required" }, 400, headers);
      const items = asItems(await readStore(env, collection)).filter((i) => i.id !== id);
      await writeStore(env, collection, { items });
      await audit(env, session, `${collection}.delete`, collection, id);
      return json({ ok: true, items }, 200, headers);
    }

    return json({ error: "Method not allowed" }, 405, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Community API failed";
    return json({ error: message }, 500, headers);
  }
};
