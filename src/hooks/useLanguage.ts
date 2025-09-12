import { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };

  const t = (key: keyof typeof translations.en) => {
    return translations[currentLanguage][key] || translations.en[key];
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};