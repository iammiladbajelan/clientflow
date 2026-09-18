"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translations, type TranslationKey } from "@/lib/translations";

interface LocaleContextValue {
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

// The app ships in Persian only; this context keeps the familiar `t("key")`
// API without a second language, so pages need no rewrite of their strings.
export function LocaleProvider({ children }: { children: ReactNode }) {
  function t(key: TranslationKey) {
    return translations[key];
  }

  return (
    <LocaleContext.Provider value={{ t }}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
