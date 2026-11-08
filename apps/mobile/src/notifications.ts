export async function registerPushToken(opts: {
  token: string;
  platform: "android" | "ios";
  baseUrl?: string;
}) {
  const base = (opts.baseUrl || "https://www.reddivaripalli.com").replace(/\/$/, "");
  const res = await fetch(`${base}/api/public/subscribe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: opts.token, platform: opts.platform }),
  });
  if (!res.ok) throw new Error(`subscribe failed (${res.status})`);
  return (await res.json()) as { ok: boolean };
}
