import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const api = readFileSync(
  join(process.cwd(), "functions/api/community/[[route]].ts"),
  "utf8",
);

function setContents(name: string): string {
  const start = api.indexOf(name);
  return api.slice(start, api.indexOf("]", start));
}

/**
 * Anything a member of the public can write, anyone can read. Those two facts
 * together are what made the suggestions box a directory of phone numbers:
 * the collection was public-writable and public-readable with no status filter,
 * so a submission was served to every visitor the moment it was posted.
 */
describe("public submissions are moderated before they are published", () => {
  it("holds suggestions for approval like lost-found and heritage", () => {
    const approval = setContents("APPROVAL_COLLECTIONS = new Set(");
    for (const collection of ["lost-found", "heritage", "suggestions"]) {
      expect(approval, `${collection} is not moderated`).toContain(collection);
    }
  });

  it("serves only approved rows to a non-admin", () => {
    expect(api).toContain(
      'if (APPROVAL_COLLECTIONS.has(collection) && !(admin && adminQuery))',
    );
    expect(api).toContain('items.filter((i) => i.status === "approved")');
  });

  it("stamps a non-admin submission as pending rather than trusting the client", () => {
    // The page sends status "pending", but a hand-rolled POST could send
    // "approved". The server decides.
    expect(api).toContain(
      'if (APPROVAL_COLLECTIONS.has(collection) && !admin) {',
    );
    expect(api).toContain('item.status = "pending"');
  });
});

describe("contact details are never served to the public", () => {
  const redacted = api.slice(
    api.indexOf("PUBLIC_REDACTED_FIELDS"),
    api.indexOf("function redactForPublic"),
  );

  it("withholds the sender's mobile and name-link on suggestions", () => {
    for (const field of ["mobile", "email", "submittedBy"]) {
      expect(redacted, `suggestions.${field} still public`).toContain(
        `"${field}"`,
      );
    }
  });

  it("withholds contact details on lost-found", () => {
    expect(redacted).toContain('"lost-found": ["phone", "email"]');
  });

  it("withholds private member fields", () => {
    for (const field of ["phone", "email", "bloodGroup", "address"]) {
      expect(redacted).toContain(`"${field}"`);
    }
  });

  it("applies redaction on every non-admin read", () => {
    expect(api).toContain(
      "if (!admin) items = redactForPublic(collection, items)",
    );
  });
});

describe("an approved suggestion can still be published", () => {
  it("gives the admin a queue that can see pending rows", () => {
    const hub = readFileSync(
      join(process.cwd(), "components/admin/AdminHub.tsx"),
      "utf8",
    );
    // Gating without a queue would make every suggestion permanently invisible.
    expect(hub).toContain('useCommunityList<Suggestion>("suggestions", []');
    expect(hub).toContain("admin: true");
    expect(hub).toContain("<h3>Suggestions</h3>");
  });

  it("keeps pending in the suggestion vocabulary", () => {
    const types = readFileSync(join(process.cwd(), "lib/types.ts"), "utf8");
    expect(types).toMatch(/SuggestionStatus[\s\S]{0,160}"pending"/);
  });

  it("tells the sender their suggestion is waiting to be read", () => {
    const page = readFileSync(
      join(process.cwd(), "components/suggestions/SuggestionsPage.tsx"),
      "utf8",
    );
    expect(page).toContain("once someone from the village has read it");
    expect(page).toContain('status: "pending"');
  });
});
