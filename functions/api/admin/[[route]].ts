export const onRequest = async () =>
  new Response(JSON.stringify({ error: "Administration is local-only. Run npm run dev and use localhost:8788." }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });
