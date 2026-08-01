export type MediaType = "image" | "video";

export type FestivalKey = "sankranthi" | "vinayaka-chavithi";

export type Media = {
  id: string;
  file: string;
  thumb: string;
  type: MediaType;
  title: string;
  date: string;
  tags: string[];
  favorite?: boolean;
  width?: number;
  height?: number;
  note?: string;
};

export type Album = {
  year: string;
  category: "Festivals" | "Birthdays";
  slug: string;
  title: string;
  description: string;
  story?: string;
  notes?: string[];
  cover?: string;
  published: boolean;
  order: number;
  media: Media[];
  /** Festivals only */
  festival?: FestivalKey;
  /** Birthdays only */
  personName?: string;
  birthdayDate?: string;
};

export type MediaWithAlbum = Media & { album: Album };
