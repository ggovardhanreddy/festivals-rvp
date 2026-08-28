"use client";

import { LibrarySection, type Facet } from "./LibrarySection";
import type { LearningItem, Rhyme, ScienceTopic, Story, VideoItem } from "@/lib/learning";

/**
 * The four children's libraries.
 *
 * Each is the same shell with its own facets and its own honest empty state.
 * The reason text differs because the blockers differ: stories and videos
 * wait on permission to publish, rhymes wait on someone in the village
 * actually recording them, science waits on a teacher reading it.
 */

export function StoriesPage({ stories }: { stories: Story[] }) {
  return (
    <LibrarySection
      titleKey="kids.stories"
      ledeKey="kids.stories.lede"
      icon="book"
      items={stories}
      hrefFor={(item) => `/kids/stories/${item.slug}/`}
      facets={AGE_FACETS}
      emptyTitleKey="kids.stories.emptyTitle"
      emptyReasonKey="kids.pending.sourced"
      emptyHelpKey="kids.stories.emptyHelp"
    />
  );
}

export function RhymesPage({ rhymes }: { rhymes: Rhyme[] }) {
  const facets: Facet[] = [
    { id: "telugu", labelKey: "kids.rhymes.telugu", match: (i) => (i as Rhyme).category === "telugu" },
    { id: "english", labelKey: "kids.rhymes.english", match: (i) => (i as Rhyme).category === "english" },
    { id: "counting", labelKey: "kids.rhymes.counting", match: (i) => (i as Rhyme).category === "counting" },
    { id: "festival", labelKey: "kids.rhymes.festival", match: (i) => (i as Rhyme).category === "festival" },
  ];
  return (
    <LibrarySection
      titleKey="kids.rhymes"
      ledeKey="kids.rhymes.lede"
      icon="music"
      items={rhymes}
      hrefFor={(item) => `/kids/rhymes/${item.slug}/`}
      facets={facets}
      emptyTitleKey="kids.rhymes.emptyTitle"
      emptyReasonKey="kids.pending.recorded"
      emptyHelpKey="kids.rhymes.emptyHelp"
    />
  );
}

export function SciencePage({ topics }: { topics: ScienceTopic[] }) {
  const facets: Facet[] = [
    { id: "living-world", labelKey: "kids.science.living", match: (i) => (i as ScienceTopic).topic === "living-world" },
    { id: "plants", labelKey: "kids.science.plants", match: (i) => (i as ScienceTopic).topic === "plants" },
    { id: "weather", labelKey: "kids.science.weather", match: (i) => (i as ScienceTopic).topic === "weather" },
    { id: "space", labelKey: "kids.science.space", match: (i) => (i as ScienceTopic).topic === "space" },
    { id: "body", labelKey: "kids.science.body", match: (i) => (i as ScienceTopic).topic === "body" },
  ];
  return (
    <LibrarySection
      titleKey="kids.science"
      ledeKey="kids.science.lede"
      icon="science"
      items={topics}
      hrefFor={(item) => `/kids/science/${item.slug}/`}
      facets={facets}
      emptyTitleKey="kids.science.emptyTitle"
      emptyReasonKey="kids.pending.reviewed"
      emptyHelpKey="kids.science.emptyHelp"
    />
  );
}

export function VideoLibrary({ videos }: { videos: VideoItem[] }) {
  const facets: Facet[] = [
    { id: "alphabet-reading", labelKey: "video.cat.alphabet", match: (i) => (i as VideoItem).category === "alphabet-reading" },
    { id: "numbers-maths", labelKey: "video.cat.numbers", match: (i) => (i as VideoItem).category === "numbers-maths" },
    { id: "stories", labelKey: "kids.stories", match: (i) => (i as VideoItem).category === "stories" },
    { id: "rhymes", labelKey: "kids.rhymes", match: (i) => (i as VideoItem).category === "rhymes" },
    { id: "science", labelKey: "kids.science", match: (i) => (i as VideoItem).category === "science" },
    { id: "digital-skills", labelKey: "nav.digitalSkills", match: (i) => (i as VideoItem).category === "digital-skills" },
    { id: "general", labelKey: "video.cat.general", match: (i) => (i as VideoItem).category === "general" },
  ];
  return (
    <LibrarySection
      titleKey="kids.videos"
      ledeKey="kids.videos.lede"
      icon="video"
      items={videos}
      hrefFor={(item) => `/kids/videos/${item.slug}/`}
      facets={facets}
      emptyTitleKey="kids.videos.emptyTitle"
      emptyReasonKey="kids.pending.sourced"
      emptyHelpKey="kids.videos.emptyHelp"
    />
  );
}

const AGE_FACETS: Facet[] = [
  { id: "preschool", labelKey: "age.preschool", match: (i) => hasAge(i, "preschool") },
  { id: "5-7", labelKey: "age.5to7", match: (i) => hasAge(i, "5-7") },
  { id: "8-10", labelKey: "age.8to10", match: (i) => hasAge(i, "8-10") },
  { id: "11-13", labelKey: "age.11to13", match: (i) => hasAge(i, "11-13") },
];

function hasAge(item: LearningItem, age: string): boolean {
  return "ageGroup" in item && Array.isArray(item.ageGroup) && item.ageGroup.includes(age);
}
