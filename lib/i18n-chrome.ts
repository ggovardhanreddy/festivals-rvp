export type UiLang = "en" | "te";

export const UI_LANG_KEY = "rvp-ui-lang";

/** Chrome labels keyed by href or stable id. */
export const CHROME_EN: Record<string, string> = {
  "/": "Home",
  "/members/": "Members",
  "/about/": "Our Heritage",
  "/events/": "Events & Birthdays",
  "/developments/": "Developments",
  "/gallery/": "Gallery",
  "/directory/": "Directory",
  "/contact/": "Contact",
  "/heritage/": "Heritage Archive",
  "/fun-trips/": "Fun Fest",
  "/documents/": "Panchayat Documents",
  "/suggestions/": "Suggestions",
  "/timeline/": "Timeline",
  "/lost-found/": "Lost & Found",
  "/search/": "Search",
  "/settings/": "Settings",
  "/privacy/": "Privacy",
  "/terms/": "Terms",
  "install-app": "Install App",
  "open-menu": "Open menu",
  "close-menu": "Close menu",
  "edit-mode": "Edit Mode",
  "editing": "Editing",
  "exit-edit": "Exit Edit Mode",
  "enter-edit": "Enter Edit Mode",
  "admin": "Admin",
  "admin-dashboard": "Admin dashboard",
  "primary-nav": "Primary",
  "theme": "Theme",
  "language": "Language",
  "language-en": "English",
  "language-te": "Telugu",
  "language-lede":
    "Switch site chrome between English and Telugu. Festival panchangam stays bilingual.",
  "settings-title": "Settings",
  "settings-lede":
    "Manage privacy, language, and alert preferences for this device. Changes stay in your browser and are never required to use the site.",
  "quick-links": "Quick links",
  "footer-contact": "Contact",
  "open-maps": "Open in Google Maps",
  "email-us": "Email us",
};

export const CHROME_TE: Record<string, string> = {
  "/": "\u0c39\u0c4b\u0c2e\u0c4d",
  "/members/": "\u0c38\u0c2d\u0c4d\u0c2f\u0c41\u0c32\u0c41",
  "/about/": "\u0c2e\u0c28\u0c20\u0c35\u0c3e\u0c30\u0c38\u0c24\u0c4d\u0c35\u0c02",
  "/events/": "\u0c15\u0c3e\u0c30\u0c4d\u0c2f\u0c15\u0c4d\u0c30\u0c2e\u0c3e\u0c32\u0c41 & \u0c2a\u0c41\u0c1f\u0c4d\u0c1f\u0c3f\u0c28\u0c30\u0c4b\u0c1c\u0c41\u0c32\u0c41",
  "/developments/": "\u0c05\u0c2d\u0c3f\u0c35\u0c43\u0c26\u0c4d\u0c27\u0c3f",
  "/gallery/": "\u0c17\u0c4d\u0c2f\u0c3e\u0c32\u0c30\u0c40",
  "/directory/": "\u0c21\u0c48\u0c30\u0c46\u0c15\u0c4d\u0c1f\u0c30\u0c40",
  "/contact/": "\u0c38\u0c02\u0c2a\u0c4d\u0c30\u0c26\u0c3f\u0c02\u0c2a\u0c41",
  "/heritage/": "\u0c35\u0c3e\u0c30\u0c38\u0c24\u0c4d\u0c35 \u0c06\u0c30\u0c4d\u0c15\u0c48\u0c35\u0c4d",
  "/fun-trips/": "Fun Fest",
  "/documents/": "\u0c2a\u0c02\u0c1a\u0c3e\u0c2f\u0c24\u0c40 \u0c2a\u0c24\u0c4d\u0c30\u0c3e\u0c32\u0c41",
  "/suggestions/": "\u0c38\u0c42\u0c1a\u0c28\u0c32\u0c41",
  "/timeline/": "\u0c15\u0c3e\u0c32\u0c30\u0c47\u0c16",
  "/lost-found/": "\u0c15\u0c4b\u0c32\u0c4d\u0c2a\u0c4b\u0c2f\u0c3f\u0c28\u0c35\u0c3f / \u0c26\u0c4a\u0c30\u0c3f\u0c15\u0c3f\u0c28\u0c35\u0c3f",
  "/search/": "\u0c35\u0c46\u0c24\u0c15\u0c02\u0c21\u0c3f",
  "/settings/": "\u0c38\u0c46\u0c1f\u0c4d\u0c1f\u0c3f\u0c02\u0c17\u0c41\u0c32\u0c41",
  "/privacy/": "\u0c17\u0c4b\u0c2a\u0c4d\u0c2f\u0c24",
  "/terms/": "\u0c28\u0c3f\u0c2c\u0c02\u0c27\u0c28\u0c32\u0c41",
  "install-app": "\u0c2f\u0c3e\u0c2a\u0c4d\u0c28\u0c41 \u0c07\u0c28\u0c4d\u0c38\u0c4d\u0c1f\u0c3e\u0c32\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f",
  "open-menu": "\u0c2e\u0c46\u0c28\u0c42 \u0c24\u0c46\u0c30\u0c35\u0c02\u0c21\u0c3f",
  "close-menu": "\u0c2e\u0c46\u0c28\u0c42 \u0c2e\u0c42\u0c38\u0c3f\u0c35\u0c47\u0c2f\u0c02\u0c21\u0c3f",
  "edit-mode": "Edit Mode",
  "editing": "Editing",
  "exit-edit": "Exit Edit Mode",
  "enter-edit": "Enter Edit Mode",
  "admin": "Admin",
  "admin-dashboard": "Admin dashboard",
  "primary-nav": "\u0c2a\u0c4d\u0c30\u0c27\u0c3e\u0c28 \u0c28\u0c3e\u0c35\u0c3f\u0c17\u0c47\u0c37\u0c28\u0c4d",
  "theme": "\u0c25\u0c40\u0c2e\u0c4d",
  "language": "\u0c2d\u0c3e\u0c37",
  "language-en": "English",
  "language-te": "\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41",
  "language-lede": "\u0c38\u0c48\u0c1f\u0c4d \u0c2e\u0c46\u0c28\u0c42\u0c28\u0c41 English / \u0c24\u0c46\u0c32\u0c41\u0c17\u0c41 \u0c2e\u0c27\u0c4d\u0c2f \u0c2e\u0c3e\u0c30\u0c4d\u0c1a\u0c02\u0c21\u0c3f.",
  "settings-title": "\u0c38\u0c46\u0c1f\u0c4d\u0c1f\u0c3f\u0c02\u0c17\u0c41\u0c32\u0c41",
  "settings-lede": "\u0c17\u0c4b\u0c2a\u0c4d\u0c2f\u0c24, \u0c2d\u0c3e\u0c37, alerts \u2014 \u0c08\u0c2a\u0c30\u0c3f\u0c15\u0c30\u0c02 \u0c2a\u0c48.",
  "quick-links": "\u0c24\u0c4d\u0c35\u0c30\u0c3f\u0c24 \u0c32\u0c3f\u0c02\u0c15\u0c41\u0c32\u0c41",
  "footer-contact": "\u0c38\u0c02\u0c2a\u0c4d\u0c30\u0c26\u0c3f\u0c02\u0c2a\u0c41",
  "open-maps": "Google Maps",
  "email-us": "Email"
};

export function chromeLabel(lang: UiLang, key: string, fallback?: string): string {
  const table = lang === "te" ? CHROME_TE : CHROME_EN;
  return table[key] || CHROME_EN[key] || fallback || key;
}

export function readStoredUiLang(): UiLang {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(UI_LANG_KEY);
    return v === "te" ? "te" : "en";
  } catch {
    return "en";
  }
}

export function writeStoredUiLang(lang: UiLang) {
  try {
    localStorage.setItem(UI_LANG_KEY, lang);
    document.documentElement.lang = lang === "te" ? "te" : "en";
    document.documentElement.dataset.uiLang = lang;
  } catch {
    /* ignore */
  }
}
