/**
 * Notify IndexNow (Bing + partners) about canonical URLs after deploy.
 * Key file must be live at /{key}.txt on the same host.
 */
import fs from "node:fs";
import path from "node:path";

const KEY = "7555648619ce9d174f27c9bc6f921b79";
const HOST = "www.reddivaripalli.com";
const SITE = `https://${HOST}`;
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

function urlsFromSitemap(): string[] {
  const file = path.join(process.cwd(), "public", "sitemap.xml");
  if (!fs.existsSync(file)) return [`${SITE}/`, `${SITE}/about/`];
  const xml = fs.readFileSync(file, "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  return urls.length ? urls : [`${SITE}/`];
}

async function main() {
  const urlList = urlsFromSitemap().slice(0, 1000);
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  console.log(
    `IndexNow ${res.status} — submitted ${urlList.length} URL(s). ${text.slice(0, 200)}`,
  );

  // Also ping Google/Bing sitemap endpoints (best-effort discovery).
  const sitemap = `${SITE}/sitemap.xml`;
  for (const ping of [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  ]) {
    try {
      const r = await fetch(ping);
      console.log(`Sitemap ping ${ping.includes("google") ? "Google" : "Bing"} → ${r.status}`);
    } catch (error) {
      console.warn("Sitemap ping failed", error);
    }
  }

  if (!res.ok && res.status !== 202) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
