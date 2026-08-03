import type { Member } from "./types";

const SESSION_KEY = "rvp-member-session";

/**
 * Case-sensitive login username derived from a member's display name.
 * Leading single-letter initials are skipped: "M Rajesh" → "Rajesh",
 * "G Ramesh Kumar Reddy" → "Ramesh".
 */
export function memberUsername(name: string): string {
  const parts = name
    .replace(/[()]/g, " ")
    .replace(/\bDr\.?\b/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return name;
  // Skip single-letter initials ("G", "M") — prefer first significant word.
  const significant = parts.find((part) => part.length > 1);
  return significant || parts[parts.length - 1]!;
}

/**
 * Assign unique Fun Fest usernames across the roster.
 * Duplicates get a leading initial (K Balaji → KBalaji) or a numeric suffix.
 */
export function assignMemberUsernames(
  members: Member[],
): Map<string, string> {
  const used = new Set<string>();
  const map = new Map<string, string>();

  for (const member of members) {
    const parts = member.name
      .replace(/[()]/g, " ")
      .replace(/\bDr\.?\b/gi, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    let candidate = memberUsername(member.name);

    if (used.has(candidate)) {
      const initial = (parts[0]?.[0] || "").toUpperCase();
      const withInitial = `${initial}${candidate}`;
      if (initial && !used.has(withInitial)) {
        candidate = withInitial;
      } else {
        const extras = parts.filter((p) => p.length > 1 && p !== candidate);
        const joined = extras.slice(0, 2).join("") || candidate;
        candidate = used.has(joined) ? `${candidate}2` : joined;
        let n = 2;
        while (used.has(candidate)) {
          candidate = `${memberUsername(member.name)}${n}`;
          n += 1;
        }
      }
    }

    used.add(candidate);
    map.set(member.id, candidate);
  }

  return map;
}

/** @deprecated Client must not verify passwords — use /api/auth/login */
export function authenticateMember(
  username: string,
  password: string,
  members: Member[],
): Member | null {
  const user = username.trim();
  const pass = password.trim();
  if (!user || user !== pass) return null;
  const usernames = assignMemberUsernames(members);
  for (const member of members) {
    if (usernames.get(member.id) === user) return member;
  }
  return null;
}

export type MemberSession = {
  memberId: string;
  username: string;
  name: string;
  at: number;
};

export function readSession(): MemberSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemberSession;
  } catch {
    return null;
  }
}

export function writeSession(session: MemberSession): MemberSession {
  const next = { ...session, at: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("rvp:auth-change"));
  return next;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("rvp:auth-change"));
}

export { SESSION_KEY };
