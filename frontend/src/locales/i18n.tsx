import React, { createContext, useContext, useState, useEffect } from 'react';
import bnTranslations from './bn.json';
import enTranslations from './en.json';

export type Language = 'bn' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const translations: Record<Language, any> = {
  bn: bnTranslations,
  en: enTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language') as Language;
    return saved === 'en' ? 'en' : 'bn'; // Default to Bangla
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if missing in Bengali
        let fallbackObj = translations.en;
        for (const fbKey of keys) {
          if (fallbackObj && typeof fallbackObj === 'object' && fbKey in fallbackObj) {
            fallbackObj = fallbackObj[fbKey];
          } else {
            return fallback || keyPath;
          }
        }
        return typeof fallbackObj === 'string' ? fallbackObj : (fallback || keyPath);
      }
    }

    return typeof current === 'string' ? current : (fallback || keyPath);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};