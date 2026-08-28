"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, Mic, X } from "lucide-react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { LOCALE_TAG } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/config";

/**
 * Universal search entry point.
 *
 * Voice uses the browser's own SpeechRecognition. It is feature-detected and
 * the button is not rendered at all where the API is missing, rather than
 * showing a control that does nothing.
 */
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function UniversalSearchBar({
  autoFocus = false,
  size = "large",
}: {
  autoFocus?: boolean;
  size?: "large" | "compact";
}) {
  const router = useRouter();
  const { t, lang } = useUiLang();
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVoiceAvailable(getSpeechRecognition() !== null);
    return () => recognitionRef.current?.stop();
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`${withLocale("/search/", lang)}?q=${encodeURIComponent(q)}`);
  }

  function toggleVoice() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    // te-IN support varies by device; the browser falls back on its own.
    rec.lang = LOCALE_TAG[lang];
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setValue(transcript);
        inputRef.current?.focus();
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  return (
    <form
      className={`usearch usearch--${size}`}
      role="search"
      onSubmit={submit}
      aria-label={t("search.label")}
    >
      <Search className="usearch-icon" size={20} aria-hidden />
      <input
        ref={inputRef}
        type="search"
        className="usearch-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("search.placeholder")}
        aria-label={t("search.label")}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      {value ? (
        <button
          type="button"
          className="usearch-clear"
          onClick={() => { setValue(""); inputRef.current?.focus(); }}
          aria-label={t("search.clear")}
        >
          <X size={18} aria-hidden />
        </button>
      ) : null}
      {voiceAvailable ? (
        <button
          type="button"
          className="usearch-voice"
          data-listening={listening || undefined}
          onClick={toggleVoice}
          aria-label={t("search.voice")}
          aria-pressed={listening}
        >
          <Mic size={20} aria-hidden />
        </button>
      ) : null}
      <button type="submit" className="usearch-submit">
        {t("search.submit")}
      </button>
    </form>
  );
}
