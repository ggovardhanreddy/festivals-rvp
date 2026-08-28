/**
 * Telugu message catalogue.
 *
 * Deliberately `Partial` — a missing key falls back to English rather than
 * rendering a key name or a machine guess. That keeps coverage honest and
 * measurable: `npm run i18n:coverage` reports the real percentage.
 *
 * Existing strings from lib/i18n-chrome.ts are carried over verbatim so
 * nothing already reviewed changes wording.
 */
import type { en } from "./en";

export const te: Partial<Record<keyof typeof en, string>> = {
  // ---- navigation (carried over from lib/i18n-chrome.ts) ---------------
  "nav.home": "హోమ్",
  "nav.members": "సభ్యులు",
  "nav.heritage": "మన వారసత్వం",
  "nav.heritageArchive": "వారసత్వ ఆర్కైవ్",
  "nav.events": "కార్యక్రమాలు & పుట్టినరోజులు",
  "nav.developments": "అభివృద్ధి",
  "nav.gallery": "గ్యాలరీ",
  "nav.directory": "డైరెక్టరీ",
  "nav.contact": "సంప్రదింపు",
  "nav.funFest": "Fun Fest",
  "nav.documents": "పంచాయతీ పత్రాలు",
  "nav.suggestions": "సూచనలు",
  "nav.timeline": "కాలరేఖ",
  "nav.lostFound": "కోల్పోయినవి / దొరికినవి",
  "nav.search": "వెతకండి",
  "nav.settings": "సెట్టింగులు",
  "nav.privacy": "గోప్యత",
  "nav.terms": "నిబంధనలు",
  "nav.primary": "ప్రధాన నావిగేషన్",
  "nav.openMenu": "మెనూ తెరవండి",
  "nav.closeMenu": "మెనూ మూసివేయండి",
  "nav.installApp": "యాప్‌ను ఇన్‌స్టాల్ చేయండి",
  "nav.quickLinks": "త్వరిత లింకులు",
  "nav.skipToContent": "కంటెంట్‌కు వెళ్లండి",

  // ---- new sections ----------------------------------------------------
  "nav.explore": "అన్వేషించండి",
  "nav.learn": "నేర్చుకోండి",
  "nav.play": "ఆడండి",
  "nav.agriculture": "వ్యవసాయం",
  "nav.community": "సముదాయం",
  "nav.temples": "దేవాలయాలు",
  "nav.careers": "ఉద్యోగాలు",
  "nav.more": "మరిన్ని",
  "nav.kids": "పిల్లలు",
  "nav.english": "ఇంగ్లీష్",
  "nav.engineering": "ఇంజనీరింగ్",
  "nav.it": "ఐటీ",
  "nav.weather": "వాతావరణం",
  "nav.government": "ప్రభుత్వ సేవలు",
  "nav.digitalSkills": "డిజిటల్ నైపుణ్యాలు",
  "nav.years": "వార్షిక ఆర్కైవ్",

  // ---- common ----------------------------------------------------------
  "common.viewAll": "అన్నీ చూడండి",
  "common.back": "వెనుకకు",
  "common.next": "తదుపరి",
  "common.previous": "మునుపటి",
  "common.close": "మూసివేయండి",
  "common.cancel": "రద్దు",
  "common.retry": "మళ్లీ ప్రయత్నించండి",
  "common.loading": "లోడ్ అవుతోంది...",
  "common.readMore": "మరింత చదవండి",
  "common.comingSoon": "త్వరలో",
  "common.free": "అందరికీ ఉచితం",
  "common.theme": "థీమ్",

  // ---- language --------------------------------------------------------
  "lang.label": "భాష",
  "lang.en": "English",
  "lang.te": "తెలుగు",
  "lang.notTranslated": "ఈ పేజీ ఇంకా తెలుగులో అందుబాటులో లేదు.",
  "lang.lede": "సైట్‌ను English / తెలుగు మధ్య మార్చండి.",

  // ---- search ----------------------------------------------------------
  "search.title": "వెతకండి",
  "search.placeholder": "మీరు ఏమి వెతుకుతున్నారు?",
  "search.label": "రెడ్డివారిపల్లిలో వెతకండి",
  "search.submit": "వెతకండి",
  "search.clear": "తొలగించండి",
  "search.voice": "మాట్లాడి వెతకండి",
  "search.popular": "ప్రముఖ శోధనలు",
  "search.recent": "ఇటీవలి శోధనలు",
  "search.noResultsHint": "వేరే పదంతో ప్రయత్నించండి.",
  "search.loading": "వెతుకుతోంది...",
  "search.error": "శోధన ప్రస్తుతం అందుబాటులో లేదు.",
  "search.filters": "వడపోతలు",
  "search.allSections": "అన్నీ",

  // ---- sections --------------------------------------------------------
  "section.village": "గ్రామం",
  "section.temples": "దేవాలయాలు",
  "section.heritage": "వారసత్వం",
  "section.community": "సముదాయం",
  "section.learn": "నేర్చుకోండి",
  "section.games": "ఆటలు",
  "section.kids": "పిల్లలు",
  "section.agriculture": "వ్యవసాయం",
  "section.english": "ఇంగ్లీష్",
  "section.engineering": "ఇంజనీరింగ్",
  "section.it": "ఐటీ",
  "section.careers": "ఉద్యోగాలు",
  "section.government": "ప్రభుత్వ సేవలు",
  "section.weather": "వాతావరణం",
  "section.people": "ప్రజలు",

  // ---- errors and empty states ----------------------------------------
  "error.404.title": "పేజీ కనబడలేదు",
  "error.404.body": "ఆ పేజీ లేదు, లేదా మార్చబడింది.",
  "error.404.action": "హోమ్‌కు వెళ్లండి",
  "error.generic.title": "ఏదో తప్పు జరిగింది",
  "error.offline.title": "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు",
  "empty.generic": "ఇంకా ఏమీ లేదు.",
  "empty.results": "ఫలితాలు లేవు.",

  // ---- forms -----------------------------------------------------------
  "form.required": "తప్పనిసరి",
  "form.optional": "ఐచ్ఛికం",
  "form.submit": "పంపండి",
  "form.name": "పేరు",
  "form.message": "సందేశం",
};
