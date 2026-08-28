"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { Letter } from "@/lib/kids/alphabet";
import { onVoicesReady, speak, stopSpeaking, voiceFor } from "@/lib/speech";
import type { Locale } from "@/lib/i18n/config";

/**
 * One letter at a time, big enough to hit and loud enough to hear.
 *
 * The whole card is the button. A four-year-old should not have to find a
 * small speaker icon — they tap the letter, they hear the letter, they see
 * the picture. Everything else on the page is secondary to that one gesture.
 *
 * Speech is the browser's own, and it is honest about itself: where the
 * device has no voice for this language the speaker is not rendered at all
 * and a line explains why, rather than offering a button that does nothing
 * or — worse — reading Telugu with an English voice.
 */
export function AlphabetPlayer({
  letters,
  locale,
  labelKey,
}: {
  letters: Letter[];
  locale: Locale;
  labelKey: string;
}) {
  const { t } = useUiLang();
  const [index, setIndex] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);

  const letter = letters[index];

  useEffect(() => {
    const check = () => setHasVoice(voiceFor(locale) !== null);
    check();
    const off = onVoicesReady(check);
    return () => {
      off();
      stopSpeaking();
    };
  }, [locale]);

  /**
   * "A. A for Apple." — the letter alone first, then in a word, which is how
   * the sound is taught. Telugu says the letter and then the example word;
   * "for" has no natural equivalent worth forcing.
   */
  const phrase = useCallback(
    (l: Letter): string => {
      if (!l) return "";
      if (locale === "te") {
        return l.example ? `${l.glyph}. ${l.example}.` : `${l.glyph}.`;
      }
      return l.example ? `${l.glyph}. ${l.glyph} for ${l.example}.` : `${l.glyph}.`;
    },
    [locale],
  );

  const say = useCallback(
    (l: Letter | undefined) => {
      if (!l) return;
      setPulse(true);
      window.setTimeout(() => setPulse(false), 320);
      const started = speak(phrase(l), {
        locale,
        rate: 0.75,
        onEnd: () => setSpeaking(false),
      });
      setSpeaking(started);
      if (!started) setHasVoice(false);
    },
    [locale, phrase],
  );

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = (i + delta + letters.length) % letters.length;
        return next;
      });
    },
    [letters.length],
  );

  // Speak whenever the letter changes by navigation, so a child moving with
  // the arrows hears each one without a second tap.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    say(letters[index]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!letter) return null;

  return (
    <div className="abc">
      <p className="abc-count" aria-hidden>
        {index + 1} / {letters.length}
      </p>

      <button
        ref={cardRef}
        type="button"
        className={`abc-card${pulse ? " is-tapped" : ""}`}
        onClick={() => say(letter)}
        aria-label={t("kids.abc.tapToHear", undefined, { letter: letter.glyph })}
      >
        <span className="abc-glyph" lang={locale}>
          {locale === "en" ? (
            <>
              {letter.glyph}
              <span className="abc-glyph-lower">{letter.glyph.toLowerCase()}</span>
            </>
          ) : (
            letter.glyph
          )}
        </span>

        {letter.emoji ? (
          <span className="abc-picture" role="img" aria-label={letter.example ?? ""}>
            {letter.emoji}
          </span>
        ) : null}

        {letter.example ? (
          <span className="abc-word" lang={locale}>
            {letter.example}
            {letter.exampleGloss ? (
              <span className="abc-gloss">{letter.exampleGloss}</span>
            ) : null}
          </span>
        ) : (
          <span className="abc-roman">{letter.roman}</span>
        )}
      </button>

      <div className="abc-controls">
        <button
          type="button"
          className="abc-nav"
          onClick={() => go(-1)}
          aria-label={t("common.previous")}
        >
          <ChevronLeft size={30} aria-hidden />
        </button>

        {hasVoice === false ? (
          <p className="abc-novoice">{t("kids.abc.noVoice")}</p>
        ) : (
          <button
            type="button"
            className={`abc-speak${speaking ? " is-speaking" : ""}`}
            onClick={() => say(letter)}
            aria-label={t("kids.abc.listen")}
          >
            <Volume2 size={30} aria-hidden />
            <span>{t("kids.abc.listen")}</span>
          </button>
        )}

        <button
          type="button"
          className="abc-nav"
          onClick={() => go(1)}
          aria-label={t("common.next")}
        >
          <ChevronRight size={30} aria-hidden />
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {t(labelKey)} — {letter.glyph} {letter.example ?? ""}
      </p>

      <ol className="abc-strip" aria-label={t(labelKey)}>
        {letters.map((l, i) => (
          <li key={`${l.glyph}-${i}`}>
            <button
              type="button"
              className={`abc-chip${i === index ? " is-active" : ""}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              lang={locale}
            >
              {l.glyph}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
