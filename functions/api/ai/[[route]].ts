export async function onRequest(context: {
  req: Request;
  env: { GOOGLE_GEMINI_API_KEY?: string };
}) {
  const { req, env } = context;
  const url = new URL(req.url);

  if (url.pathname === "/api/ai/chat" && req.method === "POST") {
    const key = env.GOOGLE_GEMINI_API_KEY;
    if (!key) return new Response(JSON.stringify({ error: "AI not configured" }), { status: 503, headers: { "content-type": "application/json" } });

    try {
      const body = await req.json() as { messages: Array<{ role: string; content: string }> };
      
      // Convert to Gemini format
      const contents = body.messages.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: "You are a helpful AI assistant for Reddivaripalli village in India. Provide brief, friendly answers about village life, agriculture, education, and community. Keep responses under 200 words." }] },
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
          safetySettings: [{ category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }],
          apiKey: key,
        }),
      });

      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text: string }> } }> };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate response";
      return new Response(JSON.stringify({ message: text }), { headers: { "content-type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "content-type": "application/json" } });
    }
  }
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "content-type": "application/json" } });
}
