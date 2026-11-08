import type { MobileContent } from "@/src/content";

export const SEED_CONTENT: MobileContent = {
  members: [
    { id: "seed-1", name: "RVP Community Member" },
    { id: "seed-2", name: "Village Volunteer" },
  ],
  events: [
    {
      id: "seed-deepavali",
      title: "Deepavali",
      titleTe: "దీపావళి",
      date: "2026-11-08",
      image: "/festivals/deepavali/hero.webp",
      description: "Festival of lights in Reddivaripalli.",
    },
    {
      id: "seed-sankranti",
      title: "Sankranti",
      titleTe: "సంక్రాంతి",
      date: "2027-01-14",
      image: "/festivals/sankranti/hero.webp",
      description: "Harvest festival traditions and gatherings.",
    },
  ],
  announcements: [
    {
      id: "seed-update",
      title: "Village updates will sync when online",
      body: "Essential community content remains available in offline mode.",
    },
  ],
  developments: [
    {
      id: "seed-dev",
      title: "Village development updates",
      summary: "Project summaries sync automatically when network is available.",
    },
  ],
};
