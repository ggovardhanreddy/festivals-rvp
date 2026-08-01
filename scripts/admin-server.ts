import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { importLocalFolder } from "../lib/import-media";
import { CATEGORIES, type Category } from "../lib/paths";

const root = process.cwd();

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(path.join(root, ".env.local"));
loadEnvFile(path.join(root, ".env"));

const secret = process.env.ADMIN_SESSION_SECRET || "development-only-change-me";
const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
const port = Number(process.env.ADMIN_API_PORT || 8788);

const sign = (value: string) =>
  crypto.createHmac("sha256", secret).update(value).digest("base64url");

const readBody = (req: http.IncomingMessage) =>
  new Promise<Record<string, unknown>>((resolve) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
  });

function json(
  res: http.ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders: Record<string, string> = {},
) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "http://localhost:3000",
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function verified(req: http.IncomingMessage) {
  const value = req.headers.cookie
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("rvp_admin="))
    ?.slice(10);
  if (!value) return false;
  const [payload, signature] = value.split(".");
  const expected = sign(payload);
  if (!payload || !signature || signature.length !== expected.length) return false;
  try {
    return (
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) &&
      JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now()
    );
  } catch {
    return false;
  }
}

function passwordMatches(password: string) {
  const [scheme, salt, hash] = passwordHash.split(":");
  if (scheme !== "pbkdf2" || !salt || !hash) return false;
  try {
    return crypto.timingSafeEqual(
      crypto.pbkdf2Sync(password, salt, 210000, 32, "sha256"),
      Buffer.from(hash, "base64url"),
    );
  } catch {
    return false;
  }
}

function expandHome(input: string) {
  if (input.startsWith("~/") || input === "~") {
    return path.join(process.env.HOME || "", input.slice(1));
  }
  return input;
}

const server = http.createServer(async (req, res) => {
  const route = req.url?.split("?")[0] || "";

  if (req.method === "OPTIONS") {
    return json(res, 204, {});
  }

  if (route === "/api/admin/login" && req.method === "POST") {
    const value = await readBody(req);
    if (!passwordMatches(typeof value.password === "string" ? value.password : "")) {
      return json(res, 401, { error: "Unauthorized" });
    }
    const payload = Buffer.from(
      JSON.stringify({ sub: "Govardhan Reddy", exp: Date.now() + 86400000 }),
    ).toString("base64url");
    return json(
      res,
      200,
      { ok: true, admin: "Govardhan Reddy" },
      {
        "set-cookie": `rvp_admin=${payload}.${sign(payload)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`,
      },
    );
  }

  if (route === "/api/admin/session" && req.method === "GET") {
    return json(res, verified(req) ? 200 : 401, {
      ok: verified(req),
      admin: "Govardhan Reddy",
    });
  }

  if (!verified(req)) return json(res, 401, { error: "Unauthorized" });

  const value = await readBody(req);

  if (route === "/api/admin/import-folder" && req.method === "POST") {
    const folder =
      typeof value.path === "string" ? expandHome(value.path.trim()) : "";
    if (!folder) return json(res, 400, { error: "Folder path is required." });

    const categoryRaw =
      typeof value.category === "string" ? value.category.toLowerCase() : "auto";
    const category =
      categoryRaw === "auto"
        ? "auto"
        : (CATEGORIES.find((item) => item === categoryRaw) as Category | undefined);
    if (!category) {
      return json(res, 400, {
        error: `Category must be auto or one of: ${CATEGORIES.join(", ")}`,
      });
    }

    try {
      const result = await importLocalFolder({
        sourceDir: folder,
        category,
        album:
          typeof value.album === "string" && value.album.trim()
            ? value.album.trim()
            : "auto",
        keepOriginals: value.keepOriginals !== false,
        processImages: value.processImages !== false,
      });
      spawnSync("npm", ["run", "generate"], { cwd: root, stdio: "inherit" });
      return json(res, 200, {
        ok: true,
        result,
        next: "Review locally, then confirm publish. Nothing was pushed.",
      });
    } catch (error) {
      return json(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  if (route === "/api/admin/save" && value.album) {
    const album = value.album as { year: string; category: string; slug: string };
    const directory = path.join(root, "content", album.year, album.category, album.slug);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "metadata.json"), JSON.stringify(value.album, null, 2));
    spawnSync("npm", ["run", "generate"], { cwd: root, stdio: "inherit" });
    return json(res, 200, { ok: true });
  }

  if (route === "/api/admin/delete" && typeof value.path === "string") {
    fs.rmSync(path.join(root, "content", value.path), {
      recursive: true,
      force: true,
    });
    spawnSync("npm", ["run", "generate"], { cwd: root, stdio: "inherit" });
    return json(res, 200, { ok: true });
  }

  if (route === "/api/admin/publish" && req.method === "POST") {
    if (value.confirm !== true) {
      return json(res, 400, {
        error: "Publish requires confirm:true after you review the import.",
      });
    }
    const result = spawnSync("npm", ["run", "publish", "--", "--confirm"], {
      cwd: root,
      encoding: "utf8",
    });
    return json(res, result.status === 0 ? 200 : 500, {
      ok: result.status === 0,
      output: `${result.stdout || ""}\n${result.stderr || ""}`.trim(),
    });
  }

  return json(res, 404, { error: "Unknown admin route" });
});

server.listen(port, () => {
  console.log(`RVP local admin API (Govardhan Reddy only): http://localhost:${port}`);
});
