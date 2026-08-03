import type { Member, MemberGroup, MemberStatus } from "@/lib/types";
import { normalizeStoredGroup } from "@/lib/member-groups";

const CSV_HEADERS = [
  "id",
  "name",
  "nickname",
  "group",
  "designation",
  "profession",
  "company",
  "bio",
  "dob",
  "phone",
  "email",
  "bloodGroup",
  "status",
  "memorial",
  "archived",
  "displayOrder",
  "photo",
  "achievements",
  "social",
] as const;

function esc(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function membersToCsv(members: Member[]): string {
  const rows = [CSV_HEADERS.join(",")];
  for (const m of members) {
    rows.push(
      [
        m.id,
        m.name,
        m.nickname || "",
        m.group,
        m.designation || "",
        m.profession || "",
        m.company || "",
        m.bio || "",
        m.dob || "",
        m.phone || "",
        m.email || "",
        m.bloodGroup || "",
        m.status || (m.archived ? "Archived" : m.memorial ? "In Loving Memory" : "Active"),
        m.memorial ? "true" : "false",
        m.archived ? "true" : "false",
        m.displayOrder ?? "",
        m.photo || "",
        (m.achievements || []).join("|"),
        (m.social || []).map((s) => `${s.label}:${s.href}`).join("|"),
      ]
        .map(esc)
        .join(","),
    );
  }
  return rows.join("\n");
}

export function downloadMembersCsv(members: Member[], filename = "members.csv") {
  const blob = new Blob([membersToCsv(members)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function truthy(v: string): boolean {
  return /^(1|true|yes|y)$/i.test(v.trim());
}

function applyStatus(status: string, memorial: boolean, archived: boolean) {
  const s = status.trim() as MemberStatus | "";
  if (s === "Archived" || archived) {
    return { status: "Archived" as MemberStatus, memorial: false, archived: true };
  }
  if (s === "In Loving Memory" || memorial) {
    return {
      status: "In Loving Memory" as MemberStatus,
      memorial: true,
      archived: false,
    };
  }
  return { status: "Active" as MemberStatus, memorial: false, archived: false };
}

/** Parse CSV text into member patches (must include id or name). */
export function parseMembersCsv(text: string): Partial<Member>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseLine(lines[0]!).map((h) => h.trim());
  const idx = (name: string) => headers.indexOf(name);

  const out: Partial<Member>[] = [];
  for (let r = 1; r < lines.length; r += 1) {
    const cols = parseLine(lines[r]!);
    const get = (name: string) => {
      const i = idx(name);
      return i >= 0 ? (cols[i] || "").trim() : "";
    };
    const id = get("id");
    const name = get("name");
    if (!id && !name) continue;

    const statusBits = applyStatus(
      get("status"),
      truthy(get("memorial")),
      truthy(get("archived")),
    );
    const achievements = get("achievements")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    const social = get("social")
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const colon = pair.indexOf(":");
        if (colon < 0) return { label: "Link", href: pair };
        return { label: pair.slice(0, colon), href: pair.slice(colon + 1) };
      });

    const orderRaw = get("displayOrder");
    out.push({
      id: id || undefined,
      name: name || undefined,
      nickname: get("nickname") || undefined,
      group: normalizeStoredGroup(get("group") || "core") as MemberGroup,
      designation: get("designation") || undefined,
      profession: get("profession") || undefined,
      company: get("company") || undefined,
      bio: get("bio") || undefined,
      dob: get("dob") || null,
      phone: get("phone") || undefined,
      email: get("email") || undefined,
      bloodGroup: get("bloodGroup") || undefined,
      photo: get("photo") || null,
      displayOrder: orderRaw ? Number(orderRaw) : undefined,
      achievements,
      social,
      ...statusBits,
    });
  }
  return out;
}
