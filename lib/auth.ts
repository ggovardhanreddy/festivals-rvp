import type { Member } from "./types";

const SESSION_KEY = "rvp-member-session";

/**
 * Case-sensitive login username derived from a member's display name.
 * Leading single-letter initials are skipped: "M Rajesh" → "Rajesh",
 * "G Ramesh Kumar Reddy" → "Ramesh".
 */
export function memberUsername(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return name;
  const significant = parts.find((part) => part.length > 1);
  return significant || parts[parts.length - 1]!;
}

export function authenticateMember(
  username: string,
  password: string,
  members: Member[],
): Member | null {
  // Exact case-sensitive match — "rajesh" must not match "Rajesh"
  if (!username || username !== password) return null;
  return (
    members.find((member) => memberUsername(member.name) === username) || null
  );
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

export function writeSession(member: Member): MemberSession {
  const session: MemberSession = {
    memberId: member.id,
    username: memberUsername(member.name),
    name: member.name,
    at: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("rvp:auth-change"));
  return session;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent("rvp:auth-change"));
}

export { SESSION_KEY };
