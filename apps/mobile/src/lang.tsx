import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "te";

const dictionary = {
  en: {
    appTitle: "Reddivaripalli",
    switchLabel: "తెలుగు",
    home: "Home",
    history: "Village History",
    people: "People Directory",
    temples: "Temples",
    festivals: "Festival Calendar",
    news: "News",
    gallery: "Gallery",
    developments: "Development Projects",
    contact: "Contact",
  },
  te: {
    appTitle: "రెడ్డివారిపల్లి",
    switchLabel: "English",
    home: "హోమ్",
    history: "గ్రామ చరిత్ర",
    people: "సభ్యుల వివరాలు",
    temples: "దేవాలయాలు",
    festivals: "పండుగల క్యాలెండర్",
    news: "వార్తలు",
    gallery: "గ్యాలరీ",
    developments: "అభివృద్ధి పనులు",
    contact: "సంప్రదింపు",
  },
} as const;

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (k: keyof (typeof dictionary)["en"]) => string;
};

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => dictionary.en[k],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (k: keyof (typeof dictionary)["en"]) => dictionary[lang][k],
    }),
    [lang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
