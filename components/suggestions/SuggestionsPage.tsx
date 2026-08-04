"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";
import { useCommunityList } from "@/lib/use-community";
import { useSuperAdmin } from "@/lib/use-super-admin";
import type { Suggestion, SuggestionCategory, SuggestionStatus } from "@/lib/types";
import suggestionsSeed from "@/content/data/suggestions.json";

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

const SEED = suggestionsSeed as Suggestion[];

function newId() {
  return `sug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SuggestionsPage({ seed = SEED }: { seed?: Suggestion[] }) {
  const { session } = useMemberAuth();
  const { isAdmin } = useSuperAdmin();
  const { items, loading, submitItem, saveAll } = useCommunityList<Suggestion>(
    "suggestions",
    seed,
  );
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [subject, setSubject] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState<SuggestionCategory>("General");

  useEffect(() => {
    if (session?.name) setName((prev) => prev || session.name);
  }, [session]);

  const mine = useMemo(() => {
    if (!session) return items.filter((s) => !s.submittedBy || s.status !== "archived");
    return items.filter(
      (s) => s.submittedBy === session.memberId || (!s.submittedBy && s.name === session.name),
    );
  }, [items, session]);

  const publicApproved = useMemo(
    () => items.filter((s) => s.status === "approved"),
    [items],
  );

  async function handleSubmit(e: FormEvent) {
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

    await submitItem(entry);
    setName("");
    setMobile("");
    setSubject("");
    setSuggestion("");
    setCategory("General");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  async function updateStatus(id: string, status: SuggestionStatus) {
    const next = items.map((s) => (s.id === id ? { ...s, status } : s));
    await saveAll(next);
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
              Submissions sync to the community store when online (with a local
              fallback on this device).
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

      {loading ? <p className="muted section">Loading suggestions…</p> : null}

      {publicApproved.length ? (
        <Reveal className="section">
          <h2>Shared suggestions</h2>
          <ul className="suggestions-list">
            {publicApproved.map((s) => (
              <li key={s.id} className="suggestions-item" data-status={s.status}>
                <div className="suggestions-item-head">
                  <strong>{s.subject}</strong>
                  <span className="suggestions-meta">{s.category}</span>
                </div>
                <p className="muted">{s.suggestion}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

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
            Review and update status for community suggestions.
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
                        onClick={() => void updateStatus(s.id, st)}
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
