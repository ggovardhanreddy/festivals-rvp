export type VillageSpot = {
  id: string;
  label: string;
  blurb: string;
  x: number;
  y: number;
  href: string;
  memoryHint: string;
};

export const VILLAGE_SPOTS: VillageSpot[] = [
  {
    id: "entrance",
    label: "Village Entrance",
    blurb: "Where every gathering begins — dust, greetings, and open gates.",
    x: 16,
    y: 66,
    href: "/fun-trips/",
    memoryHint: "Arrivals & journeys",
  },
  {
    id: "temple",
    label: "Ramalayam",
    blurb: "రామాలయం — bell tones and lamp light at the heart of Kondreddigaripalli.",
    x: 46,
    y: 42,
    href: "/vinayaka-chavithi/",
    memoryHint: "Temple prayers",
  },
  {
    id: "school",
    label: "School",
    blurb: "Chalk dust and childhood — the first lessons of belonging.",
    x: 48,
    y: 42,
    href: "/about/",
    memoryHint: "Growing years",
  },
  {
    id: "ground",
    label: "Ground",
    blurb: "Evenings of cricket, laughter, and sky wide enough for dreams.",
    x: 38,
    y: 60,
    href: "/fun-trips/",
    memoryHint: "Play & gatherings",
  },
  {
    id: "lake",
    label: "Lake",
    blurb: "Still water holding the village sky — a place to pause.",
    x: 78,
    y: 34,
    href: "/years/",
    memoryHint: "Quiet frames",
  },
  {
    id: "road",
    label: "Main Road",
    blurb: "The ribbon that ties farms, homes, and festival routes together.",
    x: 52,
    y: 78,
    href: "/fun-trips/",
    memoryHint: "Through the years",
  },
  {
    id: "festival",
    label: "Festival Area",
    blurb: "Rangoli, sweets, and the bright pulse of Sankranthi gatherings.",
    x: 62,
    y: 56,
    href: "/sankranthi/",
    memoryHint: "Celebration ground",
  },
];

export const VILLAGE_QUOTES = [
  "Home is not a place we leave — it is a place we carry.",
  "Every festival is a promise renewed under the same sky.",
  "In lamp light, we remember who we are together.",
  "The village keeps our stories even when we forget the dates.",
  "Dust roads, warm kitchens, and laughter that outlives the night.",
];

export const VILLAGE_STORY = {
  eyebrow: "Kondreddigaripalli",
  title: "A place held by memory",
  lede: "RVP Youth preserves the living culture of Kondreddigaripalli (Reddivaripalli) — festivals, traditions, and the people who make home eternal.",
  chapters: [
    {
      title: "Our Culture",
      body: "Respect, togetherness, and the quiet dignity of Annamayya district village life — passed hand to hand, generation to generation.",
    },
    {
      title: "Our Culture & Traditions",
      body: "Reddivaripalli is a village where festivals are celebrated with immense joy, devotion, and unity — Vinayaka Chavithi, Varalakshmi Vratam, Sankranti, Sri Rama Navami, Mathamma Jathara, Devapatlamma Jathara, Ugadi, Deepavali, and Dasara.",
    },
    {
      title: "Our Traditions",
      body: "From temple steps to festival grounds, ritual becomes belonging — and belonging becomes memory.",
    },
    {
      title: "Our Journey",
      body: "Birthdays, trips, and ordinary evenings in Reddivaripalli that somehow became extraordinary because we were together.",
    },
  ],
};
