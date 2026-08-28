"use client";
import { useState, useRef, useEffect } from "react";
export function AIAssistant() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = [...messages, { role: "user" as const, content: input }];
    setMessages(msg);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: msg }),
      });
      const data = await res.json() as { message?: string };
      if (data.message) setMessages([...msg, { role: "assistant", content: data.message }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Village AI</h1>
      <div className="bg-white rounded shadow h-96 overflow-y-auto mb-4 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-4 ${m.role === "user" ? "text-right" : ""}`}>
            <div className={`inline-block max-w-xs rounded px-3 py-2 ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>{m.content}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask..." className="flex-1 px-3 py-2 border rounded" disabled={loading} />
        <button onClick={send} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">{loading ? "..." : "Send"}</button>
      </div>
    </div>
  );
}
