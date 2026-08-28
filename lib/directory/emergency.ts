/**
 * Emergency helplines.
 *
 * Every number here was read off an official page, and the page is cited on
 * the entry. A wrong emergency number is the single most dangerous thing
 * this site could publish, so nothing goes in from memory.
 *
 * Verified 2026-08-28 against:
 *   - 112.gov.in/about (ERSS; states that 100, 101, 108 and 181 are being
 *     integrated into 112)
 *   - ncw.gov.in/other-useful-helplines (181, 1098, 1930, NCW 7827170170)
 *   - consumerhelpline.gov.in (1915)
 */
export type Helpline = {
  id: string;
  number: string;
  name: string;
  nameTe?: string;
  description: string;
  descriptionTe?: string;
  source: string;
  sourceUrl: string;
  lastVerified: string;
};

const V = "2026-08-28";
const ERSS = { source: "Emergency Response Support System", sourceUrl: "https://112.gov.in/about", lastVerified: V };
const NCW = { source: "National Commission for Women — helplines", sourceUrl: "https://www.ncw.gov.in/other-useful-helplines/", lastVerified: V };

export const HELPLINES: Helpline[] = [
  {
    id: "erss",
    number: "112",
    name: "All emergencies",
    nameTe: "అన్ని అత్యవసర పరిస్థితులు",
    description:
      "One number for police, fire and ambulance. The older numbers 100, 101, 108 and 181 are being brought into it.",
    descriptionTe:
      "పోలీసు, అగ్నిమాపక, అంబులెన్స్ — అన్నింటికీ ఒకే నంబరు. పాత 100, 101, 108, 181 నంబర్లు దీనిలో కలుస్తున్నాయి.",
    ...ERSS,
  },
  {
    id: "women",
    number: "181",
    name: "Women helpline",
    nameTe: "మహిళల హెల్ప్‌లైన్",
    description: "National women helpline.",
    descriptionTe: "జాతీయ మహిళా హెల్ప్‌లైన్.",
    ...NCW,
  },
  {
    id: "ncw",
    number: "7827170170",
    name: "NCW 24×7 women helpline",
    nameTe: "ఎన్‌సీడబ్ల్యూ మహిళా హెల్ప్‌లైన్",
    description: "National Commission for Women, round the clock.",
    ...NCW,
  },
  {
    id: "child",
    number: "1098",
    name: "Child helpline",
    nameTe: "చైల్డ్ హెల్ప్‌లైన్",
    description: "National child helpline (CHILDLINE).",
    descriptionTe: "జాతీయ బాలల హెల్ప్‌లైన్.",
    ...NCW,
  },
  {
    id: "cyber",
    number: "1930",
    name: "Cyber and financial fraud",
    nameTe: "సైబర్ / ఆర్థిక మోసం",
    description:
      "Call immediately if money has left your account. Report online at cybercrime.gov.in.",
    descriptionTe:
      "మీ ఖాతా నుండి డబ్బు పోతే వెంటనే కాల్ చేయండి. cybercrime.gov.in లో ఫిర్యాదు చేయవచ్చు.",
    ...NCW,
  },
  {
    id: "consumer",
    number: "1915",
    name: "Consumer helpline",
    nameTe: "వినియోగదారుల హెల్ప్‌లైన్",
    description: "National Consumer Helpline, 8am to 8pm.",
    source: "National Consumer Helpline",
    sourceUrl: "https://consumerhelpline.gov.in/",
    lastVerified: V,
  },
];
