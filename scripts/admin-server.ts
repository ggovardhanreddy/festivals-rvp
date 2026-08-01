import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd(), secret = process.env.ADMIN_SESSION_SECRET || "change-this-local-secret";
const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
const sign = (value: string) => createHmac("sha256", secret).update(value).digest("base64url");
const session = () => { const body = `Govardhan Reddy.${Date.now() + 8 * 3600_000}`; return `${body}.${sign(body)}`; };
const authorized = (cookie = "") => { const token = cookie.match(/rvp_admin=([^;]+)/)?.[1]; if (!token) return false; const parts = token.split("."); const body = parts.slice(0, 2).join("."); return parts.length === 3 && Date.now() < Number(parts[1]) && timingSafeEqual(Buffer.from(parts[2]), Buffer.from(sign(body))); };
const respond = (res: import("node:http").ServerResponse, status: number, data: unknown, cookie?: string) => res.writeHead(status, {"content-type":"application/json", "access-control-allow-origin":"http://localhost:3000", "access-control-allow-credentials":"true", ...(cookie ? {"set-cookie":cookie} : {})}).end(JSON.stringify(data));
createServer(async (req, res) => {
  if (req.method === "OPTIONS") return respond(res, 204, {});
  let body = ""; for await (const part of req) body += part; const data = body ? JSON.parse(body) : {};
  if (req.url === "/login" && req.method === "POST") {
    const supplied = createHmac("sha256", secret).update(String(data.password)).digest("hex");
    if (passwordHash && timingSafeEqual(Buffer.from(supplied), Buffer.from(passwordHash))) return respond(res, 200, {ok:true}, `rvp_admin=${session()}; HttpOnly; SameSite=Strict; Path=/`);
    return respond(res, 401, {error:"Invalid credentials"});
  }
  if (!authorized(req.headers.cookie)) return respond(res, 401, {error:"Authentication required"});
  const content = join(root, "content");
  if (req.url === "/albums") return respond(res, 200, {albums: await readdir(content, {recursive:true})});
  if (req.url === "/metadata" && req.method === "POST") { await writeFile(join(root, data.path, "metadata.json"), JSON.stringify(data.metadata, null, 2)); return respond(res, 200, {ok:true}); }
  if (req.url === "/rename" && req.method === "POST") { await rename(join(root, data.from), join(root, data.to)); return respond(res, 200, {ok:true}); }
  if (req.url === "/delete" && req.method === "POST") { await rm(join(root, data.path), {recursive:true, force:true}); return respond(res, 200, {ok:true}); }
  if (req.url === "/metadata" && req.method === "GET") return respond(res, 200, JSON.parse(await readFile(join(content, "2024/Festivals/Sankranti-2024/metadata.json"), "utf8")));
  respond(res, 404, {error:"Unknown route"});
}).listen(8788, () => console.log("Festivals RVP admin server at http://localhost:8788"));
