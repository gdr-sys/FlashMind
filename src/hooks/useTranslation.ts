/**
 * Custom hook for internationalization.
 * Provides a `t()` function that returns translated strings with interpolation.
 */
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { translations, type TranslationKey } from '../i18n/translations';
import type { Language } from '../types';

/** Detect browser language and map to supported language */
function detectBrowserLanguage(): Language {
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  const supported: Language[] = ['en', 'it', 'es', 'fr', 'de', 'pt'];
  return supported.includes(browserLang as Language) ? (browserLang as Language) : 'en';
}

export function useTranslation() {
  const [language, setLanguage] = useLocalStorage<Language>('flashmind-lang', detectBrowserLanguage());

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text: string = (translations[language]?.[key] as string) || (translations.en[key] as string) || key;
      
      // Interpolate parameters: {count}, {time}, etc.
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(`{${paramKey}}`, String(paramValue));
        });
      }
      
      return text;
    },
    [language]
  );

  return { t, language, setLanguage };
}
