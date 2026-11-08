import members from "../../../content/data/members.json";
import events from "../../../content/data/events.json";
import announcements from "../../../content/data/announcements.json";
import developments from "../../../content/data/developments.json";
import type {
  Announcement,
  Development,
  Member,
  SiteEvent,
} from "../../../lib/types";

function cors(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

export const onRequestOptions: PagesFunction = async ({ request }) =>
  new Response(null, { headers: cors(new URL(request.url).origin) });

export const onRequestGet: PagesFunction = async ({ request }) => {
  const headers = cors(new URL(request.url).origin);
  return new Response(
    JSON.stringify({
      members: members as Member[],
      events: events as SiteEvent[],
      announcements: announcements as Announcement[],
      developments: developments as Development[],
      fetchedAt: new Date().toISOString(),
    }),
    {
      headers: {
        ...headers,
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    },
  );
};
