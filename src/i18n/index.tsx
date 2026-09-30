import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Translation } from "./translations";
import { useLocation, useNavigate } from "react-router-dom";
import { languageFromPath, localePath } from "./paths.mjs";

export type Lang = "es" | "en";

/** Campo de texto localizado (usado en profile.ts). */
export type Localized = { es: string; en: string };

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const lang = languageFromPath(location.pathname);
  function setLang(next: Lang) {
    navigate(localePath(location.pathname, next) + location.search);
  }

  useEffect(() => {
    try { localStorage.setItem("lang", lang); } catch { /* URL is authoritative. */ }
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
