import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translations, type Translation } from "./translations";

export type Lang = "es" | "en";

/** Campo de texto localizado (usado en profile.ts). */
export type Localized = { es: string; en: string };

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function initialLang(): Lang {
  const stored = localStorage.getItem("lang");
  if (stored === "es" || stored === "en") return stored;
  // Español por defecto (audiencia principal LATAM)
  return "es";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: translations[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang debe usarse dentro de LanguageProvider");
  return ctx;
}
