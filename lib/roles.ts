import type { SiteRole } from "./types";

/** Capability matrix for guests, members, and administrators. */
export const ROLE_CAPABILITIES = {
  guest: [
    "view-public",
  ],
  member: [
    "view-public",
    "upload-pending",
    "submit-suggestions",
    "submit-heritage",
    "submit-lost-found",
    "register-blood-donor",
    "access-funfest",
  ],
  admin: [
    "view-public",
    "upload",
    "edit",
    "delete",
    "approve",
    "reject",
    "manage-users",
    "manage-roles",
    "manage-events",
    "manage-festivals",
    "manage-gallery",
    "manage-developments",
    "manage-suggestions",
    "manage-notifications",
    "manage-documents",
    "manage-heritage",
    "manage-directory",
    "manage-settings",
    "manage-analytics",
    "access-admin",
    "access-funfest",
  ],
} as const satisfies Record<SiteRole, readonly string[]>;

export type Capability =
  (typeof ROLE_CAPABILITIES)[SiteRole][number];

export function roleCan(role: SiteRole, capability: Capability): boolean {
  return (ROLE_CAPABILITIES[role] as readonly string[]).includes(capability);
}

export function memberCannotModifyPublicContent(role: SiteRole) {
  return role !== "admin";
}
