export type MediaType = "image" | "video";

export type FestivalKey = "sankranthi" | "vinayaka-chavithi";

export type BucketKey =
  "sankranthi" | "vinayaka-chavithi" | "rvp-birthdays" | "fun-trips";

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
  blurDataURL?: string;
  sha256?: string;
  phash?: string;
};

export type Album = {
  year: string;
  category: "Festivals" | "Birthdays" | "Trips";
  slug: string;
  title: string;
  description: string;
  story?: string;
  notes?: string[];
  cover?: string;
  published: boolean;
  order: number;
  media: Media[];
  bucket?: BucketKey;
  festival?: FestivalKey;
  personName?: string;
  birthdayDate?: string;
};

export type MediaWithAlbum = Media & { album: Album };
