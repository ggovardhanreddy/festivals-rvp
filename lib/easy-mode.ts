/**
 * Easy Mode.
 *
 * One switch that makes the whole site easier to read and hit: larger text,
 * stronger contrast, bigger tap targets, no decorative motion. It is aimed at
 * the readers who need it most here — elders reading Telugu on a small phone
 * in daylight — and it is a presentation change only. No content is hidden,
 * no feature is removed, and nothing is dumbed down.
 *
 * The flag lives on <html> so CSS alone can do the work, and in localStorage
 * so it survives navigation. It is applied by an inline script in the layout
 * before first paint, so the page never flashes the normal size first.
 */
export const EASY_MODE_KEY = "rvp-easy-mode";
export const EASY_MODE_ATTR = "data-easy";

export function readEasyMode(): boolean {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(EASY_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

export function applyEasyMode(on: boolean): void {
  if (typeof document === "undefined") return;
  if (on) document.documentElement.setAttribute(EASY_MODE_ATTR, "1");
  else document.documentElement.removeAttribute(EASY_MODE_ATTR);
}

export function setEasyMode(on: boolean): void {
  applyEasyMode(on);
  try {
    localStorage.setItem(EASY_MODE_KEY, on ? "1" : "0");
  } catch {
    /* private mode — the switch still works for this page view */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("rvp:easy-mode", { detail: on }));
  }
}

/**
 * Runs before paint, inlined into <head>. Kept as a string because it must
 * execute synchronously ahead of React, and kept tiny for the same reason.
 */
export const EASY_MODE_BOOT = `try{if(localStorage.getItem('${EASY_MODE_KEY}')==='1')document.documentElement.setAttribute('${EASY_MODE_ATTR}','1')}catch(e){}`;
