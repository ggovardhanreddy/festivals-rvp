import type { ContentItem } from "@/lib/production/types";

export async function getPublishedContent(category?: string, limit = 50): Promise<ContentItem[]> {
  void category;
  void limit;
  return [];
}
export async function getContentBySlug(slug: string): Promise<ContentItem | null> {
  void slug;
  return null;
}
