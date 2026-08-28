/**
 * Speech synthesis for the children's sections.
 *
 * The browser's own voices, feature-detected. Two things this module refuses
 * to do, both for the same reason — a child learning to read must not be
 * taught a wrong sound:
 *
 *  - It never falls back to an English voice for Telugu. If the device has no
 *    Telugu voice, `voiceFor("te")` returns null and the caller renders no
 *    speaker button rather than reading Telugu letters in an English accent.
 *  - It never claims to have spoken. `speak()` resolves with whether the
 *    utterance actually started, so the UI can show the real state.
 *
 * Voice availability is a device fact, not a site fact: the same page has
 * Telugu speech on one phone and not on another, and saying so honestly is
 * better than a button that does nothing.
 */
import { LOCALE_TAG, type Locale } from "@/lib/i18n/config";

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Voices load asynchronously in most browsers, and `getVoices()` is empty on
 * the first call. Callers subscribe rather than poll.
 */
export function onVoicesReady(cb: () => void): () => void {
  if (!speechSupported()) return () => {};
  const synth = window.speechSynthesis;
  if (synth.getVoices().length) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  synth.addEventListener("voiceschanged", handler);
  return () => synth.removeEventListener("voiceschanged", handler);
}

/** Best available voice for a locale, or null when the device has none. */
export function voiceFor(locale: Locale): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const tag = LOCALE_TAG[locale].toLowerCase();
  const lang = tag.split("-")[0]!;

  // Exact region first (te-IN, en-IN), then any voice of that language.
  return (
    voices.find((v) => v.lang.toLowerCase() === tag) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(`${lang}-`)) ??
    voices.find((v) => v.lang.toLowerCase() === lang) ??
    null
  );
}

export type SpeakOptions = {
  locale?: Locale;
  /** Slower than conversational: this is a child hearing a letter. */
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
};

/**
 * Speak a phrase. Resolves true only if an utterance actually started.
 *
 * Cancels anything already speaking, so a child tapping letters quickly hears
 * the letter they just tapped rather than a queue of the previous five.
 */
export function speak(textToSay: string, options: SpeakOptions = {}): boolean {
  if (!speechSupported() || !textToSay.trim()) return false;
  const locale = options.locale ?? "en";
  const voice = voiceFor(locale);
  if (!voice) return false;

  const synth = window.speechSynthesis;
  try {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSay);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 1.05;
    if (options.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (speechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* nothing to cancel */
    }
  }
}
