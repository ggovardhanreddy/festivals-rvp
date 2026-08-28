import { json } from "@cloudflare/workers-types";

export async function onRequest(context: {
  req: Request;
  env: { ANTHROPIC_API_KEY?: string };
}) {
  const { req, env } = context;
  const url = new URL(req.url);

  if (url.pathname === "/api/ai/chat" && req.method === "POST") {
    const key = env.ANTHROPIC_API_KEY;
    if (!key) return new Response(JSON.stringify({ error: "Not configured" }), { status: 503, headers: { "content-type": "application/json" } });

    try {
      const body = await req.json() as { messages: Array<{ role: string; content: string }> };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: "You are a helpful AI for Reddivaripalli village. Keep responses brief.",
          messages: body.messages,
        }),
      });
      const data = await res.json() as { content?: Array<{ text: string }> };
      const text = data.content?.[0]?.text || "";
      return new Response(JSON.stringify({ message: text }), { headers: { "content-type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "content-type": "application/json" } });
    }
  }
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "content-type": "application/json" } });
}
