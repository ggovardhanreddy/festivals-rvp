/** Bilingual Telugu calendar label dictionaries (English key → Telugu). */

export const TITHI_TE: Record<string, string> = {
  Pratipada: "పాడ్యమి",
  Dwitiya: "విదియ",
  Tritiya: "తదియ",
  Chaturthi: "చవితి",
  Panchami: "పంచమి",
  Shashthi: "షష్ఠి",
  Saptami: "సప్తమి",
  Ashtami: "అష్టమి",
  Navami: "నవమి",
  Dashami: "దశమి",
  Ekadashi: "ఏకాదశి",
  Dwadashi: "ద్వాదశి",
  Trayodashi: "త్రయోదశి",
  Chaturdashi: "చతుర్దశి",
  Purnima: "పూర్ణిమ",
  Amavasya: "అమావాస్య",
};

export const NAKSHATRA_TE: Record<string, string> = {
  Ashwini: "అశ్విని",
  Bharani: "భరణి",
  Krittika: "కృత్తిక",
  Rohini: "రోహిణి",
  Mrigashira: "మృగశిర",
  Ardra: "ఆర్ద్ర",
  Punarvasu: "పునర్వసు",
  Pushya: "పుష్యమి",
  Ashlesha: "ఆశ్లేష",
  Magha: "మఘ",
  "Purva Phalguni": "పూర్వ ఫల్గుణి",
  "Uttara Phalguni": "ఉత్తర ఫల్గుణి",
  Hasta: "హస్త",
  Chitra: "చిత్త",
  Swati: "స్వాతి",
  Vishakha: "విశాఖ",
  Anuradha: "అనూరాధ",
  Jyeshtha: "జ్యేష్ఠ",
  Mula: "మూల",
  "Purva Ashadha": "పూర్వాషాఢ",
  "Uttara Ashadha": "ఉత్తరాషాఢ",
  Shravana: "శ్రవణం",
  Dhanishta: "ధనిష్ఠ",
  Shatabhisha: "శతభిష",
  "Purva Bhadrapada": "పూర్వ భాద్రపద",
  "Uttara Bhadrapada": "ఉత్తర భాద్రపద",
  Revati: "రేవతి",
};

export const NAKSHATRA_ALIASES: Record<string, string> = {
  Aswini: "Ashwini",
  Krithika: "Krittika",
  Mrigasira: "Mrigashira",
  Aardra: "Ardra",
  Pushyami: "Pushya",
  Aslesha: "Ashlesha",
  Makha: "Magha",
  Pubba: "Purva Phalguni",
  "Poorva Phalguni": "Purva Phalguni",
  Chitta: "Chitra",
  Swathi: "Swati",
  Visakha: "Vishakha",
  Jyeshta: "Jyeshtha",
  Moola: "Mula",
  Poorvashada: "Purva Ashadha",
  Purvashadha: "Purva Ashadha",
  Uttarashada: "Uttara Ashadha",
  Uttarashadha: "Uttara Ashadha",
  Sravana: "Shravana",
  Dhanishtha: "Dhanishta",
  Satabhisha: "Shatabhisha",
  Poorvabhadra: "Purva Bhadrapada",
  Uttarabhadra: "Uttara Bhadrapada",
};

export const VARA_TE: Record<string, string> = {
  Sunday: "ఆదివారం",
  Monday: "సోమవారం",
  Tuesday: "మంగళవారం",
  Wednesday: "బుధవారం",
  Thursday: "గురువారం",
  Friday: "శుక్రవారం",
  Saturday: "శనివారం",
};

export const VARA_TE_SHORT: Record<string, string> = {
  Sunday: "ఆది",
  Monday: "సోమ",
  Tuesday: "మంగళ",
  Wednesday: "బుధ",
  Thursday: "గురు",
  Friday: "శుక్ర",
  Saturday: "శని",
};

export const MASA_TE: Record<string, string> = {
  Chaitra: "చైత్రం",
  Vaishakha: "వైశాఖం",
  Jyeshtha: "జ్యేష్ఠం",
  Ashadha: "ఆషాఢం",
  Shravana: "శ్రావణం",
  Bhadrapada: "భాద్రపదం",
  Ashwin: "ఆశ్వయుజం",
  Ashwayuja: "ఆశ్వయుజం",
  Kartika: "కార్తీకం",
  Margashirsha: "మార్గశిరం",
  Pausha: "పుష్యం",
  Magha: "మాఘం",
  Phalguna: "ఫాల్గుణం",
};

export const PAKSHA_TE: Record<string, string> = {
  Shukla: "శుక్ల పక్షం",
  Krishna: "కృష్ణ పక్షం",
};

export const WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function bareTithiName(full: string): string {
  const cleaned = full
    .replace(/^(Shukla|Krishna)\s+/i, "")
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
  const aliases: Record<string, string> = {
    Padya: "Pratipada",
    Padyami: "Pratipada",
    Prathama: "Pratipada",
    Vidya: "Dwitiya",
    Vidiya: "Dwitiya",
    Thadiya: "Tritiya",
    Chavithi: "Chaturthi",
    Shashti: "Shashthi",
    Sashti: "Shashthi",
    Poornima: "Purnima",
  };
  return aliases[cleaned] || cleaned;
}

export function normalizeNakshatra(name: string): string {
  const trimmed = name.trim();
  return NAKSHATRA_ALIASES[trimmed] || trimmed;
}

export function tithiTe(fullOrBare: string): string {
  const bare = bareTithiName(fullOrBare);
  return TITHI_TE[bare] || bare;
}

export function nakshatraTe(name: string): string {
  const key = normalizeNakshatra(name);
  return NAKSHATRA_TE[key] || name;
}

export function masaTe(name: string): string {
  return MASA_TE[name] || name;
}

export function varaTe(englishName: string): string {
  return VARA_TE[englishName] || englishName;
}

export function varaTeShort(englishName: string): string {
  return VARA_TE_SHORT[englishName] || englishName.slice(0, 3);
}

export function pakshaTe(paksha: string): string {
  return PAKSHA_TE[paksha] || paksha;
}
