import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const secret = process.env.ADMIN_SESSION_SECRET || "development-only-change-me";
const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
const sign = (value: string) => crypto.createHmac("sha256", secret).update(value).digest("base64url");
const body = (req: http.IncomingMessage) => new Promise<Record<string, unknown>>((resolve) => {
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => resolve(raw ? JSON.parse(raw) as Record<string, unknown> : {}));
});
function verified(req: http.IncomingMessage) {
  const value = req.headers.cookie?.split(";").map((x) => x.trim()).find((x) => x.startsWith("rvp_admin="))?.slice(10);
  if (!value) return false;
  const [payload, signature] = value.split(".");
  const expected = sign(payload);
  if (!payload || !signature || signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) && JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
}
function passwordMatches(password: string) {
  const [scheme, salt, hash] = passwordHash.split(":");
  if (scheme !== "pbkdf2" || !salt || !hash) return false;
  return crypto.timingSafeEqual(crypto.pbkdf2Sync(password, salt, 210000, 32, "sha256"), Buffer.from(hash, "base64url"));
}
const server = http.createServer(async (req, res) => {
  const route = req.url?.split("?")[0] || "";
  if (route === "/api/admin/login" && req.method === "POST") {
    const value = await body(req);
    if (!passwordMatches(typeof value.password === "string" ? value.password : "")) return res.writeHead(401).end("Unauthorized");
    const payload = Buffer.from(JSON.stringify({ sub: "Govardhan Reddy", exp: Date.now() + 86400000 })).toString("base64url");
    res.setHeader("Set-Cookie", `rvp_admin=${payload}.${sign(payload)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
    return res.end(JSON.stringify({ ok: true }));
  }
  if (!verified(req)) return res.writeHead(401).end("Unauthorized");
  const value = await body(req);
  if (route === "/api/admin/save" && value.album) {
    const album = value.album as { year: string; category: string; slug: string };
    const directory = path.join(root, "content", album.year, album.category, album.slug);
    fs.mkdirSync(directory, { recursive: true }); fs.writeFileSync(path.join(directory, "metadata.json"), JSON.stringify(value.album, null, 2));
  } else if (route === "/api/admin/delete" && typeof value.path === "string") fs.rmSync(path.join(root, "content", value.path), { recursive: true, force: true });
  else if (route === "/api/admin/ingest" || route === "/api/admin/publish") {
    const action = route.endsWith("ingest") ? "ingest" : "publish";
    const result = spawnSync("npm", ["run", action], { cwd: root, encoding: "utf8" });
    res.writeHead(result.status === 0 ? 200 : 500); return res.end(JSON.stringify({ output: result.stdout || result.stderr }));
  }
  res.end(JSON.stringify({ ok: true }));
});
server.listen(8788, () => console.log("RVP local admin API: http://localhost:8788"));
