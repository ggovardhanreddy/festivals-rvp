"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  chromeLabel,
  readStoredUiLang,
  writeStoredUiLang,
  type UiLang,
} from "@/lib/i18n-chrome";

type Ctx = {
  lang: UiLang;
  setLang: (lang: UiLang) => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (key, fallback) => chromeLabel("en", key, fallback),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<UiLang>("en");

  useEffect(() => {
    const stored = readStoredUiLang();
    setLangState(stored);
    writeStoredUiLang(stored);
  }, []);

  const setLang = (next: UiLang) => {
    setLangState(next);
    writeStoredUiLang(next);
  };

  const t = (key: string, fallback?: string) => chromeLabel(lang, key, fallback);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useUiLang() {
  return useContext(LanguageContext);
}
