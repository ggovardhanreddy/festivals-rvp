/**
 * Content loaders. Build-time only.
 *
 * Separate from ./index because these touch the filesystem and client
 * components import the types and helpers from there. Keeping the two apart
 * is what stops `node:fs` being pulled into a browser bundle.
 */
import { loadTyped } from "@/lib/content/load";
import type { Rhyme, ScienceTopic, Story, VideoItem } from "./index";

export function loadStories(): Story[] {
  return loadTyped<Story>("story");
}
export function loadRhymes(): Rhyme[] {
  return loadTyped<Rhyme>("rhyme");
}
export function loadScienceTopics(): ScienceTopic[] {
  return loadTyped<ScienceTopic>("science-topic");
}
export function loadVideos(): VideoItem[] {
  return loadTyped<VideoItem>("video");
}
