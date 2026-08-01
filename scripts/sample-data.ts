import fs from "node:fs";
import path from "node:path";
import type { Album, FestivalKey } from "../lib/types";

const root = process.cwd();

function writeSvg(filePath: string, title: string, year: string, tone: [string, string]) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${tone[0]}"/><stop offset="1" stop-color="${tone[1]}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="220" cy="180" r="120" fill="rgba(255,255,255,.12)"/>
  <circle cx="1380" cy="780" r="180" fill="rgba(255,255,255,.10)"/>
  <text x="50%" y="46%" text-anchor="middle" fill="white" font-size="72" font-family="Georgia, serif">${title}</text>
  <text x="50%" y="56%" text-anchor="middle" fill="rgba(255,255,255,.85)" font-size="28" font-family="Arial, sans-serif">RVP Memories · ${year}</text>
</svg>`;
  fs.writeFileSync(filePath, svg);
}

function makeAlbum(input: {
  year: string;
  category: "Festivals" | "Birthdays";
  slug: string;
  title: string;
  description: string;
  story: string;
  notes: string[];
  festival?: FestivalKey;
  personName?: string;
  birthdayDate?: string;
  tone: [string, string];
}): Album {
  const cat = input.category.toLowerCase();
  const imgDir = path.join(root, "public/images", input.year, cat, input.slug);
  const thumbDir = path.join(root, "public/thumbs", input.year, cat, input.slug);
  const file = `${input.slug}.svg`;
  writeSvg(path.join(imgDir, file), input.title, input.year, input.tone);
  writeSvg(path.join(thumbDir, file), input.title, input.year, input.tone);

  const mediaPath = `/images/${input.year}/${cat}/${input.slug}/${file}`;
  const thumbPath = `/thumbs/${input.year}/${cat}/${input.slug}/${file}`;

  const album: Album = {
    year: input.year,
    category: input.category,
    slug: input.slug,
    title: input.title,
    description: input.description,
    story: input.story,
    notes: input.notes,
    cover: thumbPath,
    published: true,
    order: 0,
    festival: input.festival,
    personName: input.personName,
    birthdayDate: input.birthdayDate,
    media: [
      {
        id: `${input.year}-${input.slug}-1`,
        file: mediaPath,
        thumb: thumbPath,
        type: "image",
        title: `${input.title} · cover`,
        date: `${input.year}-01-15`,
        tags: [cat, input.festival || "birthday"],
        favorite: true,
        width: 1600,
        height: 1000,
        note: input.notes[0],
      },
      {
        id: `${input.year}-${input.slug}-2`,
        file: mediaPath,
        thumb: thumbPath,
        type: "image",
        title: `${input.title} · memory`,
        date: `${input.year}-01-16`,
        tags: [cat],
        width: 1600,
        height: 1000,
      },
    ],
  };

  const dir = path.join(root, "content", input.year, input.category, input.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "metadata.json"), JSON.stringify(album, null, 2));
  return album;
}

// Clear previous sample categories that are no longer part of the site.
for (const year of ["2023", "2024", "2025", "2026"]) {
  for (const gone of ["Trips", "Family", "Documents", "Videos", "Misc"]) {
    fs.rmSync(path.join(root, "content", year, gone), {
      recursive: true,
      force: true,
    });
  }
  fs.rmSync(path.join(root, "content", year, "Festivals", "diwali-lights"), {
    recursive: true,
    force: true,
  });
  fs.rmSync(path.join(root, "content", year, "Festivals", "sankranti-home"), {
    recursive: true,
    force: true,
  });
}

const samples = [
  makeAlbum({
    year: "2026",
    category: "Festivals",
    slug: "sankranthi",
    title: "Sankranthi 2026",
    festival: "sankranthi",
    description: "A golden morning of rangoli, sesame sweets, and family light.",
    story:
      "The courtyard filled early. Patterns bloomed in color, laughter carried through the house, and the year began the way it always has — together.",
    notes: [
      "The first rangoli was finished before breakfast.",
      "Everyone gathered for the evening lamp lighting.",
    ],
    tone: ["#8a5a2b", "#d9a15c"],
  }),
  makeAlbum({
    year: "2025",
    category: "Festivals",
    slug: "vinayaka-chavithi",
    title: "Vinayaka Chavithi 2025",
    festival: "vinayaka-chavithi",
    description: "Devotion, clay, and soft lamp light at home.",
    story:
      "A quiet puja, fresh flowers, and the familiar comfort of beginning again with Vinayaka’s blessing.",
    notes: ["The idol arrived with morning jasmine.", "Prayers felt unhurried and warm."],
    tone: ["#2f4a3c", "#8fb39a"],
  }),
  makeAlbum({
    year: "2024",
    category: "Festivals",
    slug: "sankranthi",
    title: "Sankranthi 2024",
    festival: "sankranthi",
    description: "Harvest colors and the sweetness of shared tradition.",
    story:
      "From kitchen aromas to evening gatherings, Sankranthi 2024 felt bright, simple, and full of home.",
    notes: ["Kite colors against a clear sky.", "A long lunch that lasted into dusk."],
    tone: ["#7a3e2b", "#e0b07a"],
  }),
  makeAlbum({
    year: "2026",
    category: "Birthdays",
    slug: "govardhan",
    title: "Govardhan’s Birthday",
    personName: "Govardhan Reddy",
    birthdayDate: "2026-03-12",
    description: "A celebration wrapped in gratitude and quiet joy.",
    story:
      "Candles, familiar faces, and the soft feeling of another year held with care.",
    notes: [
      "The cake was shared before the photos were done.",
      "A toast to health and home.",
    ],
    tone: ["#3d2a45", "#c49b6c"],
  }),
  makeAlbum({
    year: "2025",
    category: "Birthdays",
    slug: "family-birthday",
    title: "A Family Birthday",
    personName: "Beloved Family",
    birthdayDate: "2025-08-20",
    description: "Laughter around the table and a night of remembered songs.",
    story:
      "Simple decorations, favorite dishes, and memories that already feel timeless.",
    notes: [
      "Someone saved the first slice for later.",
      "The playlist never left the 90s.",
    ],
    tone: ["#243447", "#8fa6c0"],
  }),
];

console.log(
  `Created ${samples.length} premium sample albums (Sankranthi, Vinayaka Chavithi, Birthdays).`,
);
