"use client";

/**
 * The visible result of an admin save.
 *
 * Deliberately plain and always in the same place, so an administrator learns
 * where to look. An error shows the server's own message rather than a generic
 * apology: "Admin required" means sign in again, "R2 MEDIA binding is not
 * configured" means something is wrong with the deployment, and telling them
 * apart is the difference between a retry and a phone call.
 */
import type { AdminSaveState } from "./useAdminSave";

export function SaveStatus({
  state,
  error,
  label,
}: {
  state: AdminSaveState;
  error?: string | null;
  label?: string | null;
}) {
  if (state === "idle") return null;

  const what = label ? `${label}: ` : "";

  if (state === "saving") {
    return (
      <p className="admin-save-status" data-state="saving" role="status">
        {what}Saving&hellip;
      </p>
    );
  }
  if (state === "saved") {
    return (
      <p className="admin-save-status" data-state="saved" role="status">
        {what}Saved.
      </p>
    );
  }
  return (
    <p className="admin-save-status" data-state="error" role="alert">
      {what}Not saved &mdash; {error || "the server rejected the change."}
    </p>
  );
}
