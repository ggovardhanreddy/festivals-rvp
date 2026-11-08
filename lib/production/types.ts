export type ContentItem = {
  id: string; slug: string; title: string; title_te: string | null;
  summary: string | null; body: string | null; body_te: string | null;
  category: string; cover_image: string | null; published: boolean;
  featured: boolean; event_date: string | null; created_at: string;
};
