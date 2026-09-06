import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

/**
 * An admin save must never fail silently.
 *
 * Several controls called `void saveAll(next)`, discarding the promise. A
 * rejected save produced nothing: no message, no retry, no trace. An admin
 * approving a submission could not tell a successful write from a 401.
 */
describe("every admin save reports its outcome", () => {
  const hub = read("components/admin/AdminHub.tsx");

  it("has no fire-and-forget saves left in the admin", () => {
    const orphaned = [...hub.matchAll(/void\s+[\w.]*\.?saveAll\(/g)].map(
      (m) => m[0],
    );
    expect(orphaned, `still fire-and-forget: ${orphaned.join(", ")}`).toEqual([]);
  });

  it("routes the approvals queue through a reported save", () => {
    for (const call of [
      "save.run(() => lf.saveAll(next)",
      "save.run(() => heritage.saveAll(next)",
      "save.run(() => suggestions.saveAll(next)",
    ]) {
      expect(hub, `${call} not wired`).toContain(call);
    }
  });

  it("shows the status where the admin is working", () => {
    // Two panels, two indicators: approvals and documents.
    expect((hub.match(/<SaveStatus/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("removes a document only after the server accepts it", () => {
    // Updating the list first made a failed save look exactly like a
    // successful one -- the row vanished either way.
    expect(hub).toMatch(/const ok = await docSave\.run\(/);
    expect(hub).toMatch(/if \(ok\) setItems\(next\)/);
  });
});

describe("the save reporter itself", () => {
  const hook = read("components/admin/useAdminSave.ts");
  const status = read("components/admin/SaveStatus.tsx");

  it("returns whether the save worked, so callers can wait for the server", () => {
    expect(hook).toContain("Promise<boolean>");
    expect(hook).toContain("return false");
  });

  it("surfaces the server's own message rather than a generic apology", () => {
    expect(hook).toContain("err instanceof Error ? err.message");
    expect(status).toContain("{error ||");
  });

  it("announces itself to assistive technology", () => {
    expect(status).toContain('role="status"');
    expect(status).toContain('role="alert"');
  });

  it("does not set state after the panel has gone", () => {
    // A save that resolves after unmount used to warn and could clobber a
    // later panel's state.
    expect(hook).toContain("alive.current");
  });
});
