"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";
import type { ChatMessage } from "@/lib/types";

const STORAGE_KEY = "rvp-chat-messages";
const EDIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_IMAGE_BYTES = 400_000;

const EMOJI_ROW = ["🙏", "🎉", "❤️", "👍", "😊", "🪔", "🌾", "✨"];

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function newId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MembersChat() {
  const { session } = useMemberAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const persist = useCallback((next: ChatMessage[]) => {
    const sorted = [...next].sort((a, b) => a.createdAt - b.createdAt);
    setMessages(sorted);
    saveMessages(sorted);
  }, []);

  const byId = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (m.deleted) return false;
      if (!q) return true;
      return (
        m.text.toLowerCase().includes(q) ||
        m.authorName.toLowerCase().includes(q)
      );
    });
  }, [messages, search]);

  function canEdit(msg: ChatMessage) {
    if (!session || msg.authorId !== session.memberId) return false;
    return Date.now() - msg.createdAt <= EDIT_WINDOW_MS;
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    const body = text.trim();
    if (!body) return;

    if (editingId) {
      persist(
        messages.map((m) =>
          m.id === editingId
            ? { ...m, text: body, editedAt: Date.now() }
            : m,
        ),
      );
      setEditingId(null);
      setText("");
      return;
    }

    const msg: ChatMessage = {
      id: newId(),
      authorId: session.memberId,
      authorName: session.name,
      text: body,
      createdAt: Date.now(),
      replyToId: replyTo?.id,
    };
    persist([...messages, msg]);
    setText("");
    setReplyTo(null);
    setShowEmoji(false);
  }

  function startEdit(msg: ChatMessage) {
    setEditingId(msg.id);
    setText(msg.text);
    setReplyTo(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setText("");
  }

  function deleteOwn(msg: ChatMessage) {
    if (!session || msg.authorId !== session.memberId) return;
    persist(messages.map((m) => (m.id === msg.id ? { ...m, deleted: true } : m)));
  }

  function insertEmoji(emoji: string) {
    setText((t) => t + emoji);
  }

  function handleImage(file: File | null) {
    if (!file || !session) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be under 400 KB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const msg: ChatMessage = {
        id: newId(),
        authorId: session.memberId,
        authorName: session.name,
        text: text.trim() || "Shared an image",
        imageDataUrl: dataUrl,
        createdAt: Date.now(),
        replyToId: replyTo?.id,
      };
      persist([...messages, msg]);
      setText("");
      setReplyTo(null);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }

  if (!ready || !session) {
    return (
      <div className="chat-page">
        <p className="muted">Loading chat…</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Members only</p>
          <h1>Community chat</h1>
          <p className="muted">Group conversation for {session.name} and fellow members.</p>
        </div>
        <input
          type="search"
          className="chat-search"
          placeholder="Search messages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search messages"
        />
      </div>

      <div className="chat-layout card-interactive">
        <div className="chat-messages" ref={listRef} aria-live="polite">
          {!visible.length ? (
            <p className="muted chat-empty">No messages yet. Say hello!</p>
          ) : (
            visible.map((msg) => {
              const reply = msg.replyToId ? byId.get(msg.replyToId) : undefined;
              const own = msg.authorId === session.memberId;
              return (
                <article
                  key={msg.id}
                  className="chat-message"
                  data-own={own || undefined}
                >
                  <header className="chat-message-head">
                    <strong>{msg.authorName}</strong>
                    <time dateTime={new Date(msg.createdAt).toISOString()}>
                      {formatTime(msg.createdAt)}
                      {msg.editedAt ? " · edited" : ""}
                    </time>
                  </header>
                  {reply && !reply.deleted ? (
                    <blockquote className="chat-reply-quote">
                      <span>{reply.authorName}</span>
                      <p>{reply.text}</p>
                    </blockquote>
                  ) : null}
                  <p className="chat-message-text">{msg.text}</p>
                  {msg.imageDataUrl ? (
                    <img
                      className="chat-message-image"
                      src={msg.imageDataUrl}
                      alt="Shared by member"
                    />
                  ) : null}
                  <div className="chat-message-actions">
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => setReplyTo(msg)}
                    >
                      Reply
                    </button>
                    {own && canEdit(msg) ? (
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => startEdit(msg)}
                      >
                        Edit
                      </button>
                    ) : null}
                    {own ? (
                      <button
                        type="button"
                        className="btn ghost"
                        onClick={() => deleteOwn(msg)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <form className="chat-compose" onSubmit={handleSend}>
          {replyTo ? (
            <div className="chat-reply-banner">
              <span>
                Replying to <strong>{replyTo.authorName}</strong>
              </span>
              <button type="button" className="btn ghost" onClick={() => setReplyTo(null)}>
                Cancel
              </button>
            </div>
          ) : null}
          {editingId ? (
            <div className="chat-reply-banner">
              <span>Editing message</span>
              <button type="button" className="btn ghost" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          ) : null}
          {showEmoji ? (
            <div className="chat-emoji-row" role="group" aria-label="Emoji picker">
              {EMOJI_ROW.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="chat-emoji-btn"
                  onClick={() => insertEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          ) : null}
          {error ? <p className="chat-error">{error}</p> : null}
          <div className="chat-compose-row">
            <button
              type="button"
              className="btn ghost"
              aria-label="Toggle emoji picker"
              onClick={() => setShowEmoji((v) => !v)}
            >
              😊
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              hidden
              onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={() => fileRef.current?.click()}
            >
              Image
            </button>
            <input
              type="text"
              className="chat-input"
              placeholder={editingId ? "Edit message…" : "Write a message…"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="btn">
              {editingId ? "Save" : "Send"}
            </button>
          </div>
        </form>
      </div>

      <p className="muted chat-note">
        Messages are stored locally on this device. Direct messages coming later.
      </p>
    </div>
  );
}
