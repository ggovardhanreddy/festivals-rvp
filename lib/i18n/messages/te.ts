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

  // ---- homepage doors --------------------------------------------------
  "door.kids": "\u0c2a\u0c3f\u0c32\u0c4d\u0c32\u0c32\u0c41",
  "door.kids.tag": "\u0c06\u0c1f \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c2a\u0c3e\u0c20\u0c02",
  "door.students": "\u0c35\u0c3f\u0c26\u0c4d\u0c2f\u0c3e\u0c30\u0c4d\u0c25\u0c41\u0c32\u0c41",
  "door.students.tag": "\u0c1a\u0c26\u0c35\u0c02\u0c21\u0c3f, \u0c0e\u0c26\u0c17\u0c02\u0c21\u0c3f",
  "door.farmers": "\u0c30\u0c48\u0c24\u0c41\u0c32\u0c41",
  "door.farmers.tag": "\u0c35\u0c4d\u0c2f\u0c35\u0c38\u0c3e\u0c2f \u0c38\u0c39\u0c3e\u0c2f\u0c02",
  "door.careers.tag": "\u0c09\u0c26\u0c4d\u0c2f\u0c4b\u0c17\u0c3e\u0c32\u0c41, \u0c28\u0c48\u0c2a\u0c41\u0c23\u0c4d\u0c2f\u0c3e\u0c32\u0c41",
  "door.seniors": "\u0c2a\u0c46\u0c26\u0c4d\u0c26\u0c32\u0c41",
  "door.seniors.tag": "\u0c38\u0c30\u0c33 \u0c2e\u0c4b\u0c21\u0c4d",
  "door.explore": "\u0c05\u0c28\u0c4d\u0c35\u0c47\u0c37\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f",
  "door.explore.tag": "\u0c2e\u0c30\u0c3f\u0c28\u0c4d\u0c28\u0c3f \u0c1a\u0c42\u0c21\u0c02\u0c21\u0c3f",
  "home.whatDoYouWant": "\u0c2e\u0c40\u0c30\u0c41 \u0c0f\u0c2e\u0c3f \u0c1a\u0c47\u0c2f\u0c3e\u0c32\u0c28\u0c41\u0c15\u0c41\u0c02\u0c1f\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c30\u0c41?",
  "home.explore": "\u0c05\u0c28\u0c4d\u0c35\u0c47\u0c37\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f",
  "home.today": "\u0c08 \u0c30\u0c4b\u0c1c\u0c41 \u0c30\u0c46\u0c21\u0c4d\u0c21\u0c3f\u0c35\u0c3e\u0c30\u0c3f\u0c2a\u0c32\u0c4d\u0c32\u0c3f",
  "home.dailyChallenge": "\u0c08\u0c28\u0c3e\u0c1f\u0c3f \u0c38\u0c35\u0c3e\u0c32\u0c41",
  "home.playAndLearn": "\u0c06\u0c21\u0c41\u0c24\u0c42 \u0c28\u0c47\u0c30\u0c4d\u0c1a\u0c41\u0c15\u0c4b\u0c02\u0c21\u0c3f",
  "home.askRvp": "\u0c30\u0c46\u0c21\u0c4d\u0c21\u0c3f\u0c35\u0c3e\u0c30\u0c3f\u0c2a\u0c32\u0c4d\u0c32\u0c3f\u0c28\u0c3f \u0c05\u0c21\u0c17\u0c02\u0c21\u0c3f",
  "home.promise.free": "100% \u0c09\u0c1a\u0c3f\u0c24\u0c02",
  "home.promise.noSignup": "\u0c16\u0c3e\u0c24\u0c3e \u0c05\u0c35\u0c38\u0c30\u0c02 \u0c32\u0c47\u0c26\u0c41",
  "home.promise.kids": "\u0c2a\u0c3f\u0c32\u0c4d\u0c32\u0c32\u0c15\u0c41 \u0c38\u0c41\u0c30\u0c15\u0c4d\u0c37\u0c3f\u0c24\u0c02",

  // ---- games ------------------------------------------------------------
  "game.play": "\u0c07\u0c2a\u0c4d\u0c2a\u0c41\u0c21\u0c47 \u0c06\u0c21\u0c02\u0c21\u0c3f",
  "game.newGame": "\u0c15\u0c4a\u0c24\u0c4d\u0c24 \u0c06\u0c1f",
  "game.check": "\u0c38\u0c30\u0c3f\u0c1a\u0c42\u0c21\u0c02\u0c21\u0c3f",
  "game.correct": "\u0c38\u0c30\u0c48\u0c28\u0c26\u0c3f",
  "game.wrong": "\u0c15\u0c3e\u0c26\u0c41",
  "game.score": "\u0c38\u0c4d\u0c15\u0c4b\u0c30\u0c41",
  "game.playAgain": "\u0c2e\u0c33\u0c4d\u0c32\u0c40 \u0c06\u0c21\u0c02\u0c21\u0c3f",

  // ---- player -----------------------------------------------------------
  "player.enterName": "\u0c2e\u0c40 \u0c2a\u0c47\u0c30\u0c41 \u0c30\u0c3e\u0c2f\u0c02\u0c21\u0c3f",
  "player.nameHint": "\u0c15\u0c47\u0c35\u0c32\u0c02 \u0c2e\u0c3e\u0c30\u0c41\u0c2a\u0c47\u0c30\u0c41. \u0c16\u0c3e\u0c24\u0c3e \u0c05\u0c35\u0c38\u0c30\u0c02 \u0c32\u0c47\u0c26\u0c41.",
  "player.start": "\u0c06\u0c21\u0c1f\u0c02 \u0c2e\u0c4a\u0c26\u0c32\u0c41\u0c2a\u0c46\u0c1f\u0c4d\u0c1f\u0c02\u0c21\u0c3f",
  "player.points": "\u0c2a\u0c3e\u0c2f\u0c3f\u0c02\u0c1f\u0c4d\u0c32\u0c41",
  "player.level": "\u0c32\u0c46\u0c35\u0c32\u0c4d",
  "player.badges": "\u0c2c\u0c4d\u0c2f\u0c3e\u0c21\u0c4d\u0c1c\u0c4d\u0c32\u0c41",

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
