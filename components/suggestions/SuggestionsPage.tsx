"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Reveal } from "@/components/Reveal";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";
import type { Suggestion, SuggestionCategory, SuggestionStatus } from "@/lib/types";

const STORAGE_KEY = "rvp-suggestions";
const ADMIN_KEY = "rvp-admin";

const CATEGORIES: SuggestionCategory[] = [
  "General",
  "Village Development",
  "Events",
  "Temple",
  "Infrastructure",
  "Water",
  "Agriculture",
  "Other",
];

const STATUS_OPTIONS: SuggestionStatus[] = ["draft", "approved", "archived"];

function loadStored(seed: Suggestion[]): Suggestion[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const stored = JSON.parse(raw) as Suggestion[];
    const byId = new Map<string, Suggestion>();
    for (const item of seed) byId.set(item.id, item);
    for (const item of stored) byId.set(item.id, item);
    return [...byId.values()].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
  } catch {
    return seed;
  }
}

function saveStored(items: Suggestion[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function newId() {
  return `sug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SuggestionsPage({ seed = [] }: { seed?: Suggestion[] }) {
  const { session } = useMemberAuth();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Suggestion[]>(seed);
  const [ready, setReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState<SuggestionCategory>("General");

  useEffect(() => {
    const adminParam = searchParams.get("admin");
    if (adminParam === "1") {
      localStorage.setItem(ADMIN_KEY, "true");
    }
    setIsAdmin(localStorage.getItem(ADMIN_KEY) === "true");
    setItems(loadStored(seed));
    setReady(true);
  }, [seed, searchParams]);

  const mine = useMemo(() => {
    if (!session) return items.filter((s) => !s.submittedBy);
    return items.filter((s) => s.submittedBy === session.memberId || !s.submittedBy);
  }, [items, session]);

  const persist = useCallback((next: Suggestion[]) => {
    setItems(next);
    saveStored(next);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !suggestion.trim()) return;

    const entry: Suggestion = {
      id: newId(),
      name: name.trim() || undefined,
      mobile: mobile.trim() || undefined,
      subject: subject.trim(),
      suggestion: suggestion.trim(),
      category,
      status: "draft",
      submittedAt: new Date().toISOString(),
      submittedBy: session?.memberId,
    };

    persist([entry, ...items]);
    setName("");
    setMobile("");
    setSubject("");
    setSuggestion("");
    setCategory("General");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  function updateStatus(id: string, status: SuggestionStatus) {
    persist(items.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  if (!ready) {
    return (
      <div className="suggestions-page">
        <p className="muted">Loading suggestions…</p>
      </div>
    );
  }

  return (
    <div className="suggestions-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Community voice</p>
            <h1>Suggestions</h1>
            <p className="lede">
              Share ideas for the village — development, events, temple, and more.
              Submissions stay on this device until reviewed locally.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="suggestions-success" role="status">
            Thank you — your suggestion has been saved.
          </div>
        ) : null}

        <form className="suggestions-form card-interactive" onSubmit={handleSubmit}>
          <h2>Submit a suggestion</h2>
          <div className="suggestions-form-grid">
            <label>
              Name <span className="muted">(optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label>
              Mobile <span className="muted">(optional)</span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                autoComplete="tel"
              />
            </label>
          </div>
          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SuggestionCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </label>
          <label>
            Suggestion
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={5}
              required
            />
          </label>
          <button type="submit" className="btn">
            Submit suggestion
          </button>
        </form>
      </Reveal>

      {mine.length ? (
        <Reveal className="section">
          <h2>Your submitted suggestions</h2>
          <ul className="suggestions-list">
            {mine.map((s) => (
              <li key={s.id} className="suggestions-item" data-status={s.status}>
                <div className="suggestions-item-head">
                  <strong>{s.subject}</strong>
                  <span className="suggestions-meta">
                    {s.category} · {s.status}
                  </span>
                </div>
                <p className="muted">{s.suggestion}</p>
                <time className="suggestions-time" dateTime={s.submittedAt}>
                  {new Date(s.submittedAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      {isAdmin ? (
        <Reveal className="section suggestions-admin">
          <h2>Admin review</h2>
          <p className="muted lede">
            Local review panel — toggle status for suggestions stored on this device.
          </p>
          {!items.length ? (
            <p className="muted">No suggestions yet.</p>
          ) : (
            <ul className="suggestions-list">
              {items.map((s) => (
                <li key={s.id} className="suggestions-item" data-status={s.status}>
                  <div className="suggestions-item-head">
                    <strong>{s.subject}</strong>
                    <span className="suggestions-meta">
                      {s.name || "Anonymous"}
                      {s.mobile ? ` · ${s.mobile}` : ""}
                    </span>
                  </div>
                  <p className="muted">{s.suggestion}</p>
                  <div className="suggestions-admin-actions">
                    {STATUS_OPTIONS.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className="btn ghost"
                        data-active={s.status === st || undefined}
                        onClick={() => updateStatus(s.id, st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      ) : null}
    </div>
  );
}
